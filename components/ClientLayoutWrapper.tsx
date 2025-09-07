'use client';

import { usePathname } from 'next/navigation';
import Navbar from './navbar';
import Footer from './footer/page';
import { ReduxProvider } from './ReduxProvider';

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // List of routes that should NOT show Navbar and Footer
  const hideLayout = ['/login', '/register', '/forgotpassword', '/verifyemail'];
  const shouldHide = hideLayout.includes(pathname);

  return (
    <ReduxProvider>
      {!shouldHide && <Navbar />}
      <main>{children}</main>
      {!shouldHide && <Footer />}
    </ReduxProvider>
  );
}
