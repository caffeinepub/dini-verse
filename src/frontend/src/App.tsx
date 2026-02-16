import { RouterProvider, createRouter, createRootRoute, createRoute } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import Discover from './pages/Discover';
import ExperienceDetails from './pages/ExperienceDetails';
import Profile from './pages/Profile';
import SignUp from './pages/SignUp';
import AvatarShop from './pages/AvatarShop';
import Create from './pages/Create';
import DiniBucks from './pages/DiniBucks';
import Inventory from './pages/Inventory';
import Groups from './pages/Groups';
import Settings from './pages/Settings';
import Social from './pages/Social';
import { Toaster } from '@/components/ui/sonner';

const rootRoute = createRootRoute({
  component: AppLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
});

const discoverRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/discover',
  component: Discover,
});

const experienceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/experience/$experienceId',
  component: ExperienceDetails,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: Profile,
});

const signUpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  component: SignUp,
});

const avatarShopRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/avatar-shop',
  component: AvatarShop,
});

const createRoute_ = createRoute({
  getParentRoute: () => rootRoute,
  path: '/create',
  component: Create,
});

const diniBucksRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dini-bucks',
  component: DiniBucks,
});

const inventoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/inventory',
  component: Inventory,
});

const groupsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/groups',
  component: Groups,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: Settings,
});

const socialRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/social',
  component: Social,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  discoverRoute,
  experienceRoute,
  profileRoute,
  signUpRoute,
  avatarShopRoute,
  createRoute_,
  diniBucksRoute,
  inventoryRoute,
  groupsRoute,
  settingsRoute,
  socialRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
