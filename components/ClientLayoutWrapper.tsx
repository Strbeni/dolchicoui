'use client'

import { usePathname } from 'next/navigation'
import Navbar from './navbar'
import Footer from './footer/page'

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

<<<<<<< HEAD
  const hideLayout = ['/login', '/register', '/forgotpassword','/verifyemail']
=======
  const hideLayout = ['/login', '/register', '/forgotpassword', '/verifyemail']
>>>>>>> aaec873f1e4c20249ac11ff3e8b6ba8b908b773a
  const shouldHide = hideLayout.includes(pathname)

  return (
    <>
      {!shouldHide && <Navbar />}
      <main>{children}</main>
      {!shouldHide && <Footer />}
    </>
  )
}
