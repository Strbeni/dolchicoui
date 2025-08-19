"use client"
import Image from "next/image"
import { X } from "lucide-react"

interface PromotionalBannerProps {
  isOpen: boolean
  onClose: () => void
}

export default function PromotionalBanner({ isOpen, onClose }: PromotionalBannerProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-r from-pink-50 to-orange-50 rounded-2xl max-w-4xl w-full h-64 overflow-hidden relative flex">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white/80 rounded-full p-2 hover:bg-white transition-colors"
          title="Close banner"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Orange sidebar with vertical text */}
        <div className="bg-orange-500 w-16 flex items-center justify-center relative">
          <div className="text-white font-bold text-sm transform -rotate-90 whitespace-nowrap">UPTO ₹300 OFF</div>
        </div>

        {/* Clothing rack image section */}
        <div className="w-100 relative">
          <Image
            src="https://media.istockphoto.com/id/1125038961/photo/young-man-running-outdoors-in-morning.jpg?s=612x612&w=0&k=20&c=LVAlQIforg7ZRAF-bOvdvoD_k3ejEeimrWbGq2IA5ak="
            alt="Clothing Rack"
            fill={true} 
            className="object-cover object-left"
            style={{
              clipPath: "polygon(0 0, 70% 0, 85% 50%, 0 200%)",
            }}
            priority
          />
        </div>

        {/* Main content section */}
        <div className="flex-1 p-8 flex flex-col justify-center">
          <div className="mb-4">
            <h1 className="text-5xl font-black text-gray-800 mb-2">SALE</h1>
            <h2 className="text-4xl font-bold text-gray-700">₹300 OFF</h2>
          </div>

          <div className="mb-2">
            <p className="text-gray-600 text-sm mb-1">
              Coupon Code: <span className="font-bold text-gray-800">FLAT300</span>
            </p>
            <p className="text-gray-500 text-xs">Applicable on your first order</p>
          </div>
        </div>
      </div>
    </div>
  )
}
