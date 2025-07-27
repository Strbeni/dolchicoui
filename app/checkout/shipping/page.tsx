'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// Types
interface CartItem {
  id: number;
  productId: number;
  size: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    image: string[];
  };
}

interface CartData {
  items: CartItem[];
  summary: {
    totalItems: number;
    subtotal: number;
  };
}

export default function ShippingPage() {
  const [paymentMethod, setPaymentMethod] = useState('mastercard')
  const [upiID, setUpiID] = useState('')
  const [upiVerified, setUpiVerified] = useState(false)
  const [cartData, setCartData] = useState<CartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState<any>(null)
  
  const router = useRouter()

  // Load cart data and form data from previous step
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('http://localhost:3000/api/cart', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch cart');
        }

        const result = await response.json();
        if (result.success) {
          setCartData(result.data);
        }

        // Load form data from previous step
        const savedFormData = localStorage.getItem('checkoutFormData');
        if (savedFormData) {
          setFormData(JSON.parse(savedFormData));
        } else {
          router.push('/checkout'); // Redirect back if no form data
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [router]);

  const handleUPIChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUpiID(e.target.value)
    setUpiVerified(!!e.target.value && e.target.value.includes('@'))
  }

  const handleContinueToPayment = () => {
    // Store payment method and details
    const paymentData = {
      method: paymentMethod,
      ...(paymentMethod === 'gpay' && { upiId: upiID }),
    };
    
    localStorage.setItem('checkoutPaymentData', JSON.stringify(paymentData));
    router.push('/checkout/confirmation');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!cartData || cartData.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">Your cart is empty</p>
          <Button onClick={() => router.push('/productlist')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  const discount = 50000;
  const shipping = 39000;
  const subtotal = cartData.summary.subtotal;
  const total = Math.max(0, subtotal - discount + shipping);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 px-6 lg:px-20 py-10">
      {/* LEFT FORM */}
      <div>
        <h1 className="text-3xl font-bold mb-6">CHECKOUT FORM</h1>

        {/* Steps */}
        <div className="flex items-center gap-6 mb-10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">✓</div>
            <div className="text-xs">
              <div className="font-semibold text-orange-600">Step 1</div>
              <div>PERSONAL INFO</div>
            </div>
          </div>
          <div className="w-8 h-0.5 bg-gray-300" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center">📦</div>
            <div className="text-xs">
              <div className="font-semibold text-orange-600">Step 2</div>
              <div>PAYMENT</div>
            </div>
          </div>
          <div className="w-8 h-0.5 bg-gray-300" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full border border-gray-400 text-xs flex items-center justify-center">☑</div>
            <div className="text-xs text-gray-500">
              <div>Step 3</div>
              <div>CONFIRMATION</div>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <h2 className="text-xl font-semibold mb-4">PAYMENT METHOD</h2>
        <div className="flex items-center gap-6 mb-6 flex-wrap">
          {['mastercard', 'visa', 'gpay', 'paypal'].map((method) => (
            <label key={method} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="payment"
                value={method}
                checked={paymentMethod === method}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <Image src={`/${method}.svg`} alt={method} width={50} height={50} />
            </label>
          ))}
        </div>

        {/* Payment Details */}
        {paymentMethod === 'gpay' ? (
          <div>
            <label className="block mb-1 text-sm font-semibold">ENTER YOUR UPI ID</label>
            <input
              className="border w-full px-4 py-2"
              type="text"
              placeholder="Eg: john@upi"
              value={upiID}
              onChange={handleUPIChange}
            />
            {upiVerified && (
              <p className="text-green-600 text-xs mt-1">✅ UPI ID Verified</p>
            )}
          </div>
        ) : (
          <form className="space-y-6 mt-6">
            <div>
              <label className="block mb-1 text-sm font-semibold">NAME ON CARD</label>
              <input className="border w-full px-4 py-2" type="text" placeholder="Eg: John Doe" />
            </div>
            <div>
              <label className="block mb-1 text-sm font-semibold">CARD NUMBER</label>
              <input className="border w-full px-4 py-2" type="text" placeholder="Eg: 1234 5678 9012 3456" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 text-sm font-semibold">EXPIRY DATE</label>
                <input className="border w-full px-4 py-2" type="text" placeholder="MM/YY" />
              </div>
              <div>
                <label className="block mb-1 text-sm font-semibold">CVV</label>
                <input className="border w-full px-4 py-2" type="password" placeholder="***" />
              </div>
            </div>
          </form>
        )}

        <Button 
          className="w-full bg-[#d9673f] hover:bg-[#c2552d] text-white px-6 py-2 mt-6"
          onClick={handleContinueToPayment}
          disabled={paymentMethod === 'gpay' && !upiVerified}
        >
          CONTINUE TO CONFIRMATION
        </Button>
      </div>

      {/* RIGHT SUMMARY */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">ORDER SUMMARY</h2>
        <div className="bg-[#f5f1ec] border border-gray-300 text-sm px-4 py-2 flex justify-between items-center mb-4">
          <span>Hooray! You use promo code!</span>
          <button className="text-gray-400 text-lg">×</button>
        </div>

        {/* Products from Cart */}
        <div className="space-y-4 mb-6">
          {cartData.items.map((item) => (
            <div key={item.id} className="flex gap-4 items-start">
              <Image 
                src={item.product.image[0] || '/p1.svg'} 
                alt={item.product.name} 
                width={70} 
                height={70} 
              />
              <div>
                <h4 className="font-semibold text-sm">{item.product.name}</h4>
                <p className="text-xs text-gray-500">{item.quantity} × IDR {item.price.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">Size: {item.size}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2 text-sm border-t pt-4">
          <div className="flex justify-between">
            <span>Subtotal ({cartData.summary.totalItems} items)</span>
            <span>IDR {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-red-600">
            <span>Voucher (50KDISCOUNT)</span>
            <span>-IDR {discount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>IDR {shipping.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold pt-2">
            <span>Total</span>
            <span>IDR {total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
