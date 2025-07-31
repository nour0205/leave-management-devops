import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HRProvider } from "./contexts/HRContext";
import { Layout } from "./components/Layout";
import { LoginPage } from "./components/LoginPage";
import { PrivateRoute } from "./components/PrivateRoute";
import Dashboard from "./pages/Dashboard";
import RequestLeave from "./pages/RequestLeave";
import Approvals from "./pages/Approvals";
import NotFound from "./pages/NotFound";
import AuditLogs from "./pages/AuditLogs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <HRProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/" 
              element={
                <PrivateRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/request-leave" 
              element={
                <PrivateRoute>
                  <Layout>
                    <RequestLeave />
                  </Layout>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/approvals" 
              element={
                <PrivateRoute>
                  <Layout>
                    <Approvals />
                  </Layout>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/my-requests" 
              element={
                <PrivateRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/team" 
              element={
                <PrivateRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </PrivateRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
          </Routes>
        </BrowserRouter>
      </HRProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;