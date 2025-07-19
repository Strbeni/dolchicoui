"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function VerifyEmail() {
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (urlToken) {
      setToken(urlToken);
      handleVerify(urlToken);
    } else {
      setError("Verification token not found in URL.");
    }
  }, [searchParams]);

  const handleVerify = async (verificationToken: string) => {
    setLoading(true);
    setError("");
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
      const res = await fetch(`${API_BASE_URL}/api/user/verify-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Verification failed");
      }

      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left side image */}
      <div className="relative w-1/2 hidden md:block h-full">
        <Image
          src="/login.svg"
          alt="Verify Email"
          fill
          className="object-cover"
          priority
        />
      </div>
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 lg:px-20 h-full">
        <div className="max-w-md w-full mx-auto space-y-6">
          <h2 className="text-4xl font-bold text-gray-800">VERIFY EMAIL</h2>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          {success && (
            <p className="text-green-600 text-sm">
              Email verified! Redirecting to login...
            </p>
          )}
          {!success && (
            <Button
              type="button"
              onClick={() => handleVerify(token)}
              disabled={!token || loading}
              className="w-full bg-[#d9673f] hover:bg-[#c2552d] text-white text-sm tracking-widest"
            >
              {loading ? "Verifying..." : "VERIFY EMAIL"}
              <ArrowRight className="ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
