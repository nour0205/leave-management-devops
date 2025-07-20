import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HRProvider } from "./contexts/HRContext";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import RequestLeave from "./pages/RequestLeave";
import Approvals from "./pages/Approvals";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <HRProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/request-leave" element={<RequestLeave />} />
              <Route path="/approvals" element={<Approvals />} />
              <Route path="/my-requests" element={<Dashboard />} />
              <Route path="/team" element={<Dashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </HRProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
