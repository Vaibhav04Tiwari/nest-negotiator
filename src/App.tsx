import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AppLayout from "./layouts/AppLayout";
import Calculator from "./pages/Calculator";
import Materials from "./pages/Materials";
import MapPlanning from "./pages/MapPlanning";
import MapEditor from "./pages/MapEditor";
import Marketplace from "./pages/Marketplace";
import Auth from "./pages/Auth";
import LabourRegistration from "./pages/LabourRegistration";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Index />} />
                <Route path="/calculator" element={<Calculator />} />
                <Route path="/materials" element={<Materials />} />
                <Route path="/map-planning" element={<MapPlanning />} />
                <Route path="/map-editor" element={<MapEditor />} />
                <Route path="/marketplace" element={<Marketplace />} />
              </Route>
              <Route path="/auth" element={<Auth />} />
              <Route path="/labour-registration" element={<LabourRegistration />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
