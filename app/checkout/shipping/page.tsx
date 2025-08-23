'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

// API Configuration
const API_BASE_URL = 'https://valyris-i.onrender.com/api';

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

interface CheckoutFormData {
  name: string;
  email: string;
  phone: string;
  street: string;
  province: string;
  country: string;
  zipCode: string;
}

interface PaymentData {
  method: string;
  upiId?: string;
  cardName?: string;
  cardNumber?: string;
  expiryDate?: string;
}

export default function ShippingPage() {
  // State Management
  const [paymentMethod, setPaymentMethod] = useState('cod'); // Default to COD
  const [upiID, setUpiID] = useState('');
  const [upiVerified, setUpiVerified] = useState(false);
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [formData, setFormData] = useState<CheckoutFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  // Card form state
  const [cardForm, setCardForm] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  const router = useRouter();

  // Authentication check
  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return false;
    }
    return true;
  }, [router]);

  // Get auth headers
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }, []);

  // Fetch cart data using your existing API
  const fetchCart = useCallback(async (): Promise<CartData | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch cart: ${response.statusText}`);
      }

      const result = await response.json();
      return result.success ? result.data : null;
    } catch (err) {
      console.error('Error fetching cart:', err);
      throw err;
    }
  }, [getAuthHeaders]);

  // Load cart data and form data from previous step
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!checkAuth()) return;

        // Fetch cart data
        const cartResult = await fetchCart();

        if (!cartResult || cartResult.items.length === 0) {
          setCartData(null);
          return;
        }

        setCartData(cartResult);

        // Load saved form data from previous step (localStorage only)
        const savedFormData = localStorage.getItem('checkoutFormData');
        if (savedFormData) {
          try {
            const parsedFormData = JSON.parse(savedFormData) as CheckoutFormData;
            setFormData(parsedFormData);
          } catch (parseError) {
            console.error('Error parsing form data:', parseError);
            router.push('/checkout');
            return;
          }
        } else {
          // No form data found, redirect to first step
          router.push('/checkout');
          return;
        }

        // Load existing payment data if available (localStorage only)
        const savedPaymentData = localStorage.getItem('checkoutPaymentData');
        if (savedPaymentData) {
          try {
            const paymentData = JSON.parse(savedPaymentData) as PaymentData;
            setPaymentMethod(paymentData.method || 'cod');
            
            if (paymentData.upiId) {
              setUpiID(paymentData.upiId);
              setUpiVerified(true);
            }
            
            if (paymentData.cardName) {
              setCardForm({
                cardName: paymentData.cardName || '',
                cardNumber: paymentData.cardNumber || '',
                expiryDate: paymentData.expiryDate || '',
                cvv: '' // Never pre-fill CVV for security
              });
            }
          } catch (parseError) {
            console.error('Error parsing payment data:', parseError);
            // Continue without pre-filled payment data
          }
        }

      } catch (err) {
        console.error('Error loading shipping data:', err);
        setError('Failed to load checkout data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [checkAuth, fetchCart, router]);

  // Handle UPI changes with validation
  const handleUPIChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUpiID(value);
    // Basic UPI validation: must contain @ and be longer than 5 characters
    setUpiVerified(!!(value && value.includes('@') && value.length > 5));
  }, []);

  // Handle card form changes with formatting
  const handleCardFormChange = useCallback((field: keyof typeof cardForm, value: string) => {
    let processedValue = value;
    
    // Format card number with spaces
    if (field === 'cardNumber') {
      processedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (processedValue.length > 19) processedValue = processedValue.slice(0, 19);
    }
    
    // Format expiry date
    if (field === 'expiryDate') {
      processedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2');
      if (processedValue.length > 5) processedValue = processedValue.slice(0, 5);
    }
    
    // Only allow numbers for CVV
    if (field === 'cvv') {
      processedValue = value.replace(/\D/g, '');
    }

    setCardForm(prev => ({
      ...prev,
      [field]: processedValue
    }));
  }, []);

  // Validate payment form
  const isPaymentValid = useCallback(() => {
    if (paymentMethod === 'cod') {
      return true; // COD doesn't need additional validation
    }
    if (paymentMethod === 'gpay') {
      return upiVerified;
    }
    // For card payments
    return !!(
      cardForm.cardName.trim() && 
      cardForm.cardNumber.replace(/\s/g, '').length >= 16 && 
      cardForm.expiryDate.length === 5 && 
      cardForm.cvv.length >= 3
    );
  }, [paymentMethod, upiVerified, cardForm]);

  // Handle continue to confirmation
  const handleContinueToPayment = useCallback(() => {
    if (!isPaymentValid()) {
      setError('Please complete the payment information');
      return;
    }

    try {
      setError(null);

      // Prepare payment data (localStorage only)
      const paymentData: PaymentData = {
        method: paymentMethod,
        ...(paymentMethod === 'gpay' && { upiId: upiID }),
        ...(paymentMethod !== 'gpay' && paymentMethod !== 'cod' && {
          cardName: cardForm.cardName,
          cardNumber: cardForm.cardNumber.slice(-4), // Store only last 4 digits for security
          expiryDate: cardForm.expiryDate,
          // Don't store CVV for security
        })
      };

      // Save to localStorage
      localStorage.setItem('checkoutPaymentData', JSON.stringify(paymentData));

      // Navigate to confirmation
      router.push('/checkout/confirmation');
    } catch (err) {
      console.error('Error continuing to confirmation:', err);
      setError('Failed to save payment information. Please try again.');
    }
  }, [isPaymentValid, paymentMethod, upiID, cardForm, router]);

  // Error state
  if (error && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm mx-auto">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>

          <h2 className="text-lg font-semibold text-gray-800 mb-2">Payment Error</h2>
          <p className="text-gray-600 text-sm mb-6">{error}</p>
          <div className="space-y-3">
            <Button onClick={() => setError(null)} className="w-full">
              Try Again
            </Button>
            <Button variant="outline" onClick={() => router.push('/checkout')} className="w-full">
              Back to Checkout
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment options...</p>
          <p className="text-xs text-gray-400 mt-1">Setting up secure payment</p>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (!cartData || cartData.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm mx-auto">
          <div className="text-gray-400 mb-6">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v5a2 2 0 01-2 2H9.5a2 2 0 01-2-2v-5m6-5V7a2 2 0 00-2-2H9.5a2 2 0 00-2-2V7" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 text-sm mb-6">Add some items to your cart before checking out</p>
          <Button onClick={() => router.push('/productlist')} className="w-full">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  // Calculate totals
  const discount = 0;
  const shipping = 0;
  const subtotal = cartData.summary.subtotal;
  const total = Math.max(0, subtotal - discount + shipping);

  return (
    <div className="min-h-screen ">
      {/* Mobile Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10 lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => router.back()} className="p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold">Payment & Shipping</h1>
          <button 
            onClick={() => setShowSummary(!showSummary)}
            className="flex items-center gap-1 bg-orange-500 text-white px-3 py-1.5 rounded-full text-sm font-medium"
          >
            <span>IDR {total.toLocaleString()}</span>
            <svg className={`w-4 h-4 transition-transform ${showSummary ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Order Summary Dropdown */}
      {showSummary && (
        <div className="bg-white border-b border-gray-200 lg:hidden">
          <div className="px-4 py-4 space-y-3">
            {/* Items */}
            <div className="space-y-2">
              {cartData.items.slice(0, 2).map((item) => (
                <div key={`${item.id}-${item.size}`} className="flex gap-3 items-start">
                  <div className="relative flex-shrink-0">
                    <Image 
                      src={item.product.image[0] || '/p1.svg'} 
                      alt={item.product.name} 
                      width={40} 
                      height={40}
                      className="object-cover rounded"
                    />
                    <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{item.product.name}</h4>
                    <p className="text-xs text-gray-500">Size: {item.size}</p>
                  </div>
                  <span className="text-sm font-medium">IDR {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              {cartData.items.length > 2 && (
                <p className="text-xs text-gray-500 text-center">
                  +{cartData.items.length - 2} more items
                </p>
              )}
            </div>
            
            {/* Total */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-orange-600">IDR {total.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      <div className="lg:grid lg:grid-cols-2 lg:gap-10 lg:px-20 lg:py-10">
        {/* LEFT FORM */}
        <div className="bg-white lg:bg-transparent p-4 lg:p-0">
          {/* Desktop Header */}
          <h1 className="text-2xl lg:text-3xl font-bold mb-4 lg:mb-6 hidden lg:block">PAYMENT & SHIPPING</h1>

          {/* Progress Steps */}
          <div className="flex items-center justify-center lg:justify-start gap-2 lg:gap-6 mb-6 lg:mb-10 overflow-x-auto">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center">✓</div>
              <div className="text-xs hidden sm:block">
                <div className="font-semibold text-orange-600">Step 1</div>
                <div className="text-xs">PERSONAL</div>
              </div>
            </div>
            <div className="w-4 lg:w-8 h-0.5 bg-green-500 flex-shrink-0" />
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center">💳</div>
              <div className="text-xs hidden sm:block">
                <div className="font-semibold text-orange-600">Step 2</div>
                <div className="text-xs">PAYMENT</div>
              </div>
            </div>
            <div className="w-4 lg:w-8 h-0.5 bg-gray-300 flex-shrink-0" />
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="w-5 h-5 lg:w-6 lg:h-6 rounded-full border border-gray-400 text-xs flex items-center justify-center">☑</div>
              <div className="text-xs text-gray-500 hidden sm:block">
                <div>Step 3</div>
                <div className="text-xs">CONFIRM</div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <h2 className="text-lg lg:text-xl font-semibold mb-3 lg:mb-4">PAYMENT METHOD</h2>
          <div className="space-y-3 lg:space-y-4 mb-4 lg:mb-6">
            {/* COD Option */}
            <label className="flex items-center gap-3 cursor-pointer border-2 border-gray-300 rounded-lg p-3 lg:p-4 hover:border-orange-400 transition">
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="text-orange-500 w-4 h-4 lg:w-5 lg:h-5"
              />
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-800 text-sm lg:text-base">Cash on Delivery</div>
                  <div className="text-xs lg:text-sm text-gray-600">Pay when delivered - No advance payment</div>
                </div>
              </div>
            </label>

            {/* Other Payment Options */}
            <div className="grid grid-cols-2 gap-2 lg:gap-3">
              {['mastercard', 'visa', 'gpay', 'paypal'].map((method) => (
                <label key={method} className="relative flex flex-col items-center gap-1 lg:gap-2 cursor-pointer border border-gray-300 rounded-lg p-2 lg:p-3 hover:border-orange-400 transition opacity-50">
                  <input
                    type="radio"
                    name="payment"
                    value={method}
                    checked={paymentMethod === method}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-orange-500 scale-75 lg:scale-100"
                    disabled
                  />
                  <Image 
                    src={`/${method}.svg`} 
                    alt={`${method} payment option`}
                    width={32} 
                    height={32}
                    className="rounded lg:w-10 lg:h-10"
                  />
                  <span className="text-xs text-gray-500 font-medium text-center">Coming Soon</span>
                  <div className="absolute top-1 right-1 bg-yellow-100 text-yellow-700 text-xs px-1.5 py-0.5 rounded text-xs">
                    Soon
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Payment Details */}
          {paymentMethod === 'cod' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 lg:p-6 mb-4 lg:mb-6">
              <div className="flex items-center gap-2 lg:gap-3 mb-2 lg:mb-3">
                <svg className="w-5 h-5 lg:w-6 lg:h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-semibold text-green-800 text-sm lg:text-lg">Cash on Delivery Selected</span>
              </div>
              <div className="space-y-2 text-green-700 text-sm">
                <p className="font-medium">
                  💰 Total Amount: <span className="text-green-800 font-bold">IDR {total.toLocaleString()}</span>
                </p>
                <p className="text-sm">✅ Pay this amount when your order is delivered</p>
                <p className="text-sm">🚚 Our delivery agent will collect payment on delivery</p>
                <p className="text-sm">📞 We'll call before delivery to confirm availability</p>
              </div>
            </div>
          )}

          {paymentMethod === 'gpay' && (
            <div className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-semibold">ENTER YOUR UPI ID</label>
                <input
                  className="border border-gray-300 w-full px-3 lg:px-4 py-2.5 lg:py-3 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm lg:text-base"
                  type="text"
                  placeholder="Eg: john@upi"
                  value={upiID}
                  onChange={handleUPIChange}
                  aria-label="UPI ID"
                />
                {upiVerified && (
                  <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    UPI ID Verified
                  </p>
                )}
                {upiID && !upiVerified && (
                  <p className="text-red-600 text-sm mt-2">Please enter a valid UPI ID</p>
                )}
              </div>
            </div>
          )}

          {paymentMethod !== 'cod' && paymentMethod !== 'gpay' && (
            <div className="space-y-4 lg:space-y-6 mt-4 lg:mt-6">
              <div>
                <label className="block mb-2 text-sm font-semibold">NAME ON CARD</label>
                <input 
                  className="border border-gray-300 w-full px-3 lg:px-4 py-2.5 lg:py-3 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm lg:text-base" 
                  type="text" 
                  placeholder="Eg: John Doe"
                  value={cardForm.cardName}
                  onChange={(e) => handleCardFormChange('cardName', e.target.value)}
                  aria-label="Name on Card"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold">CARD NUMBER</label>
                <input 
                  className="border border-gray-300 w-full px-3 lg:px-4 py-2.5 lg:py-3 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm lg:text-base" 
                  type="text" 
                  placeholder="1234 5678 9012 3456"
                  value={cardForm.cardNumber}
                  onChange={(e) => handleCardFormChange('cardNumber', e.target.value)}
                  aria-label="Card Number"
                />
              </div>
              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                <div>
                  <label className="block mb-2 text-sm font-semibold">EXPIRY</label>
                  <input 
                    className="border border-gray-300 w-full px-3 lg:px-4 py-2.5 lg:py-3 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm lg:text-base" 
                    type="text" 
                    placeholder="MM/YY"
                    value={cardForm.expiryDate}
                    onChange={(e) => handleCardFormChange('expiryDate', e.target.value)}
                    aria-label="Expiry Date"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-semibold">CVV</label>
                  <input 
                    className="border border-gray-300 w-full px-3 lg:px-4 py-2.5 lg:py-3 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm lg:text-base" 
                    type="password" 
                    placeholder="123"
                    value={cardForm.cvv}
                    onChange={(e) => handleCardFormChange('cvv', e.target.value)}
                    aria-label="CVV"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="mt-4 lg:mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3 lg:p-4 text-sm">
            <div className="flex items-center gap-2 text-blue-800">
              <svg className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-9a2 2 0 00-2-2H6a2 2 0 00-2 2v9a2 2 0 002 2zm10-12V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="font-medium">Secure Checkout</span>
            </div>
            <p className="text-blue-600 mt-1 text-xs lg:text-sm">
              {paymentMethod === 'cod' 
                ? 'Your order details are secure. Pay safely when you receive your items.'
                : 'Your payment information is encrypted and secure. We never store sensitive details.'
              }
            </p>
          </div>
        </div>

        {/* RIGHT SUMMARY - Desktop Only */}
        <div className="hidden lg:block">
          <h2 className="text-2xl font-semibold mb-4">ORDER SUMMARY</h2>

          {/* Promo Banner */}
          <div className="bg-[#f5f1ec] border border-gray-300 text-sm px-4 py-3 flex justify-between items-center mb-6 rounded">
            <span>🎉 You saved IDR {discount.toLocaleString()}!</span>
            <button 
              className="text-gray-400 text-lg hover:text-gray-600"
              aria-label="Remove promo code"
            >
              ×
            </button>
          </div>

          {/* Products from Cart */}
          <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
            {cartData.items.map((item) => (
              <div key={`${item.id}-${item.size}`} className="flex gap-4 items-start">
                <div className="relative flex-shrink-0">
                  <Image 
                    src={item.product.image[0] || '/p1.svg'} 
                    alt={item.product.name} 
                    width={70} 
                    height={70}
                    className="object-cover rounded"
                  />
                  <span className="absolute -top-2 -right-2 bg-[#d9673f] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm truncate">{item.product.name}</h4>
                  <p className="text-sm text-gray-600">{item.quantity} × IDR {item.price.toLocaleString()}</p>
                  <p className="text-xs text-gray-400 mt-1">Size: {item.size}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Price Breakdown */}
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
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
              <span>Total</span>
              <span className="text-[#d9673f]">IDR {total.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Method Summary */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4 text-sm">
            <h4 className="font-semibold mb-2">Payment Method</h4>
            <div className="text-gray-600">
              {paymentMethod === 'cod' && (
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Cash on Delivery</span>
                </div>
              )}
              {paymentMethod !== 'cod' && (
                <span className="capitalize">{paymentMethod.replace('card', ' Card')}</span>
              )}
            </div>
          </div>

          {/* Personal Info Summary */}
          {formData && (
            <div className="mt-6 bg-gray-50 rounded-lg p-4 text-sm">
              <h4 className="font-semibold mb-2">Delivery Information</h4>
              <div className="space-y-1 text-gray-600">
                <p><span className="font-medium">Name:</span> {formData.name}</p>
                <p><span className="font-medium">Email:</span> {formData.email}</p>
                <p><span className="font-medium">Phone:</span> {formData.phone}</p>
                <p><span className="font-medium">Address:</span> {formData.street}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden">
        <Button 
          className="w-full  bg-[#d9673f] hover:bg-[#c2552d] text-white py-3 disabled:opacity-50 disabled:cursor-not-allowed text-base font-semibold rounded-xl"
          onClick={handleContinueToPayment}
          disabled={!isPaymentValid()}
        >
          CONTINUE TO CONFIRMATION
        </Button>
      </div>

      {/* Desktop Continue Button */}
<div className="hidden lg:block lg:col-span-2 lg:px-20 lg:pb-10">
  <div className="flex justify-end">
    <Button 
      className="w-fit bg-[#d9673f] hover:bg-[#c2552d] text-white px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold"
      onClick={handleContinueToPayment}
      disabled={!isPaymentValid()}
    >
      CONTINUE TO CONFIRMATION
    </Button>
  </div>
</div>


      {/* Mobile Padding for Fixed Button */}
      <div className="h-20 lg:hidden"></div>
    </div>
  )
};