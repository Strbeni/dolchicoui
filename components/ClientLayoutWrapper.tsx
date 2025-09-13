'use client';

import { usePathname } from 'next/navigation';
import Navbar from './navbar';
import Footer from './footer/page';
import { ReduxProvider } from './ReduxProvider';
import { LoadingProvider } from '@/contexts/LoadingContext';
import { NavbarCountsProvider } from '@/contexts/NavbarCountsContext';
import { useAuthInit } from '@/hooks/useAuthInit';
import { useWishlistInit } from '@/hooks/useWishlistInit';

function AuthInitializer() {
  const { authInitialized, userLoading } = useAuthInit();
  useWishlistInit();
  // Show a minimal loading state while auth is initializing
  // Only show loading on routes that need authentication
  const pathname = usePathname();
  const protectedRoutes = ['/account', '/cartpage', '/checkout', '/admin'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (!authInitialized && isProtectedRoute) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-[#d9673f] border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-700 font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  return null;
}

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // List of routes that should NOT show Navbar and Footer
  const hideLayout = ['/login', '/register', '/forgotpassword', '/verifyemail'];
  const shouldHide = hideLayout.includes(pathname);

  return (
    <ReduxProvider>
      <LoadingProvider>
        <NavbarCountsProvider>
          <AuthInitializer />
          {!shouldHide && <Navbar />}
          <main>{children}</main>
          {!shouldHide && <Footer />}
        </NavbarCountsProvider>
      </LoadingProvider>
    </ReduxProvider>
  );
}
