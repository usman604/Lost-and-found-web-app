import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import LoginPage from "@/pages/login";
import SignupPage from "@/pages/signup";
import Dashboard from "@/pages/dashboard";
import LostItems from "@/pages/lost-items";
import FoundItems from "@/pages/found-items";
import ItemDetail from "@/pages/item-detail";
import NewItem from "@/pages/new-item";
import AdminPage from "@/pages/admin";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  if (requireAdmin && user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/lost">
        <ProtectedRoute>
          <LostItems />
        </ProtectedRoute>
      </Route>
      <Route path="/found">
        <ProtectedRoute>
          <FoundItems />
        </ProtectedRoute>
      </Route>
      <Route path="/lost/:id">
        {(params) => (
          <ProtectedRoute>
            <ItemDetail type="lost" id={params.id} />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/found/:id">
        {(params) => (
          <ProtectedRoute>
            <ItemDetail type="found" id={params.id} />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/report/lost">
        <ProtectedRoute>
          <NewItem type="lost" />
        </ProtectedRoute>
      </Route>
      <Route path="/report/found">
        <ProtectedRoute>
          <NewItem type="found" />
        </ProtectedRoute>
      </Route>
      <Route path="/admin">
        <ProtectedRoute requireAdmin>
          <AdminPage />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
