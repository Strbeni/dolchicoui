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

interface AppliedCoupon {
  code: string;
  discount: number;
  type: "percentage" | "fixed";
  minAmount: number;
  description: string;
}

export default function ConfirmationPage() {
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [formData, setFormData] = useState<CheckoutFormData | null>(null);
  const [paymentData, setPaymentData] = useState<CheckoutPaymentData | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
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
        const savedCoupon = localStorage.getItem('appliedCoupon');
        
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
        if (savedCoupon) {
          try {
            setAppliedCoupon(JSON.parse(savedCoupon));
          } catch (e) {
            console.error('Error parsing coupon data:', e);
          }
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
  const calculateDiscount = useCallback(() => {
    if (!cartData || !appliedCoupon) return 0;
    const subtotal = cartData.summary.subtotal || 0;
    
    if (appliedCoupon.type === "percentage") {
      return Math.floor((subtotal * appliedCoupon.discount) / 100);
    } else {
      return appliedCoupon.discount;
    }
  }, [cartData, appliedCoupon]);

  const calculateTotal = useCallback(() => {
    if (!cartData) return 0;
    const discount = calculateDiscount();
    const shipping = 0; 
    const subtotal = cartData.summary.subtotal || 0;
    return Math.max(0, subtotal - discount + shipping);
  }, [cartData, calculateDiscount]);

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
      localStorage.removeItem('appliedCoupon');
      // Navigate to success page
      router.push(`/checkout/success?orderId=${result.orderId}`);
    } catch (err) {
      setError('Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  }, [cartData, formData, calculateTotal, router]);

  const discount = calculateDiscount();
  const shipping: number = 0;
  const subtotal = cartData?.summary.subtotal ?? 0;
  const total = calculateTotal();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
          <p className="text-sm mb-4 text-gray-600">{error}</p>
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
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-50 lg:hidden">
        <div className="flex items-center justify-between px-4 py-4">
          <button 
            onClick={() => router.back()} 
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Order Confirmation</h1>
          <div className="w-9"></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 lg:px-6 lg:py-8">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between mb-8">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Payment
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Order Confirmation</h1>
          <div className="w-32"></div>
        </div>

        {/* Progress Steps - More Compact */}
        <div className="mb-6 lg:mb-8">
          <div className="flex items-center justify-center lg:justify-start gap-2">
            {/* Step 1 */}
            <div className="flex flex-col items-center flex-1 max-w-[100px]">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center mb-2">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-xs text-center font-medium text-green-600">
                PERSONAL INFO
              </div>
            </div>

            {/* Connector */}
            <div className="flex-1 h-0.5 bg-green-500 max-w-[60px] mt-[-16px]"></div>

            {/* Step 2 */}
            <div className="flex flex-col items-center flex-1 max-w-[100px]">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center mb-2">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <button 
                onClick={() => router.back()}
                className="text-xs text-center font-medium text-green-600 hover:text-green-700 transition-colors"
              >
                PAYMENT
              </button>
            </div>

            {/* Connector */}
            <div className="flex-1 h-0.5 bg-orange-500 max-w-[60px] mt-[-16px]"></div>

            {/* Step 3 */}
            <div className="flex flex-col items-center flex-1 max-w-[100px]">
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center mb-2">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-xs text-center font-medium text-orange-600">
                CONFIRMATION
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* LEFT SECTION - Order Details */}
          <div className="space-y-4 lg:space-y-6">
            {/* Order Number */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 lg:p-6 shadow-sm">
              <div className="text-sm text-gray-500 mb-2">Order Number</div>
              <div className="font-bold text-xl text-orange-600 mb-2">1234ASDFGHJ</div>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                Waiting For Payment
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 lg:p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Payment Information
              </h3>
              <div className="text-sm text-gray-600 leading-relaxed">
                Upon completing a purchase, you will receive a payment confirmation email. This 
                email will contain essential information about the{' '}
                <span className="text-blue-600 underline cursor-pointer hover:text-blue-700">
                  items you have purchased
                </span>{' '}
                and the total amount that needs to be paid.
              </div>
            </div>

            {/* Customer Details */}
            {formData && (
              <div className="bg-white border border-gray-200 rounded-xl p-4 lg:p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Delivery Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Name</div>
                    <div className="font-medium text-gray-900">{formData.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</div>
                    <div className="font-medium text-gray-900 break-all">{formData.email}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Phone</div>
                    <div className="font-medium text-gray-900">{formData.phone}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Address</div>
                    <div className="font-medium text-gray-900 leading-relaxed">
                      {formData.street}, {formData.province}, {formData.country} {formData.zipCode}
                    </div>
                  </div>
                  {paymentData && (
                    <div className="sm:col-span-2">
                      <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Payment Method</div>
                      <div className="font-medium text-gray-900 capitalize">
                        {paymentData.method === 'cod' ? 'Cash on Delivery' : paymentData.method}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT SECTION - ORDER SUMMARY */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 lg:p-6 shadow-sm">
            <h2 className="font-bold text-xl text-gray-900 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              ORDER SUMMARY
            </h2>

            {/* Applied Coupon Banner */}
            {appliedCoupon && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <div>
                    <span className="text-sm font-medium text-green-700">
                      Coupon Applied: {appliedCoupon.code}
                    </span>
                    <p className="text-xs text-green-600">{appliedCoupon.description}</p>
                  </div>
                </div>
                <div className="text-sm font-semibold text-green-700">
                  -{appliedCoupon.type === "percentage" ? `${appliedCoupon.discount}%` : `IDR ${appliedCoupon.discount.toLocaleString()}`}
                </div>
              </div>
            )}

            {/* Product Items */}
            <div className="space-y-4 mb-6">
              {cartData.items.length > 0 ? (
                cartData.items.map((item) => (
                  <div key={`${item.id}-${item.size}`} className="flex gap-4 items-start p-3 bg-gray-50 rounded-lg">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0 overflow-hidden">
                      <Image
                        src={item.product.image?.[0] || '/placeholder.jpg'}
                        alt={item.product.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-gray-900 mb-1 line-clamp-2">
                        {item.product.name}
                      </h4>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity} | Size: {item.size}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm text-gray-900">
                            IDR {(item.price * item.quantity).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            IDR {item.price.toLocaleString()} each
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <p>No items in cart</p>
                </div>
              )}
            </div>

            {/* Price Summary */}
            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">IDR {subtotal.toLocaleString()}</span>
              </div>
              {appliedCoupon && discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Coupon ({appliedCoupon.code})</span>
                  <span>-IDR {discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-gray-900">
                  {shipping === 0 ? 'Free' : `IDR ${shipping.toLocaleString()}`}
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between">
                  <span className="font-bold text-lg text-gray-900">Total</span>
                  <span className="font-bold text-lg text-orange-600">IDR {total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button - Desktop */}
        <div className="hidden lg:flex justify-center mt-8">
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white px-12 py-4 text-lg font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            onClick={handlePlaceOrder}
            disabled={placingOrder || !cartData.items.length}
          >
            {placingOrder ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>PLACING ORDER...</span>
              </div>
            ) : (
              'CONFIRM & PLACE ORDER'
            )}
          </Button>
        </div>
      </div>

      {/* Action Button - Mobile Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden shadow-lg">
        <Button
          className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 text-lg font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          onClick={handlePlaceOrder}
          disabled={placingOrder || !cartData.items.length}
        >
          {placingOrder ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>PLACING ORDER...</span>
            </div>
          ) : (
            'CONFIRM & PLACE ORDER'
          )}
        </Button>
      </div>

      {/* Mobile Bottom Spacing */}
      <div className="h-24 lg:hidden"></div>
    </div>
  );
}