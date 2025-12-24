import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { passport_id, email } = await req.json()

    console.log('Updating passport email:', { passport_id, email })

    if (!passport_id || !email) {
      throw new Error('Missing passport_id or email')
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Update passport with email
    const { error: updateError } = await supabase
      .from('passports')
      .update({ email })
      .eq('id', passport_id)

    if (updateError) {
      console.error('Error updating passport:', updateError)
      throw updateError
    }

    console.log('Passport email updated successfully')

    // Also save to leads for marketing
    const { error: leadsError } = await supabase.from('leads').insert({
      email,
      source: 'portal_passport',
    })

    if (leadsError && leadsError.code !== '23505') {
      console.error('Error inserting lead:', leadsError)
      // Don't throw - lead insert is not critical
    } else {
      console.log('Lead inserted successfully')
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error in update-passport-email:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
