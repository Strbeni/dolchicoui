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
  useAuthInit();
  useWishlistInit();
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
