'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

// API base URL
const API_BASE_URL = 'https://valyris-i.onrender.com/api';

// --- Types ---
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
interface CheckoutFormData {
  name: string;
  email: string;
  phone: string;
  street: string;
  province: string;
  country: string;
  zipCode: string;
}
interface CheckoutPaymentData {
  method: string;
  [key: string]: any;
}

export default function ConfirmationPage() {
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [formData, setFormData] = useState<CheckoutFormData | null>(null);
  const [paymentData, setPaymentData] = useState<CheckoutPaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // Load cart and form/payment data from storage and backend
  useEffect(() => {
    const loadData = async () => {
      try {
        setError(null);
        setLoading(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }
        // Fetch cart items
        const cartRes = await fetch(`${API_BASE_URL}/cart`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        const cartJson = await cartRes.json();
        if (cartJson.success) {
          setCartData(cartJson.data);
        }

        // Load form and payment data from localStorage
        const savedForm = localStorage.getItem('checkoutFormData');
        const savedPayment = localStorage.getItem('checkoutPaymentData');
        if (savedForm) setFormData(JSON.parse(savedForm));
        else {
          router.push('/checkout');
          return;
        }
        if (savedPayment) setPaymentData(JSON.parse(savedPayment));
        else {
          router.push('/checkout/shipping');
          return;
        }
      } catch (err) {
        setError('Failed to load confirmation data.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [router]);

  // Helper for totals
  const calculateTotal = useCallback(() => {
    if (!cartData) return 289000;
    const discount = 0; 
    const shipping = 0; 
    const subtotal = cartData.summary.subtotal || 300000;
    return Math.max(0, subtotal - discount + shipping);
  }, [cartData]);

  // Place order on backend
  const handlePlaceOrder = useCallback(async () => {
    if (!cartData || !formData) return;
    setError(null);
    setPlacingOrder(true);
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const orderData = {
        items: cartData.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size,
        })),
        amount: calculateTotal(),
        address: {
          street: formData.street,
          city: formData.province,
          state: formData.province,
          zipCode: formData.zipCode,
          country: formData.country,
          phone: formData.phone,
        }
      };

      const response = await fetch(`${API_BASE_URL}/order/place`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Failed to place order');
      }
      // Clear checkout data in localStorage
      localStorage.removeItem('checkoutFormData');
      localStorage.removeItem('checkoutPaymentData');
      // Navigate to success page
      router.push(`/checkout/success?orderId=${result.orderId}`);
    } catch (err) {
      setError('Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  }, [cartData, formData, calculateTotal, router]);

  const discount = 0;
  const shipping = 0;
  const subtotal = cartData?.summary.subtotal ?? 300000;
  const total = calculateTotal();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center ">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading confirmation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center max-w-sm mx-auto">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Error</h2>
          <p className="text-sm mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!cartData || !formData) {
    router.push('/checkout');
    return null;
  }

  return (
    <div className="min-h-screen ">
      
      {/* Mobile Header */}
      <div className="bg-white border-b lg:hidden sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="p-1">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-medium">Confirmation</h1>
          <div className="w-8"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto lg:grid lg:grid-cols-2 lg:gap-8 lg:px-6 lg:py-8">
        {/* LEFT SECTION */}
        <div className="bg-white lg:bg-transparent">
          {/* Logo Section */}
        
          {/* Progress Steps - Exact Match */}
          <div className="px-4 lg:px-0 mb-8">
            <div className="flex items-center justify-center lg:justify-start gap-1 lg:gap-2">
              {/* Step 1 */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center mb-1">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-xs text-center leading-tight">
                  <div className="font-medium text-gray-600">PERSONAL INFO</div>
                </div>
              </div>

              {/* Connector */}
              <div className="w-8 h-0.5 bg-green-500 mx-2 mt-[-20px]"></div>

              {/* Step 2 */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center mb-1">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="text-xs text-center leading-tight " onClick={() => router.back()}>
                  
                  <div className="font-medium text-gray-600"> <button onClick={() => router.back()} className="p-1">PAYMENT</button></div>
                </div>
              </div>

              {/* Connector */}
              <div className="w-8 h-0.5 bg-orange-500 mx-2 mt-[-20px]"></div>

              {/* Step 3 */}
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center mb-1">
                  <span className="text-white text-sm">📋</span>
                </div>
                <div className="text-xs text-center leading-tight">
                  <div className="font-medium text-orange-600">CONFIRMATION</div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 lg:px-0 space-y-4">
            {/* Order Number - Exact Match */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-500 mb-1">Order Number</div>
              <div className="font-bold text-lg text-orange-600 mb-1">1234ASDFGHJ</div>
              <div className="text-xs text-red-500 font-medium">Waiting For Payment</div>
            </div>

            {/* Payment Information - Exact Match */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-3 text-sm">Payment Information</h3>
              <div className="text-xs text-gray-600 leading-relaxed">
                Upon completing a purchase, you will receive a payment confirmation email. This 
                email will contain essential information about the{' '}
                <span className="text-blue-600 underline cursor-pointer">items you have purchased</span>{' '}
                and the total amount that needs to be paid.
              </div>
            </div>

            {/* Customer Details */}
            {formData && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3 text-sm">Delivery Information</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Name:</span>
                    <span className="font-medium text-gray-700">{formData.name}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Email:</span>
                    <span className="font-medium text-gray-700">{formData.email}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Phone:</span>
                    <span className="font-medium text-gray-700">{formData.phone}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Address:</span>
                    <span className="font-medium text-gray-700 text-right max-w-[60%]">
                      {formData.street}, {formData.province}
                    </span>
                  </div>
                  {paymentData && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Payment:</span>
                      <span className="font-medium text-gray-700 capitalize">
                        {paymentData.method === 'cod' ? 'Cash on Delivery' : paymentData.method}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SECTION - ORDER SUMMARY - Exact Match */}
        <div className="bg-white lg:bg-transparent">
          <div className="px-4 py-6 lg:px-0 lg:py-0">
            <h2 className="font-bold text-lg text-gray-800 mb-4">ORDER SUMMARY</h2>

            {/* Promo Banner - Exact Match */}
            <div className="bg-orange-50 border border-orange-200 rounded-md p-3 mb-4 flex items-center justify-between">
              <span className="text-sm text-orange-700">Hooray! You use promo code!</span>
              <button className="text-orange-400 hover:text-orange-600 text-lg font-bold">×</button>
            </div>

            {/* Product Items - Exact Match */}
            <div className="space-y-3 mb-6">
              {cartData.items.length > 0 ? (
                cartData.items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex gap-3 items-start">
                    <div className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden">
                      <Image
                        src={item.product.image[0] || '/p1.svg'}
                        alt={item.product.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-800 mb-1 leading-tight">
                        {item.product.name || 'WHITE CASUAL T-SHIRT'}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {item.quantity} × IDR {item.price.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">Size: {item.size}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">IDR {(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                // Fallback items to match the UI exactly
                <>
                  <div className="flex gap-3 items-start">
                    <div className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0"></div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-gray-800 mb-1">WHITE CASUAL T-SHIRT</h4>
                      <p className="text-xs text-gray-500">1 × IDR 100,000</p>
                    </div>
                    <p className="font-medium text-sm">IDR 100,000</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-16 h-16 bg-gray-100 rounded-md flex-shrink-0"></div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-gray-800 mb-1">WHITE CASUAL T-SHIRT</h4>
                      <p className="text-xs text-gray-500">2 × IDR 100,000</p>
                    </div>
                    <p className="font-medium text-sm">IDR 200,000</p>
                  </div>
                </>
              )}
            </div>

            {/* Price Summary - Exact Match */}
            <div className="border-t border-gray-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">IDR {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-red-600">
                <span>Voucher (WELCOME10)</span>
                <span>IDR {discount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">IDR {shipping.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-200 pt-2 mt-3">
                <div className="flex justify-between">
                  <span className="font-bold text-base text-gray-800">Total</span>
                  <span className="font-bold text-base">IDR {total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button - Mobile Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 lg:hidden">
        <Button
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 text-sm font-semibold rounded-lg disabled:opacity-50"
          onClick={handlePlaceOrder}
          disabled={placingOrder}
        >
          {placingOrder ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>PLACING ORDER...</span>
            </div>
          ) : (
            'I ALREADY PAY'
          )}
        </Button>
      </div>

      {/* Action Button - Desktop */}
      <div className="hidden lg:block lg:px-6 lg:pb-8">
        <div className="max-w-7xl mx-auto flex justify-center">
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white px-16 py-3 text-sm font-semibold rounded-lg disabled:opacity-50"
            onClick={handlePlaceOrder}
            disabled={placingOrder}
          >
            {placingOrder ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>PLACING ORDER...</span>
              </div>
            ) : (
              'I ALREADY PAY'
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Bottom Spacing */}
      <div className="h-20 lg:hidden"></div>
    </div>
  );
}