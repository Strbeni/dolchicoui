"use client"

import type React from "react"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, RefreshCw } from "lucide-react"
import DolchiLogo from "@/components/DolchiLogo"

function VerifyEmailClient() {
  const [status, setStatus] = useState<"idle" | "loading" | "verified" | "invalid" | "error">("idle")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [otpBoxes, setOtpBoxes] = useState<string[]>(["", "", "", "", "", ""])
  const otpRefs = useState<Array<HTMLInputElement | null>>([])[0]
  const [message, setMessage] = useState("")
  const [resendCooldown, setResendCooldown] = useState(0)

  const searchParams = useSearchParams()
  const router = useRouter()

  // Cooldown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => prev - 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [resendCooldown])

  useEffect(() => {
    const urlToken = searchParams.get("token")
    const urlEmail = searchParams.get("email")

    if (urlEmail) {
      setEmail(urlEmail)
    }

    if (!urlToken) {
      setStatus("invalid")
      setMessage("Verification token not found in URL. Please check your email link.")
      return
    }

    const verifyToken = async () => {
      setStatus("loading")
      setMessage("")

      try {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://valyris-i.onrender.com"

        console.log(`[v0] Environment variable NEXT_PUBLIC_API_BASE_URL:`, process.env.NEXT_PUBLIC_API_BASE_URL)
        console.log(`[v0] Verifying token:`, urlToken)
        console.log(`[v0] Using API base URL:`, API_BASE_URL)

        const res = await fetch(`${API_BASE_URL}/api/user/verify-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: urlToken }),
        })

        console.log(`[v0] Token verification response status:`, res.status)
        console.log(`[v0] Token verification response headers:`, Object.fromEntries(res.headers.entries()))

        let data
        try {
          const responseText = await res.text()
          console.log(`[v0] Raw response text:`, responseText)

          if (!responseText) {
            throw new Error("Empty response from server")
          }

          if (responseText.trim().startsWith("<!DOCTYPE") || responseText.trim().startsWith("<html")) {
            console.error(`[v0] Server returned HTML instead of JSON:`, responseText.substring(0, 200))
            throw new Error(
              "Server error: The verification endpoint is not available. Please try again later or contact support.",
            )
          }

          data = JSON.parse(responseText)
          console.log(`[v0] Parsed response data:`, data)
        } catch (jsonErr) {
          console.error(`[v0] JSON parsing error:`, jsonErr)
          if (jsonErr instanceof SyntaxError) {
            throw new Error("Server returned invalid response format. Please try again or contact support.")
          }
          throw new Error("Invalid server response. Please try again.")
        }

        if (!res.ok) {
          console.error(`[v0] Verification API error:`, res.status, data)
          if (res.status === 404) {
            throw new Error("Verification endpoint not found. Please check your email link or contact support.")
          } else if (res.status === 500) {
            throw new Error("Server error occurred. Please try again later.")
          }
          throw new Error(data?.message || `Verification failed (${res.status}). Please try again.`)
        }

        if (!data.success) {
          throw new Error(data?.message || "Email verification failed")
        }

        console.log(`[v0] Email verified successfully`)
        setStatus("verified")
        setMessage("Email verified successfully!")

        // Redirect after 2 seconds
        setTimeout(() => router.push("/login"), 2000)
      } catch (err) {
        console.error(`[v0] Token verification error:`, err)
        setStatus("invalid")
        if (err instanceof Error) {
          setMessage(err.message)
        } else {
          setMessage("An unexpected error occurred during verification")
        }
      }
    }

    verifyToken()
  }, [searchParams, router])

  const handleResendToken = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email || !emailRegex.test(email)) {
      setMessage("Please enter a valid email address.")
      return
    }

    if (resendCooldown > 0) {
      setMessage(`Please wait ${resendCooldown} seconds before requesting another token.`)
      return
    }

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://valyris-i.onrender.com"

      console.log(`[v0] Environment variable NEXT_PUBLIC_API_BASE_URL:`, process.env.NEXT_PUBLIC_API_BASE_URL)
      console.log(`[v0] Resending verification token to:`, email)
      console.log(`[v0] Using API base URL:`, API_BASE_URL)

      const res = await fetch(`${API_BASE_URL}/api/user/resend-verification-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      console.log(`[v0] Resend token response status:`, res.status)
      console.log(`[v0] Resend token response headers:`, Object.fromEntries(res.headers.entries()))

      let data
      try {
        const responseText = await res.text()
        console.log(`[v0] Raw response text:`, responseText)

        if (!responseText) {
          throw new Error("Empty response from server")
        }

        if (responseText.trim().startsWith("<!DOCTYPE") || responseText.trim().startsWith("<html")) {
          console.error(`[v0] Server returned HTML instead of JSON:`, responseText.substring(0, 200))
          throw new Error(
            "Server error: The resend token endpoint is not available. Please try again later or contact support.",
          )
        }

        data = JSON.parse(responseText)
        console.log(`[v0] Parsed response data:`, data)
      } catch (jsonErr) {
        console.error(`[v0] JSON parsing error:`, jsonErr)
        if (jsonErr instanceof SyntaxError) {
          throw new Error("Server returned invalid response format. Please try again or contact support.")
        }
        throw new Error("Invalid server response. Please try again.")
      }

      if (!res.ok) {
        console.error(`[v0] Resend token API error:`, res.status, data)
        if (res.status === 404) {
          throw new Error("Resend token endpoint not found. Please contact support.")
        } else if (res.status === 500) {
          throw new Error("Server error occurred. Please try again later.")
        }
        throw new Error(data?.message || `Failed to resend token (${res.status}). Please try again.`)
      }

      if (!data.success) {
        throw new Error(data?.message || "Failed to resend verification token")
      }

      console.log(`[v0] Verification token resent successfully`)
      setMessage("A new verification token has been sent to your email.")
      setResendCooldown(24)
    } catch (err) {
      console.error(`[v0] Resend token error:`, err)
      if (err instanceof Error) {
        setMessage(err.message)
      } else {
        setMessage("Failed to resend verification token. Please try again.")
      }
    }
  }

  const handleVerifyOtp = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email || !emailRegex.test(email)) {
      setMessage("Please enter a valid email address.")
      return
    }

    if (!otp || otp.length !== 6 || !/^\d{6}$/.test(otp)) {
      setMessage("Please enter a valid 6-digit OTP.")
      return
    }

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://valyris-i.onrender.com"

      console.log(`[v0] Environment variable NEXT_PUBLIC_API_BASE_URL:`, process.env.NEXT_PUBLIC_API_BASE_URL)
      console.log(`[v0] Verifying OTP for:`, email)
      console.log(`[v0] Using API base URL:`, API_BASE_URL)

      const res = await fetch(`${API_BASE_URL}/api/user/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      })

      console.log(`[v0] OTP verification response status:`, res.status)
      console.log(`[v0] OTP verification response headers:`, Object.fromEntries(res.headers.entries()))

      let data
      try {
        const responseText = await res.text()
        console.log(`[v0] Raw response text:`, responseText)

        if (!responseText) {
          throw new Error("Empty response from server")
        }

        if (responseText.trim().startsWith("<!DOCTYPE") || responseText.trim().startsWith("<html")) {
          console.error(`[v0] Server returned HTML instead of JSON:`, responseText.substring(0, 200))
          throw new Error(
            "Server error: The OTP verification endpoint is not available. Please try again later or contact support.",
          )
        }

        data = JSON.parse(responseText)
        console.log(`[v0] Parsed response data:`, data)
      } catch (jsonErr) {
        console.error(`[v0] JSON parsing error:`, jsonErr)
        if (jsonErr instanceof SyntaxError) {
          throw new Error("Server returned invalid response format. Please try again or contact support.")
        }
        throw new Error("Invalid server response. Please try again.")
      }

      if (!res.ok) {
        console.error(`[v0] OTP verification API error:`, res.status, data)
        if (res.status === 404) {
          throw new Error("OTP verification endpoint not found. Please contact support.")
        } else if (res.status === 500) {
          throw new Error("Server error occurred. Please try again later.")
        }
        throw new Error(data?.message || `OTP verification failed (${res.status}). Please try again.`)
      }

      if (!data.success) {
        throw new Error(data?.message || "OTP verification failed")
      }

      console.log(`[v0] OTP verified successfully`)
      setStatus("verified")
      setMessage("Email verified successfully!")

      // Redirect after 2 seconds
      setTimeout(() => router.push("/login"), 2000)
    } catch (err) {
      console.error(`[v0] OTP verification error:`, err)
      if (err instanceof Error) {
        setMessage(err.message)
      } else {
        setMessage("OTP verification failed. Please try again.")
      }
    }
  }

  // OTP box handlers
  const handleOtpBoxChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(0, 1)
    const next = [...otpBoxes]
    next[index] = digit
    setOtpBoxes(next)
    setOtp(next.join(""))
    if (digit && otpRefs[index + 1]) otpRefs[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpBoxes[index] && otpRefs[index - 1]) otpRefs[index - 1]?.focus()
  }

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
    const next = ["", "", "", "", "", ""]
    for (let i = 0; i < text.length; i++) next[i] = text[i]
    setOtpBoxes(next)
    setOtp(text)
  }

  return (
    <div className="min-h-screen flex">
      {/* Desktop Left Side - Hero Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image src="/banner.svg" alt="Fashion Models" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 flex flex-col justify-center px-14 text-white">
          <DolchiLogo className="h-12 w-auto mb-6" width={160} height={52} />
          <h1 className="text-5xl font-semibold leading-tight max-w-xl">
            Fashion Moves Fast
            <br /> Stay Ahead
          </h1>
          <p className="mt-6 text-lg max-w-lg opacity-90">
            Discover fashion that reflects your values and your style. Sustainably sourced, thoughtfully designed,
            endlessly stylish.
          </p>
        </div>
      </div>

      {/* Right Side - Form Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header with Logo */}
        <div className="lg:hidden p-0 text-center">
          <div className="relative h-40 w-full overflow-hidden">
            <Image src="/banner.svg" alt="Welcome" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-white">
              <Link href="/home" aria-label="Go to Home">
                <DolchiLogo className="h-8 w-auto" width={120} height={40} />
              </Link>
              <p className="text-white text-base font-medium">Welcome to the DOLCHI</p>
              <p className="text-white/80 text-xs">One Account. Endless Style.</p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md space-y-6">
            {/* Desktop Logo */}
            <div className="hidden lg:block text-center mb-8">
              <Link href="/home" aria-label="Go to Home">
                <DolchiLogo className="h-10 w-auto mx-auto mb-4" width={120} height={40} />
              </Link>
              <h1 className="text-gray-600 text-lg">Welcome to the DOLCHI</h1>
              <p className="text-gray-500 text-sm">One Account. Endless Style.</p>
            </div>

            {/* Content based on status */}
            {status === "loading" && (
              <div className="text-center space-y-4">
                <div className="animate-spin mx-auto w-8 h-8">
                  <RefreshCw className="w-8 h-8 text-[#ff6b35]" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Verifying...</h2>
                <p className="text-gray-600">Please wait while we verify your email.</p>
              </div>
            )}

            {status === "verified" && (
              <div className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Email Verified!</h2>
                <p className="text-green-600">Email verified successfully! Redirecting to login...</p>
                <Button
                  onClick={() => router.push("/login")}
                  className="w-full h-12 bg-[#ff6b35] hover:bg-[#e55a2b] text-white font-medium rounded-lg"
                >
                  Go to Login
                </Button>
              </div>
            )}

            {status === "invalid" && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify your email</h2>
                  <p className="text-sm text-gray-600">Enter OTP send on your email for reset password</p>
                </div>

                {message && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                    {message}
                  </div>
                )}

                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="text-[#ff6b35] font-medium">{email || "sujalbendre2526@gmail.com"}</span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Verification code</label>
                    <div className="flex items-center gap-3" onPaste={handleOtpPaste}>
                      {otpBoxes.map((val, idx) => (
                        <Input
                          key={idx}
                          ref={(el) => {
                            otpRefs[idx] = el
                          }}
                          inputMode="numeric"
                          pattern="[0-9]*"
                          className="w-12 h-12 text-center text-lg"
                          value={val}
                          onChange={(e) => handleOtpBoxChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          maxLength={1}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Please enter the one-time password sent to your phone.</p>
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendToken}
                      disabled={resendCooldown > 0}
                      className="text-[#ff6b35] hover:underline text-sm disabled:text-gray-400 disabled:no-underline"
                    >
                      {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
                    </button>
                  </div>

                  <Button
                    onClick={handleVerifyOtp}
                    disabled={otp.length !== 6}
                    className="w-full h-12 bg-[#ff6b35] hover:bg-[#e55a2b] text-white font-medium rounded-lg"
                  >
                    Continue
                  </Button>

                  <div className="space-y-2">
                    <Input
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    <Button
                      onClick={handleResendToken}
                      variant="outline"
                      className="w-full h-12 border-[#ff6b35] text-[#ff6b35] hover:bg-[#ff6b35] hover:text-white bg-transparent"
                    >
                      Regenerate Token
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold text-gray-800">Something went wrong</h2>
                <p className="text-red-600">Something went wrong. Please try again later.</p>
                <Button
                  onClick={() => window.location.reload()}
                  className="w-full h-12 bg-[#ff6b35] hover:bg-[#e55a2b] text-white font-medium rounded-lg"
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

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
