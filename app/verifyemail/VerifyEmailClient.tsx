"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function VerifyEmailClient() {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const searchParams = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    const urlToken = searchParams.get("token")
    if (!urlToken) {
      setError("Verification token not found in URL. Please check your email link.")
      return
    }

    const verifyToken = async () => {
      setLoading(true)
      setError("")

      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://valyris-i.onrender.com"

        console.log(`[v0] Environment variable NEXT_PUBLIC_API_BASE_URL:`, process.env.NEXT_PUBLIC_API_BASE_URL)
        console.log(`[v0] Verifying email token:`, urlToken)
        console.log(`[v0] Using API base URL:`, API_BASE_URL)

        const res = await fetch(`${API_BASE_URL}/api/user/verify-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: urlToken }),
        })

        console.log(`[v0] Verify email response status:`, res.status)
        console.log(`[v0] Verify email response headers:`, Object.fromEntries(res.headers.entries()))

        let data
        try {
          const responseText = await res.text()
          console.log(`[v0] Raw response text:`, responseText)

          if (!responseText) {
            throw new Error("Empty response from server")
          }

          data = JSON.parse(responseText)
          console.log(`[v0] Parsed response data:`, data)
        } catch (jsonErr) {
          console.error(`[v0] JSON parsing error:`, jsonErr)
          throw new Error("Invalid server response. Please try again.")
        }

        if (!res.ok) {
          console.error(`[v0] Verification API error:`, res.status, data)
          throw new Error(data?.message || `Verification failed (${res.status}). Please try again.`)
        }

        if (!data.success) {
          throw new Error(data?.message || "Email verification failed")
        }

        console.log(`[v0] Email verified successfully`)
        setSuccess(true)
        setTimeout(() => router.push("/login"), 2000)
      } catch (err) {
        console.error(`[v0] Email verification error:`, err)
        setError(err instanceof Error ? err.message : "An unexpected error occurred during verification")
      } finally {
        setLoading(false)
      }
    }

    verifyToken()
  }, [searchParams, router])

  return (
    <div className="max-w-md w-full mx-auto space-y-6">
      <h2 className="text-4xl font-bold text-gray-800">VERIFY EMAIL</h2>

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">Email verified successfully! Redirecting to login...</p>}

      {!success && (
        <Button
          type="button"
          disabled
          className="w-full bg-[#d9673f] text-white text-sm tracking-widest opacity-70 cursor-not-allowed"
        >
          {loading ? "Verifying..." : "VERIFY EMAIL"}
          <ArrowRight className="ml-2" />
        </Button>
      )}
    </div>
  )
}
