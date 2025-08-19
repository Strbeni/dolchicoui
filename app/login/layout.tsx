import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Authentication | Dolchi',
  description: 'Sign in or create an account to get started',
}

interface AuthLayoutProps {
  children: React.ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Optional: Add a header with logo */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center">
            {/* Replace with your logo */}
            <div className="text-2xl font-bold text-[#d9673f]">
              Dolchi
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="relative z-0">
        {children}
      </main>
    </div>
  )
}
