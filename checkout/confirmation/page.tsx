'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

// Add global Window type declaration at the top of the file
declare global {
  interface Window {
    Razorpay: any;
  }
}

// API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://valyris-i.onrender.com/api';

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
  const [invalidFields, setInvalidFields] = useState<string[]>([]);

  const router = useRouter();

  // Load Razorpay script
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => console.log('Razorpay loaded');
      script.onerror = () => setError('Failed to load payment system.');
      document.head.appendChild(script);
      return () => {
        if (document.head.contains(script)) document.head.removeChild(script);
      };
    }
  }, []);

  // Load cart and form/payment data
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
        if (cartJson.success) setCartData(cartJson.data);

        // Load saved form/payment/coupon
        const savedForm = localStorage.getItem('checkoutFormData');
        const savedPayment = localStorage.getItem('checkoutPaymentData');
        const savedCoupon = localStorage.getItem('appliedCoupon');

        if (savedForm) setFormData(JSON.parse(savedForm));
        else { router.push('/checkout'); return; }

        if (savedPayment) setPaymentData(JSON.parse(savedPayment));
        else { router.push('/checkout/shipping'); return; }

        if (savedCoupon) {
          try { setAppliedCoupon(JSON.parse(savedCoupon)); } 
          catch (e) { console.error('Coupon parse error:', e); }
        }
      } catch (err) {
        setError('Failed to load confirmation data.');
      } finally { setLoading(false); }
    };
    loadData();
  }, [router]);

  // Form validation
  const validateForm = useCallback(() => {
    if (!formData) return false;

    const fields: string[] = [];
    const { name, email, phone, street, province, country, zipCode } = formData;

    if (!name) fields.push('name');
    if (!email) fields.push('email');
    if (!phone) fields.push('phone');
    if (!street) fields.push('street');
    if (!province) fields.push('province');
    if (!country) fields.push('country');
    if (!zipCode) fields.push('zipCode');

    setInvalidFields(fields);
    return fields.length === 0;
  }, [formData]);

  const calculateDiscount = useCallback(() => {
    if (!cartData || !appliedCoupon) return 0;
    const subtotal = cartData.summary.subtotal || 0;
    return appliedCoupon.type === 'percentage' ? Math.floor(subtotal * appliedCoupon.discount / 100) : appliedCoupon.discount;
  }, [cartData, appliedCoupon]);

  const calculateTotal = useCallback(() => {
    if (!cartData) return 0;
    const discount = calculateDiscount();
    const shipping = 0;
    const subtotal = cartData.summary.subtotal || 0;
    return Math.max(0, subtotal - discount + shipping);
  }, [cartData, calculateDiscount]);

  // Razorpay payment
  const initiateRazorpayPayment = useCallback(async () => {
    if (!window.Razorpay) throw new Error('Payment system not loaded.');
    if (!cartData || !formData) throw new Error('Missing data for payment');

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const orderData = {
      items: cartData.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        price: item.price
      })),
      amount: calculateTotal(),
      address: {
        name: formData.name,
        street: formData.street,
        city: formData.province,
        state: formData.province,
        zip: formData.zipCode,
        phone: formData.phone
      },
      notes: { coupon: appliedCoupon?.code || null, totalItems: cartData.summary.totalItems }
    };

    const response = await fetch(`${API_BASE_URL}/payment/create-order`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });

    const orderResult = await response.json();
    if (!orderResult.success) throw new Error(orderResult.message || 'Failed to create payment order');

    const { orderId, amount: orderAmount, currency, key, dbOrderId } = orderResult.data;

    const options = {
      key, amount: orderAmount, currency,
      name: 'Valyris Store',
      description: `Order for ${cartData.summary.totalItems} item(s)`,
      order_id: orderId,
      handler: async (res: any) => {
        try {
          const verifyRes = await fetch(`${API_BASE_URL}/payment/verify`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: res.razorpay_order_id,
              razorpay_payment_id: res.razorpay_payment_id,
              razorpay_signature: res.razorpay_signature
            })
          });
          const verifyResult = await verifyRes.json();
          if (verifyResult.success) {
            await fetch(`${API_BASE_URL}/cart/clear`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } });
            localStorage.removeItem('checkoutFormData');
            localStorage.removeItem('checkoutPaymentData');
            localStorage.removeItem('appliedCoupon');
            router.push(`/checkout/success?orderId=${dbOrderId}&paymentId=${res.razorpay_payment_id}`);
          } else throw new Error('Payment verification failed');
        } catch (err) {
          console.error(err);
          setError('Payment verification failed.');
          setPlacingOrder(false);
        }
      },
      prefill: { name: formData.name, email: formData.email, contact: formData.phone },
      theme: { color: '#f97316' },
      modal: { ondismiss: () => setPlacingOrder(false) }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.on('payment.failed', (res: any) => { setError(res.error.description); setPlacingOrder(false); });
    razorpay.open();
  }, [cartData, formData, appliedCoupon, calculateTotal, router]);

  // Place order with validation
  const handlePlaceOrder = useCallback(async () => {
    setError(null);
    if (!validateForm()) { setError('Please complete all required fields.'); return; }
    setPlacingOrder(true);
    try { await initiateRazorpayPayment(); }
    catch (err: any) { setError(err.message || 'Payment initiation failed'); setPlacingOrder(false); }
  }, [validateForm, initiateRazorpayPayment]);

  const discount = calculateDiscount();
  const shipping = 0;
  const subtotal = cartData?.summary.subtotal ?? 0;
  const total = calculateTotal();

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading confirmation...</p></div>;
  if (error) return <div className="min-h-screen flex flex-col items-center justify-center text-red-500"><p>{error}</p><Button onClick={() => window.location.reload()}>Retry</Button></div>;
  if (!cartData || !formData) { router.push('/checkout'); return null; }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-6 lg:px-6 lg:py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Order Confirmation</h1>

        {/* Display form fields with validation */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 lg:p-6 shadow-sm mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Delivery Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {['name','email','phone','street','province','country','zipCode'].map(field => (
              <div key={field}>
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{field}</div>
                <div className={`font-medium text-gray-900 ${invalidFields.includes(field) ? 'border border-red-500 rounded p-1' : ''}`}>
                  {(formData as any)[field]}
                </div>
                {invalidFields.includes(field) && <p className="text-red-500 text-xs mt-1">Required</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Order summary */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 lg:p-6 shadow-sm">
          <h2 className="font-bold text-xl text-gray-900 mb-6">Order Summary</h2>
          <div className="flex justify-between mb-2"><span>Subtotal</span><span>IDR {subtotal.toLocaleString()}</span></div>
          {appliedCoupon && discount > 0 && <div className="flex justify-between text-green-600"><span>Coupon ({appliedCoupon.code})</span><span>-IDR {discount.toLocaleString()}</span></div>}
 <div className="flex justify-between">
    <span>Shipping</span>
    <span>{(shipping || 0) === 0 ? 'Free' : `IDR ${(shipping || 0).toLocaleString()}`}</span>
  </div>
          <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-lg text-orange-600"><span>Total</span><span>IDR {total.toLocaleString()}</span></div>
        </div>

        <div className="mt-6 flex justify-center">
          <Button onClick={handlePlaceOrder} disabled={placingOrder || !cartData.items.length} className="bg-orange-500 hover:bg-orange-600 text-white px-12 py-4 rounded-xl">
            {placingOrder ? 'PROCESSING PAYMENT...' : 'PAY NOW'}
          </Button>
        </div>
      </div>
    </div>
  );
}
