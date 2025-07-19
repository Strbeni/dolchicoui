"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

const cartItems = [
  {
    id: 1,
    name: "WHITE CASUAL T-SHIRT",
    price: 100000,
    image: "/h2.svg",
    quantity: 1,
    note: "",
  },
  {
    id: 2,
    name: "WHITE CASUAL T-SHIRT",
    price: 100000,
    image: "/h1.svg",
    quantity: 1,
    note: "",
  },
  {
    id: 3,
    name: "WHITE CASUAL T-SHIRT",
    price: 100000,
    originalPrice: 200000,
    discount: 50,
    image: "/h3.svg",
    quantity: 1,
    note: "",
  },
]

export default function CartPage() {
  const [items, setItems] = useState(cartItems)

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const total = subtotal - 50000

  const handleQuantityChange = (id: number, delta: number) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    )
  }
  const router = useRouter();

const handleCheckout = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    router.push('/checkout');
  } else {
    router.push('/login');
  }
};



  return (
    <div className="px-6 lg:px-20 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
      {/* Left Cart Items */}
      <div className="lg:col-span-2 space-y-10">
        <h1 className="text-3xl font-bold">CART</h1>
        {items.map((item) => (
          <div key={item.id} className="flex flex-col gap-2 border-b pb-6">
            <div className="flex items-center gap-4">
              <Image src={item.image} alt={item.name} width={80} height={100} className="object-cover" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold">{item.name}</h3>
                {/* Price + Discount */}
                <div className="flex items-center gap-2 mt-1">
                  {item.originalPrice && (
                    <p className="line-through text-sm text-gray-400">IDR {item.originalPrice.toLocaleString()}</p>
                  )}
                  {item.discount && (
                    <span className="bg-red-600 text-white px-1 text-xs font-semibold rounded">50%</span>
                  )}
                </div>
                <p className="text-red-600 font-semibold">IDR {item.price.toLocaleString()}</p>
              </div>

              <div className="flex items-center border border-gray-300 rounded">
                <button onClick={() => handleQuantityChange(item.id, -1)} className="px-3 py-1 text-lg">−</button>
                <span className="px-4">{item.quantity}</span>
                <button onClick={() => handleQuantityChange(item.id, 1)} className="px-3 py-1 text-lg">+</button>

              </div>

              <button className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-600">
                <Trash2 size={16} /> Delete
              </button>
            </div>

            {/* Notes */}
            <div className="pl-[84px]">
              <p className="text-sm text-orange-500 mb-1">Notes</p>
              <input
                type="text"
                placeholder="Eg: Please double check before packing."
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Right Checkout Box */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">SHOPPING INFO</h2>

        {/* Promo Box */}
        <div className="bg-orange-100 border text-sm border-orange-300 p-3 flex justify-between items-center">
          <span>Hooray! You have promo code! <a className="underline text-orange-600" href="#">Use promo code</a></span>
          <button className="text-gray-400">✕</button>
        </div>

        <div className="text-sm space-y-2">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>IDR {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-semibold text-base">
            <span>Total</span>
            <span>IDR {total.toLocaleString()}</span>
          </div>
        </div>

        {/* <Link href="/checkout" className="w-full">
          <Button className="w-full bg-[#d46331] hover:bg-[#b75121] text-white text-sm py-3">
            PROCEED TO CHECKOUT
          </Button>
        </Link> */}
        <Button
  className="w-full bg-[#d46331] hover:bg-[#b75121] text-white text-sm py-3"
  onClick={handleCheckout}
>
  PROCEED TO CHECKOUT
</Button>

      </div>
    </div>
  )
}
