'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

// API base URL
const API_BASE_URL = 'http://localhost:4000/api';

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
    if (!cartData) return 0;
    const discount = 0;
    const shipping = 100;
    const subtotal = cartData.summary.subtotal;
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
  const subtotal = cartData?.summary.subtotal ?? 0;
  const total = calculateTotal();

  // Loading state
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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
          <p className="mb-4">{error}</p>
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
    <div className="grid grid-cols-1 lg:grid-cols-2 px-6 lg:px-20 py-10 gap-10">
      {/* LEFT */}
      <div>
        <h1 className="text-3xl font-bold mb-6">CONFIRMATION</h1>
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
            <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">✓</div>
            <div className="text-xs">
              <div className="font-semibold text-orange-600">Step 2</div>
              <div>PAYMENT</div>
            </div>
          </div>
          <div className="w-8 h-0.5 bg-gray-300" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-orange-100 border text-xs flex items-center justify-center">🧾</div>
            <div className="text-xs text-gray-500">
              <div>Step 3</div>
              <div>CONFIRMATION</div>
            </div>
          </div>
        </div>
        {/* Order Details */}
        <div className="bg-gray-50 p-4 rounded mb-6">
          <h3 className="font-semibold mb-2">Order Details</h3>
          <div className="text-sm space-y-1">
            <p><span className="font-medium">Name:</span> {formData.name}</p>
            <p><span className="font-medium">Email:</span> {formData.email}</p>
            <p><span className="font-medium">Phone:</span> {formData.phone}</p>
            <p>
              <span className="font-medium">Address:</span> {formData.street}, {formData.province}, {formData.country} {formData.zipCode}
            </p>
            {paymentData && (
              <p>
                <span className="font-medium">Payment Method:</span> {paymentData.method.toUpperCase()}
              </p>
            )}
          </div>
        </div>
        {/* Order Status */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="font-semibold mb-1">Order Status</p>
            <p className="text-sm text-gray-600">
              By clicking &quot;PLACE ORDER&quot;, you confirm that you want to place this order. 
              You will receive an order confirmation email with all the details.
            </p>
          </div>
          <span className="bg-yellow-100 text-yellow-600 text-xs px-4 py-1 rounded-full">
            Ready to Place
          </span>
        </div>
        {/* Payment Info */}
        <div className="mt-4 text-sm text-gray-700">
          <p className="font-semibold mb-1">Payment Information</p>
          <p>
            By clicking &quot;PLACE ORDER&quot;, you confirm that you want to place this order. 
            You will receive an order confirmation email with all the details.
          </p>
        </div>
        {/* Place Order Button */}
        <div className="mt-10 flex justify-center">
          <Button
            className="bg-[#d9673f] hover:bg-[#c2552d] text-white px-8 py-2"
            onClick={handlePlaceOrder}
            disabled={placingOrder}
          >
            {placingOrder ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>PLACING ORDER...</span>
              </div>
            ) : (
              'PLACE ORDER'
            )}
          </Button>
        </div>
      </div>
      {/* RIGHT SUMMARY */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">ORDER SUMMARY</h2>
        <div className="bg-[#f5f1ec] border border-gray-300 text-sm px-4 py-2 flex justify-between items-center mb-4 rounded">
          <span>Hooray! You use promo code!</span>
          <button className="text-gray-400 text-lg" aria-label="Remove promo code">×</button>
        </div>
        {/* Products from Cart */}
        <div className="space-y-4 mb-6">
          {cartData.items.map((item) => (
            <div key={`${item.id}-${item.size}`} className="flex gap-4 items-start">
              <Image
                src={item.product.image[0] || '/p1.svg'}
                alt={item.product.name}
                width={70}
                height={70}
                className="object-cover rounded"
              />
              <div>
                <h4 className="font-semibold text-sm">{item.product.name}</h4>
                <p className="text-xs text-gray-500">{item.quantity} × IDR {item.price.toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">Size: {item.size}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Price Summary */}
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
  );
}
