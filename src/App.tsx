import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import CookieConsent from "@/components/CookieConsent";

// Eager load the landing page for fast initial render
import Index from "./pages/Index";

// Lazy load all other routes
const Auth = lazy(() => import("./pages/Auth"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DeckBuilder = lazy(() => import("./pages/DeckBuilder"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const CheckoutSuccess = lazy(() => import("./pages/CheckoutSuccess"));
const Settings = lazy(() => import("./pages/Settings"));
const Quiz = lazy(() => import("./pages/Quiz"));
const Quiz2 = lazy(() => import("./pages/Quiz2"));
const AdminEmails = lazy(() => import("./pages/AdminEmails"));
const AdminABAnalytics = lazy(() => import("./pages/AdminABAnalytics"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const Terms = lazy(() => import("./pages/Terms"));
const CommunitySplitter = lazy(() => import("./components/community/CommunitySplitter"));
const Community2 = lazy(() => import("./pages/Community2"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <CookieConsent />
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/deck/:deckId" element={<DeckBuilder />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/checkout-success" element={<CheckoutSuccess />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/quiz2" element={<Quiz2 />} />
              <Route path="/admin/emails" element={<AdminEmails />} />
              <Route path="/admin/ab-analytics" element={<AdminABAnalytics />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/cookies" element={<CookiePolicy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/community" element={<CommunitySplitter />} />
              <Route path="/community2" element={<Community2 />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
