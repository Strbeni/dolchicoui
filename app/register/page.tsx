'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [step, setStep] = useState(1)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const router = useRouter()

  const passwordRules = [
    { label: 'Minimum 8 characters', valid: password.length >= 8 },
    { label: 'At least 1 number', valid: /\d/.test(password) },
    { label: '1 uppercase and 1 lowercase letter', valid: /[A-Z]/.test(password) && /[a-z]/.test(password) },
    { label: 'At least 1 symbol', valid: /[^A-Za-z0-9]/.test(password) },
  ]

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
      setError('')
    }
  }

  const handleStepSubmit = () => {
    if (step === 1) {
      if (!firstName || !lastName) return setError('Please enter your full name.')
      setStep(2)
    } else if (step === 2) {
      if (!email) return setError('Please enter your email.')
      setStep(3)
    }

  }

  const handleRegister = async () => {
    setError('')
    setSuccessMsg('')
    if (password !== confirm) return setError('Passwords do not match.')
    if (!passwordRules.every(rule => rule.valid)) return setError('Password does not meet all rules.')

    setLoading(true)
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

    try {
      const res = await fetch(`${API_BASE_URL}/api/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${firstName} ${lastName}`,
          email,
          mobile,
          password
        }),
      })

      const data = await res.json()
      if (data.success === false && data.message) {
        setError(data.message)
        setLoading(false)
        return
      }
      if (data.token) {
        router.push(`/verifyemail?token=${data.token}`)
      } else {
        setShowModal(true)
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Something went wrong.')
      } else {
        setError('Something went wrong.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    router.push('/login')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Image */}
      <div className="relative w-1/2 hidden md:block h-full">
        <Image src="/login.svg" alt="Register Visual" fill className="object-cover" priority />
      </div>

      {/* Right Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 lg:px-20 h-full">
        <div className="max-w-md w-full mx-auto space-y-6">
          <h2 className="text-4xl font-bold text-gray-800 text-center w-full">CREATE ACCOUNT</h2>

          <div className="flex items-center justify-between">

            {step > 1 ? (
              <Button type="button" variant="ghost" onClick={handleBack} className="text-gray-700">
                <ArrowLeft className="mr-1" size={18} />
              </Button>
            ) : <div></div>}

            <h2 className="text-2xl font-bold text-gray-800">
              {step === 1 ? 'ENTER NAME ' : step === 2 ? ' ENTER CONTACT' : ' CREATE PASSWORD'}
            </h2>

            <div className="w-12" />
          </div>

          {error && <p className="text-sm text-red-500 font-medium">{error}</p>}
          {successMsg && <p className="text-sm text-green-600 font-medium">{successMsg}</p>}

          {/* Modal for registration success */}
          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
                <h3 className="text-xl font-bold mb-4 text-green-700">Registration Successfully</h3>
                <p className="mb-6 text-gray-700">Please check your mail to verify your account.</p>
                <Button
                  onClick={handleCloseModal}
                  className="w-full bg-[#d9673f] hover:bg-[#c2552d] text-white"
                >
                  Go to Login
                </Button>
              </div>
            </div>
          )}

          {/* Step 1: Name */}
          {step === 1 && (
            <>
              <div>
                <Label className="uppercase text-xs text-orange-600">First Name</Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="John" />
              </div>
              <div>
                <Label className="uppercase text-xs text-orange-600">Last Name</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
              </div>
              <Button
                onClick={handleStepSubmit}
                className="w-full bg-[#d9673f] hover:bg-[#c2552d] text-white"
              >
                Continue <ArrowRight className="ml-2" />
              </Button>
            </>
          )}

          {/* Step 2: Contact */}
          {step === 2 && (
            <>
              <div>
                <Label className="uppercase text-xs text-orange-600">Email</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label className="uppercase text-xs text-orange-600">Mobile No. (optional)</Label>
                <Input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} />
              </div>
              <Button
                onClick={handleStepSubmit}
                className="w-full bg-[#d9673f] hover:bg-[#c2552d] text-white"
              >
                Continue <ArrowRight className="ml-2" />
              </Button>
            </>
          )}

          {/* Step 3: Password */}
          {step === 3 && (
            <>
              <div>
                <Label className="uppercase text-xs text-orange-600">Create Password</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute top-1/2 right-3 -translate-y-1/2"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <Label className="uppercase text-xs text-orange-600">Confirm Password</Label>
                <div className="relative">
                  <Input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="********"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute top-1/2 right-3 -translate-y-1/2"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {password.length > 0 && (
                <ul className="text-xs text-gray-700 space-y-1 mt-2">
                  {passwordRules.map((rule, i) => (
                    <li key={i}>{rule.valid ? '✅' : '⚪'} {rule.label}</li>
                  ))}
                </ul>
              )}

              <Button
                onClick={handleRegister}
                disabled={loading}
                className="w-full bg-[#d9673f] hover:bg-[#c2552d] text-white"
              >
                {loading ? 'Processing...' : <>SIGN UP <ArrowRight className="ml-2" /></>}
              </Button>
            </>
          )}

          {/* Divider */}
          <div className="flex items-center gap-4 text-gray-500 text-sm">
            <hr className="flex-grow border-gray-300" />
            <span>Continue with</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <Button className="w-full border border-gray-300 bg-white text-gray-800 flex items-center justify-center gap-2 hover:bg-white hover:text-gray-800">
              <Image src="/google.svg" alt="Google" width={20} height={20} />
              Login with Google
            </Button>
            <Button className="w-full border border-gray-300 bg-white text-gray-800 flex items-center justify-center gap-2 hover:bg-white hover:text-gray-800">
              <Image src="/facebook.svg" alt="Facebook" width={20} height={20} />
              Login with Facebook
            </Button>
          </div>

          {/* Login Link */}
          <p className="text-sm text-center text-gray-700">
            Already have an account?{' '}
            <Link href="/login" className="underline font-medium">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
