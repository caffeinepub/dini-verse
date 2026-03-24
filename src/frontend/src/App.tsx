import { Toaster } from "@/components/ui/sonner";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import AppLayout from "./components/layout/AppLayout";
import { TranslationProvider } from "./contexts/TranslationContext";
import AvatarShop from "./pages/AvatarShop";
import Create from "./pages/Create";
import CreateGamesBuilder2D from "./pages/CreateGamesBuilder2D";
import CreateUGCAccessories from "./pages/CreateUGCAccessories";
import DiniBucks from "./pages/DiniBucks";
import Discover from "./pages/Discover";
import ExperienceDetails from "./pages/ExperienceDetails";
import Groups from "./pages/Groups";
import Home from "./pages/Home";
import Inventory from "./pages/Inventory";
import Login from "./pages/Login";
import People from "./pages/People";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import Settings from "./pages/Settings";
import SignUp from "./pages/SignUp";
import Social from "./pages/Social";

const rootRoute = createRootRoute({
  component: AppLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});

const discoverRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/discover",
  component: Discover,
});

const experienceDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/experience/$id",
  component: ExperienceDetails,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: Profile,
});

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/signup",
  component: SignUp,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: Login,
});

const avatarShopRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/avatar-shop",
  component: AvatarShop,
});

const createRoute_ = createRoute({
  getParentRoute: () => rootRoute,
  path: "/create",
  component: Create,
});

const diniBucksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dini-bucks",
  component: DiniBucks,
});

const inventoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/inventory",
  component: Inventory,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: Settings,
});

const socialRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/social",
  component: Social,
});

const groupsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/groups",
  component: Groups,
});

const createGamesBuilder2DRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/create/games-builder-2d",
  component: CreateGamesBuilder2D,
});

const createUGCAccessoriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/create/ugc-accessories",
  component: CreateUGCAccessories,
});

const peopleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/people",
  component: People,
});

const publicProfileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/people/$username",
  component: PublicProfile,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  discoverRoute,
  experienceDetailsRoute,
  profileRoute,
  signupRoute,
  loginRoute,
  avatarShopRoute,
  createRoute_,
  diniBucksRoute,
  inventoryRoute,
  settingsRoute,
  socialRoute,
  groupsRoute,
  createGamesBuilder2DRoute,
  createUGCAccessoriesRoute,
  peopleRoute,
  publicProfileRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TranslationProvider>
        <RouterProvider router={router} />
        <Toaster />
      </TranslationProvider>
    </ThemeProvider>
  );
}
