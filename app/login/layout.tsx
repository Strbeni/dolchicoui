import type { Metadata } from 'next'
import DolchiLogo from '@/components/DolchiLogo'
import Link from 'next/link'
export const metadata: Metadata = {
  title: 'Authentication | Dolchi',
  description: 'Sign in or create an account to get started',
}

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white mt-[-12px] md:mt-0">
      {/* Optional: Add a header with logo */}
      <div className="absolute top-0 left-0 right-0 z-10 p-3">
    <Link href="/">
    <DolchiLogo className="h-12 w-auto mb-6" width={100} height={52} />
    </Link>

      </div>

      {/* Main content */}
      <main className="relative z-0">
        {children}
      </main>
    </div>
  )
}
