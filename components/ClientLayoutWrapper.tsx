'use client'

import { usePathname } from 'next/navigation'
import Navbar from './navbar'
import Footer from './footer/page'

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  const hideLayout = ['/login', '/register', '/forgotpassword', '/verifyemail']
  const shouldHide = hideLayout.includes(pathname)

  return (
    <>
      {!shouldHide && <Navbar />}
      <main>{children}</main>
      {!shouldHide && <Footer />}
    </>
  )
}
