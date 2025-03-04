import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import UserBalance from "@/pages/user-balance";
import RouteSearch from "@/pages/route-search";
import Stations from "@/pages/stations";
import DriverDashboard from "@/pages/driver-dashboard";
import CashierDashboard from "@/pages/cashier-dashboard";
import { BottomNav } from "./components/ui/bottom-nav";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/balance" component={UserBalance} />
      <ProtectedRoute path="/routes" component={RouteSearch} />
      <ProtectedRoute path="/stations" component={Stations} />
      <ProtectedRoute path="/driver" component={DriverDashboard} />
      <ProtectedRoute path="/cashier" component={CashierDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="pb-16">
          <Router />
          <BottomNav />
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
