import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/hooks/useAuth";
import { CompareProvider } from "@/components/compare/CompareContext";
import { CompareBar } from "@/components/compare/CompareBar";
import { IncomingCallDialog } from "@/components/calls/IncomingCallDialog";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Sell from "./pages/Sell";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import Call from "./pages/Call";
import CallHistory from "./pages/CallHistory";
import ProductDetail from "./pages/ProductDetail";
import MyProducts from "./pages/MyProducts";
import Favorites from "./pages/Favorites";
import Search from "./pages/Search";
import EditProduct from "./pages/EditProduct";
import Admin from "./pages/Admin";
import SellerProfile from "./pages/SellerProfile";
import Compare from "./pages/Compare";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import { useNotifications } from "./hooks/useNotifications";

const queryClient = new QueryClient();

const OnlineStatusTracker = () => {
  useOnlineStatus();
  useNotifications();
  return null;
};

const CallHandler = () => {
  return <IncomingCallDialog />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <CompareProvider>
          <Toaster />
          <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <OnlineStatusTracker />
            <CallHandler />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/sell" element={<Sell />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/call/:userId" element={<Call />} />
              <Route path="/call-history" element={<CallHistory />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/my-products" element={<MyProducts />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/search" element={<Search />} />
              <Route path="/edit-product/:id" element={<EditProduct />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/seller/:sellerId" element={<SellerProfile />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/install" element={<Install />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <CompareBar />
          </AuthProvider>
        </BrowserRouter>
        </CompareProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
