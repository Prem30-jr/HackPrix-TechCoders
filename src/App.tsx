import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AnimatePresence } from 'framer-motion';
import { ClerkLoaded, ClerkLoading, SignedIn } from "@clerk/clerk-react";
import Index from "./pages/Index";
import Generate from "./pages/Generate";
import Scan from "./pages/Scan";
import Transactions from "./pages/Transactions";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import AuthWrapper from "./components/auth/AuthWrapper";
import SplitBill from "./pages/SplitBill";
import Activity from "./pages/Activity";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatePresence mode="wait">
          <ClerkLoading>
            <div className="h-screen w-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          </ClerkLoading>
          <ClerkLoaded>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/sign-in/*" element={<Auth />} />
              <Route path="/sign-up/*" element={<Auth />} />
              <Route path="/generate" element={<AuthWrapper><Generate /></AuthWrapper>} />
              <Route path="/scan" element={<AuthWrapper><Scan /></AuthWrapper>} />
              <Route path="/transactions" element={<AuthWrapper><Transactions /></AuthWrapper>} />
              <Route path="/profile" element={<AuthWrapper><Profile /></AuthWrapper>} />
              <Route path="/split-bill" element={<AuthWrapper><SplitBill /></AuthWrapper>} />
              <Route path="/activity" element={<AuthWrapper><Activity /></AuthWrapper>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ClerkLoaded>
        </AnimatePresence>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
