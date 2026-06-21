import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import Layout from "@/components/Layout";
import TodayPage from "@/pages/TodayPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import NotFound from "@/pages/not-found";

const OnboardingPage = lazy(() => import("@/pages/OnboardingPage"));
const GamesHub = lazy(() => import("@/pages/GamesHub"));
const GamePlayPage = lazy(() => import("@/pages/GamePlayPage"));
const SubscriptionsPage = lazy(() => import("@/pages/SubscriptionsPage"));
const ProfilePage = lazy(() => import("@/pages/ProfilePage"));
const AchievementsPage = lazy(() => import("@/pages/AchievementsPage"));
const WishlistPage = lazy(() => import("@/pages/WishlistPage"));
const SearchPage = lazy(() => import("@/pages/SearchPage"));
const MarketplacePage = lazy(() => import("@/pages/MarketplacePage"));
const TournamentsPage = lazy(() => import("@/pages/TournamentsPage"));
const FriendsPage = lazy(() => import("@/pages/FriendsPage"));
const VoicePage = lazy(() => import("@/pages/VoicePage"));
const DeveloperPortalPage = lazy(() => import("@/pages/DeveloperPortalPage"));
const PartiesPage = lazy(() => import("@/pages/PartiesPage"));
const GuildsPage = lazy(() => import("@/pages/GuildsPage"));
const ChatPage = lazy(() => import("@/pages/ChatPage"));
const EventsPage = lazy(() => import("@/pages/EventsPage"));
const LeaderboardPage = lazy(() => import("@/pages/LeaderboardPage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const AdminDashboardPage = lazy(() => import("@/pages/AdminDashboardPage"));
const AdminGamesPage = lazy(() => import("@/pages/AdminGamesPage"));
const AdminUsersPage = lazy(() => import("@/pages/AdminUsersPage"));
const AdminSubscriptionsPage = lazy(() => import("@/pages/AdminSubscriptionsPage"));
const AdminReportsPage = lazy(() => import("@/pages/AdminReportsPage"));
const AdminLiveTrackingPage = lazy(() => import("@/pages/AdminLiveTrackingPage"));
const AdminFinancialPage = lazy(() => import("@/pages/AdminFinancialPage"));
const AdminModerationPage = lazy(() => import("@/pages/AdminModerationPage"));
const AdminFraudPage = lazy(() => import("@/pages/AdminFraudPage"));
const AdminServerOpsPage = lazy(() => import("@/pages/AdminServerOpsPage"));
const AdminRootPanelPage = lazy(() => import("@/pages/AdminRootPanelPage"));
const AdminWarRoomPage = lazy(() => import("@/pages/AdminWarRoomPage"));
const AdminNotificationsPage = lazy(() => import("@/pages/AdminNotificationsPage"));
const AdminBusinessIntelligencePage = lazy(() => import("@/pages/AdminBusinessIntelligencePage"));
const AdminFeaturedSystemPage = lazy(() => import("@/pages/AdminFeaturedSystemPage"));

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function AuthRoutes() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/onboarding">
        <Suspense fallback={<PageLoader />}><OnboardingPage /></Suspense>
      </Route>
      <Route>
        <Layout>
          <Suspense fallback={<PageLoader />}>
            <AppRoutes />
          </Suspense>
        </Layout>
      </Route>
    </Switch>
  );
}

function AppRoutes() {
  return (
    <Switch>
      <Route path="/" component={TodayPage} />
<Route path="/games"><GamesHub /></Route>
<Route path="/games/:id"><GamePlayPage /></Route>
      <Route path="/store/subscriptions"><SubscriptionsPage /></Route>
      <Route path="/profile/:id"><ProfilePage /></Route>
      <Route path="/settings"><SettingsPage /></Route>
      <Route path="/achievements"><AchievementsPage /></Route>
      <Route path="/wishlist"><WishlistPage /></Route>
      <Route path="/search"><SearchPage /></Route>
      <Route path="/marketplace"><MarketplacePage /></Route>
      <Route path="/tournaments"><TournamentsPage /></Route>
      <Route path="/friends"><FriendsPage /></Route>
      <Route path="/chat"><ChatPage /></Route>
      <Route path="/guilds"><GuildsPage /></Route>
      <Route path="/parties"><PartiesPage /></Route>
      <Route path="/leaderboard"><LeaderboardPage /></Route>
      <Route path="/events"><EventsPage /></Route>
      <Route path="/voice"><VoicePage /></Route>
      <Route path="/notifications"><NotificationsPage /></Route>
      <Route path="/developer"><DeveloperPortalPage /></Route>
      <Route path="/admin"><AdminDashboardPage /></Route>
      <Route path="/admin/games"><AdminGamesPage /></Route>
      <Route path="/admin/users"><AdminUsersPage /></Route>
      <Route path="/admin/subscriptions"><AdminSubscriptionsPage /></Route>
      <Route path="/admin/reports"><AdminReportsPage /></Route>
      <Route path="/admin/live"><AdminLiveTrackingPage /></Route>
      <Route path="/admin/financial"><AdminFinancialPage /></Route>
      <Route path="/admin/moderation"><AdminModerationPage /></Route>
      <Route path="/admin/fraud"><AdminFraudPage /></Route>
      <Route path="/admin/servers"><AdminServerOpsPage /></Route>
      <Route path="/admin/root"><AdminRootPanelPage /></Route>
      <Route path="/admin/war-room"><AdminWarRoomPage /></Route>
      <Route path="/admin/notifications"><AdminNotificationsPage /></Route>
      <Route path="/admin/ai-insights"><AdminBusinessIntelligencePage /></Route>
      <Route path="/admin/featured"><AdminFeaturedSystemPage /></Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AuthRoutes />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
