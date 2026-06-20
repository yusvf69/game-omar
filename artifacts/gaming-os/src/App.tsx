import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Layout from "@/components/Layout";
import StorePage from "@/pages/StorePage";
import GamesPage from "@/pages/GamesPage";
import GameDetailPage from "@/pages/GameDetailPage";
import SubscriptionsPage from "@/pages/SubscriptionsPage";
import ProfilePage from "@/pages/ProfilePage";
import AchievementsPage from "@/pages/AchievementsPage";
import WishlistPage from "@/pages/WishlistPage";
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import AdminGamesPage from "@/pages/AdminGamesPage";
import AdminUsersPage from "@/pages/AdminUsersPage";
import AdminSubscriptionsPage from "@/pages/AdminSubscriptionsPage";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={StorePage} />
        <Route path="/games" component={GamesPage} />
        <Route path="/games/:id" component={GameDetailPage} />
        <Route path="/store/subscriptions" component={SubscriptionsPage} />
        <Route path="/profile/:id" component={ProfilePage} />
        <Route path="/achievements" component={AchievementsPage} />
        <Route path="/wishlist" component={WishlistPage} />
        <Route path="/admin" component={AdminDashboardPage} />
        <Route path="/admin/games" component={AdminGamesPage} />
        <Route path="/admin/users" component={AdminUsersPage} />
        <Route path="/admin/subscriptions" component={AdminSubscriptionsPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
