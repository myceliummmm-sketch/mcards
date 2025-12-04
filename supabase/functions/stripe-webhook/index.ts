import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-WEBHOOK] ${step}${detailsStr}`);
};

const PRO_PRODUCT_ID = "prod_TX0ugwhZbz8zLD";
const ULTRA_PRODUCT_ID = "prod_TXlKvoG6KH1jD1";
const PRO_MONTHLY_SPORE = 200;
const ULTRA_MONTHLY_SPORE = 500;

serve(async (req) => {
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  
  if (!stripeKey) {
    logStep("ERROR", { message: "STRIPE_SECRET_KEY not set" });
    return new Response("Server configuration error", { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const body = await req.text();
    let event: Stripe.Event;

    if (webhookSecret) {
      const signature = req.headers.get("stripe-signature");
      if (!signature) {
        logStep("ERROR", { message: "No signature provided" });
        return new Response("No signature", { status: 400 });
      }
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // For testing without webhook signature verification
      event = JSON.parse(body);
      logStep("WARNING", { message: "Webhook signature verification skipped" });
    }

    logStep("Event received", { type: event.type, id: event.id });

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.user_id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const tier = session.metadata?.tier || 'pro';

        if (!userId) {
          logStep("ERROR", { message: "No user_id in session metadata" });
          break;
        }

        logStep("Processing checkout completion", { userId, customerId, subscriptionId, tier });

        // Determine SPORE credit based on tier
        const sporeCredit = tier === 'ultra' ? ULTRA_MONTHLY_SPORE : PRO_MONTHLY_SPORE;

        // Update subscription and credit initial SPORE
        const { error: updateError } = await supabaseClient
          .from('user_subscriptions')
          .upsert({
            user_id: userId,
            tier: tier,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            spore_balance: sporeCredit,
            started_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });

        if (updateError) {
          logStep("ERROR updating subscription", { error: updateError });
        } else {
          // Record SPORE transaction
          await supabaseClient.from('spore_transactions').insert({
            user_id: userId,
            amount: sporeCredit,
            transaction_type: 'subscription_credit',
            description: `Initial ${tier.toUpperCase()} subscription SPORE credit`,
            reference_id: subscriptionId,
          });
          logStep("Subscription activated and SPORE credited", { userId, tier, spore: sporeCredit });
        }
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const subscriptionId = invoice.subscription as string;

        // Skip initial subscription invoice (handled by checkout.session.completed)
        if (invoice.billing_reason === "subscription_create") {
          logStep("Skipping initial invoice", { invoiceId: invoice.id });
          break;
        }

        logStep("Processing recurring invoice payment", { customerId, subscriptionId });

        // Find user and their tier by stripe_customer_id
        const { data: subData } = await supabaseClient
          .from('user_subscriptions')
          .select('user_id, spore_balance, tier')
          .eq('stripe_customer_id', customerId)
          .maybeSingle();

        if (subData) {
          // Determine SPORE credit based on tier
          const sporeCredit = subData.tier === 'ultra' ? ULTRA_MONTHLY_SPORE : PRO_MONTHLY_SPORE;
          const newBalance = (subData.spore_balance || 0) + sporeCredit;
          
          await supabaseClient
            .from('user_subscriptions')
            .update({ spore_balance: newBalance })
            .eq('user_id', subData.user_id);

          await supabaseClient.from('spore_transactions').insert({
            user_id: subData.user_id,
            amount: sporeCredit,
            transaction_type: 'subscription_credit',
            description: `Monthly ${subData.tier?.toUpperCase()} subscription SPORE credit`,
            reference_id: subscriptionId,
          });

          logStep("Monthly SPORE credited", { userId: subData.user_id, tier: subData.tier, newBalance });
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        logStep("Processing subscription cancellation", { customerId });

        // Downgrade to free tier
        const { error: downgradeError } = await supabaseClient
          .from('user_subscriptions')
          .update({
            tier: 'free',
            stripe_subscription_id: null,
            expires_at: new Date().toISOString(),
          })
          .eq('stripe_customer_id', customerId);

        if (downgradeError) {
          logStep("ERROR downgrading subscription", { error: downgradeError });
        } else {
          logStep("Subscription downgraded to free");
        }
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
