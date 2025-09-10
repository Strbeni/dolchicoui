import { Suspense } from "react"
import { RefreshCw } from "lucide-react"
import VerifyEmailClient from "./VerifyEmailClient"

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin w-8 h-8">
            <RefreshCw className="w-8 h-8 text-[#ff6b35]" />
          </div>
        </div>
      }
    >
      <VerifyEmailClient />
    </Suspense>
  )
}
