import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from 'react';
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Marketplace from "./pages/Marketplace";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Lazy load DeckBuilder to isolate potential errors
const DeckBuilder = lazy(() => import("./pages/DeckBuilder"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/deck/:deckId" element={<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}><DeckBuilder /></Suspense>} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/checkout-success" element={<CheckoutSuccess />} />
          <Route path="/settings" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
