"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ChevronDown } from 'lucide-react';

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
  expiryMonth?: string;
  expiryYear?: string;
}

const COUPON_KEY = "appliedCoupon";

const PaymentMethodPage = () => {
  // State Management
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [upiID, setUpiID] = useState('');
  const [upiVerified, setUpiVerified] = useState(false);
  const [cartData, setCartData] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Card form state
  const [cardForm, setCardForm] = useState({
    cardName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Authentication check
  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      alert('Please login to continue');
      return false;
    }
    return true;
  }, []);

  // Get auth headers
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }, []);

  // Fetch cart data
  const fetchCart = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      if (!response.ok) throw new Error(`Failed to fetch cart: ${response.statusText}`);
      const result = await response.json();
      return result.success ? result.data : null;
    } catch (err) {
      console.error('Error fetching cart:', err);
      throw err;
    }
  }, [getAuthHeaders]);

  // Load data on component mount
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

        // Load saved form data from localStorage
        const savedFormData = localStorage.getItem('checkoutFormData');
        if (savedFormData) {
          try {
            const parsedFormData = JSON.parse(savedFormData);
            setFormData(parsedFormData);
          } catch {
            setError('Invalid form data. Please start checkout again.');
            return;
          }
        } else {
          setError('No delivery address found. Please complete checkout first.');
          return;
        }

        // Load applied coupon
        const storedCoupon = localStorage.getItem(COUPON_KEY);
        if (storedCoupon) {
          setAppliedCoupon(JSON.parse(storedCoupon));
        }

        // Load saved payment data
        const savedPaymentData = localStorage.getItem('checkoutPaymentData');
        if (savedPaymentData) {
          try {
            const paymentData = JSON.parse(savedPaymentData);
            if (paymentData.method === 'upi') {
              setPaymentMethod('upi');
              if (paymentData.upiId) {
                setUpiID(paymentData.upiId);
                setUpiVerified(true);
              }
            } else if (paymentData.method === 'card') {
              setPaymentMethod('card');
              if (paymentData.cardName) {
                setCardForm({
                  cardName: paymentData.cardName || '',
                  cardNumber: paymentData.cardNumber || '',
                  expiryMonth: paymentData.expiryMonth || '',
                  expiryYear: paymentData.expiryYear || '',
                  cvv: ''
                });
              }
            } else {
              setPaymentMethod('cod');
            }
          } catch {}
        }
      } catch (err) {
        setError('Failed to load checkout data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [checkAuth, fetchCart]);

  const handleUPIChange = useCallback((e) => {
    const value = e.target.value;
    setUpiID(value);
    setUpiVerified(!!(value && value.includes('@') && value.length > 5));
  }, []);

  const handleCardFormChange = useCallback((field, value) => {
    let processedValue = value;
    if (field === 'cardNumber') {
      processedValue = value.replace(/\D/g, '').slice(0, 16);
    }
    if (field === 'cvv') {
      processedValue = value.replace(/\D/g, '').slice(0, 4);
    }
    setCardForm(prev => ({
      ...prev,
      [field]: processedValue
    }));
  }, []);

  const isPaymentValid = useCallback(() => {
    if (paymentMethod === 'cod') return true;
    if (paymentMethod === 'upi') return upiVerified;
    return !!(
      cardForm.cardName.trim() &&
      cardForm.cardNumber.length === 16 &&
      cardForm.expiryMonth &&
      cardForm.expiryYear &&
      cardForm.cvv.length >= 3
    );
  }, [paymentMethod, upiVerified, cardForm]);

  const handleContinueToPayment = useCallback(() => {
    if (!isPaymentValid()) {
      setError('Please complete the payment information');
      return;
    }
    try {
      setError(null);
      const paymentData = {
        method: paymentMethod,
        ...(paymentMethod === 'upi' && { upiId: upiID }),
        ...(paymentMethod === 'card' && {
          cardName: cardForm.cardName,
          cardNumber: cardForm.cardNumber.slice(-4), // Only store last 4 digits
          expiryMonth: cardForm.expiryMonth,
          expiryYear: cardForm.expiryYear,
        })
      };
      localStorage.setItem('checkoutPaymentData', JSON.stringify(paymentData));
      // Navigate to confirmation page
      window.location.href = '/checkout/confirmation';
    } catch {
      setError('Failed to save payment information. Please try again.');
    }
  }, [isPaymentValid, paymentMethod, upiID, cardForm]);

  const handleEditAddress = () => {
    window.location.href = '/checkout';
  };

  const handleBackToCart = () => {
    window.location.href = '/cart';
  };

  // Calculate totals
  let couponDiscount = 0;
  let couponCode = '';
  if (appliedCoupon) {
    couponCode = appliedCoupon.code;
    if (appliedCoupon.type === 'percentage') {
      couponDiscount = Math.floor((cartData?.summary.subtotal || 0) * appliedCoupon.discount / 100);
    } else {
      couponDiscount = appliedCoupon.discount;
    }
  }

  const subtotal = cartData?.summary.subtotal || 0;
  const savings = couponDiscount; // You can make this dynamic based on your business logic
  const taxCollected = 0; // You can make this dynamic based on your business logic
  const deliveryCharges = 0;
  const total = Math.max(0, subtotal + savings + taxCollected + deliveryCharges - couponDiscount);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment options...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm mx-auto">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Payment Error</h2>
          <p className="text-gray-600 text-sm mb-6">{error}</p>
          <button 
            onClick={() => setError(null)} 
            className="w-full bg-orange-500 text-white py-2 rounded font-medium mb-2"
          >
            Try Again
          </button>
          <button 
            onClick={handleEditAddress} 
            className="w-full border border-orange-500 text-orange-500 py-2 rounded font-medium"
          >
            Back to Checkout
          </button>
        </div>
      </div>
    );
  }

  // Empty cart state
  if (!cartData || cartData.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some items to your cart before checking out</p>
          <button 
            onClick={() => window.location.href = '/productlist'} 
            className="w-full bg-orange-500 text-white py-2 rounded font-medium"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b">
            <button onClick={() => window.history.back()}>
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-semibold">Payment method</h1>
          </div>

          <div className="p-4 space-y-6">
            {/* UPI Option */}
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="upi-mobile"
                  name="paymentMethod"
                  checked={paymentMethod === 'upi'}
                  onChange={() => setPaymentMethod('upi')}
                  className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="upi-mobile" className="ml-2 font-medium text-gray-900">UPI</label>
              </div>
              
              {paymentMethod === 'upi' && (
                <div className="ml-6 space-y-2">
                  <label className="text-sm text-gray-700">
                    UPI ID is the format of name/phone number@bankname
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter UPI id"
                    value={upiID}
                    onChange={handleUPIChange}
                    autoComplete="off"
                  />
                  {upiID && !upiVerified && (
                    <p className="text-xs text-red-500">Please enter a valid UPI ID</p>
                  )}
                </div>
              )}
            </div>

            {/* Card Option */}
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="card-mobile"
                  name="paymentMethod"
                  checked={paymentMethod === 'card'}
                  onChange={() => setPaymentMethod('card')}
                  className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="card-mobile" className="ml-2 font-medium text-gray-900">Credit or Debit card</label>
                <div className="ml-3 flex items-center gap-1">
                  <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">RP</div>
                  <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">V</div>
                  <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">MC</div>
                </div>
              </div>

              {paymentMethod === 'card' && (
                <div className="ml-6 space-y-3">
                  <p className="text-xs text-gray-600">
                    Please ensure that you enable your card for online payments from your bank's app.
                  </p>
                  
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-md"
                    placeholder="Enter Card number"
                    value={cardForm.cardNumber}
                    onChange={(e) => handleCardFormChange('cardNumber', e.target.value)}
                    maxLength={16}
                  />
                  
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-md"
                    placeholder="Enter name"
                    value={cardForm.cardName}
                    onChange={(e) => handleCardFormChange('cardName', e.target.value)}
                  />
                  
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      className="p-3 border border-gray-300 rounded-md bg-white"
                      value={cardForm.expiryMonth}
                      onChange={(e) => handleCardFormChange('expiryMonth', e.target.value)}
                    >
                      <option value="">Month</option>
                      {Array.from({length: 12}, (_, i) => (
                        <option key={i+1} value={String(i+1).padStart(2, '0')}>
                          {String(i+1).padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                    
                    <select
                      className="p-3 border border-gray-300 rounded-md bg-white"
                      value={cardForm.expiryYear}
                      onChange={(e) => handleCardFormChange('expiryYear', e.target.value)}
                    >
                      <option value="">Year</option>
                      {Array.from({length: 10}, (_, i) => {
                        const year = new Date().getFullYear() + i;
                        return <option key={year} value={year}>{year}</option>;
                      })}
                    </select>
                    
                    <input
                      type="password"
                      className="p-3 border border-gray-300 rounded-md"
                      placeholder="CVV"
                      value={cardForm.cvv}
                      onChange={(e) => handleCardFormChange('cvv', e.target.value)}
                      maxLength={4}
                    />
                  </div>
                  
                  <button
                    type="button"
                    className="w-full bg-orange-500 text-white py-3 rounded-md font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
                    disabled={!isPaymentValid()}
                  >
                    Verify
                  </button>
                </div>
              )}
            </div>

            {/* COD Option */}
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="cod-mobile"
                  name="paymentMethod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="cod-mobile" className="ml-2 font-medium text-gray-900">Cash on delivery</label>
              </div>
              
              {paymentMethod === 'cod' && (
                <div className="ml-6 text-xs text-gray-600">
                  Cash, UPI and Cards accepted. <span className="text-blue-600 underline">Know more</span>.<br />
                  A convenience fee of ₹15 will apply.
                </div>
              )}
            </div>

            {/* Payment Button */}
            <button
              type="button"
              className="w-full bg-orange-500 text-white py-4 rounded-md font-semibold text-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              onClick={handleContinueToPayment}
              disabled={!isPaymentValid()}
            >
              Make Payment
            </button>

            {/* Delivery Address */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <h3 className="font-semibold text-gray-900">Delivery Address</h3>
              {formData && (
                <div className="text-sm space-y-1">
                  <div><span className="font-medium">Full Name:</span> {formData.name}</div>
                  <div><span className="font-medium">Mobile number:</span> {formData.phone}</div>
                  <div><span className="font-medium">Postcode:</span> {formData.zipCode}</div>
                  <div><span className="font-medium">City:</span> {formData.province}</div>
                  <div><span className="font-medium">House / apartment no. and street address:</span> {formData.street}</div>
                </div>
              )}
              <button 
                onClick={handleEditAddress}
                className="w-full border border-orange-500 text-orange-500 py-2 rounded-md font-medium mt-3"
              >
                Edit Address
              </button>
            </div>

            {/* Order Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Items</h3>
              <div className="flex gap-2 mb-4">
                {cartData.items.slice(0, 2).map((item, i) => (
                  <img
                    key={i}
                    src={item.product.image[0] || "/api/placeholder/50/50"}
                    alt={item.product.name}
                    className="w-12 h-12 rounded object-cover bg-gray-200"
                  />
                ))}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal ({cartData.summary.totalItems} items):</span>
                  <span className="font-bold text-green-700">₹ {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Saving:</span>
                  <span>₹ {Math.abs(savings)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax collected:</span>
                  <span>₹ {taxCollected}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges:</span>
                  <span className="text-green-600 font-medium">Free Delivery</span>
                </div>
                <div className="flex justify-between">
                  <span>Coupons:</span>
                  {appliedCoupon ? (
                    <span className="text-green-600 font-semibold">
                      -₹ {couponDiscount} 
                      <span className="ml-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                        {couponCode} applied
                      </span>
                    </span>
                  ) : (
                    <span className="text-gray-400">No coupon applied</span>
                  )}
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                  <span>Estimated total:</span>
                  <span className="text-orange-600">₹ {total.toLocaleString()}</span>
                </div>
              </div>
              
              <button 
                onClick={handleBackToCart}
                className="w-full border border-orange-500 text-orange-500 py-2 rounded-md font-medium mt-4"
              >
                Edit Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      <div className="max-w-6xl mx-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Payment Method */}
          <div className="lg:col-span-2 bg-white rounded-lg p-8 shadow-sm">
            <h1 className="text-2xl font-bold mb-8">Payment method</h1>
            
            <div className="space-y-6">
              {/* UPI Option */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="upi"
                    name="paymentMethod"
                    checked={paymentMethod === 'upi'}
                    onChange={() => setPaymentMethod('upi')}
                    className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                  />
                  <label htmlFor="upi" className="ml-3 font-medium text-gray-900">UPI</label>
                </div>
                
                {paymentMethod === 'upi' && (
                  <div className="ml-7 space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Enter UPI id <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="block w-full max-w-md p-3 border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="name@bankname"
                      value={upiID}
                      onChange={handleUPIChange}
                      autoComplete="off"
                    />
                    <p className="text-xs text-gray-500">The UPI ID is in the format of name/phone number@bankname</p>
                    {upiID && !upiVerified && (
                      <p className="text-xs text-red-500">Please enter a valid UPI ID</p>
                    )}
                  </div>
                )}
              </div>

              {/* Card Option */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="card"
                    name="paymentMethod"
                    checked={paymentMethod === 'card'}
                    onChange={() => setPaymentMethod('card')}
                    className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                  />
                  <label htmlFor="card" className="ml-3 font-medium text-gray-900">Credit or Debit card</label>
                  <div className="ml-4 flex items-center gap-2">
                    <div className="w-10 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">RP</div>
                    <div className="w-10 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">VISA</div>
                    <div className="w-10 h-6 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">MC</div>
                  </div>
                </div>

                {paymentMethod === 'card' && (
                  <div className="ml-7 space-y-4">
                    <p className="text-xs text-gray-600">
                      Please ensure that you enable your card for online payments from your bank's app.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        className="p-2 border border-gray-300 rounded"
                        placeholder="Enter Card number"
                        value={cardForm.cardNumber}
                        onChange={(e) => handleCardFormChange('cardNumber', e.target.value)}
                        maxLength={16}
                      />
                      <input
                        type="text"
                        className="p-2 border border-gray-300 rounded"
                        placeholder="Enter name"
                        value={cardForm.cardName}
                        onChange={(e) => handleCardFormChange('cardName', e.target.value)}
                      />
                    </div>
                    
                    <div className="flex gap-3 max-w-md">
                      <select
                        className="block w-1/2 px-2 py-2 border border-gray-300 rounded bg-white"
                        value={cardForm.expiryMonth}
                        onChange={(e) => handleCardFormChange('expiryMonth', e.target.value)}
                      >
                        <option value="">Month</option>
                        {Array.from({length: 12}, (_, i) => (
                          <option key={i+1} value={String(i+1).padStart(2, '0')}>
                            {String(i+1).padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                      
                      <select
                        className="block w-1/2 px-2 py-2 border border-gray-300 rounded bg-white"
                        value={cardForm.expiryYear}
                        onChange={(e) => handleCardFormChange('expiryYear', e.target.value)}
                      >
                        <option value="">Year</option>
                        {Array.from({length: 10}, (_, i) => {
                          const year = new Date().getFullYear() + i;
                          return <option key={year} value={year}>{year}</option>;
                        })}
                      </select>
                      
                      <input
                        type="password"
                        className="block w-1/2 px-2 py-2 border border-gray-300 rounded"
                        placeholder="CVV"
                        value={cardForm.cvv}
                        onChange={(e) => handleCardFormChange('cvv', e.target.value)}
                        maxLength={4}
                      />
                    </div>
                    
                    <button
                      type="button"
                      className="bg-orange-500 text-white px-6 py-2 rounded font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
                      disabled={!isPaymentValid()}
                    >
                      Verify
                    </button>
                  </div>
                )}
              </div>

              {/* COD Option */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="cod"
                    name="paymentMethod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="w-4 h-4 text-orange-600 focus:ring-orange-500"
                  />
                  <label htmlFor="cod" className="ml-3 font-medium text-gray-900">Cash on delivery</label>
                </div>
                
                {paymentMethod === 'cod' && (
                  <div className="ml-7 text-xs text-gray-500">
                    Cash, UPI and Cards accepted. <span className="text-blue-600 underline cursor-pointer">Know more</span>.<br />
                    A convenience fee of ₹15 will apply.
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                type="button"
                className="flex-1 border border-orange-500 text-orange-500 py-2 px-6 rounded font-medium hover:bg-orange-50 transition-colors"
                onClick={handleEditAddress}
              >
                Edit Address
              </button>
              <button
                type="button"
                className="flex-1 bg-orange-500 text-white py-2 px-6 rounded font-medium hover:bg-orange-600 transition-colors disabled:opacity-50"
                onClick={handleContinueToPayment}
                disabled={!isPaymentValid()}
              >
                Proceed To Checkout
              </button>
            </div>

            {/* Footer Text */}
            <div className="mt-7 text-xs text-gray-500 space-y-1">
              <p>Need help? Check our help pages or <a href="#" className="underline">contact us 24x7</a></p>
              <p>When your order is placed, we'll send you an e-mail message acknowledging receipt of your order.</p>
              <p>See <a href="#" className="underline">Amazon's Return Policy</a>.</p>
              <p><a href="#" className="underline font-medium" onClick={handleBackToCart}>Back to cart</a></p>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-[#f8f8f8] rounded-lg p-6 shadow-sm">
              <h2 className="font-semibold text-lg mb-2">Order summary</h2>
              
              <div className="flex gap-2 mb-3 items-center">
                {cartData.items.slice(0, 2).map((item, i) => (
                  <img
                    key={i}
                    src={item.product.image[0] || "/api/placeholder/60/60"}
                    alt={item.product.name}
                    className="w-15 h-15 rounded object-cover bg-gray-200"
                  />
                ))}
              </div>
              
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal ({cartData.summary.totalItems} items):</span>
                  <span className="font-bold text-green-700">₹ {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Saving:</span>
                  <span>₹ {Math.abs(savings)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax collected:</span>
                  <span>₹ {taxCollected}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges:</span>
                  <span className="text-green-600 font-medium">Free Delivery</span>
                </div>
                <div className="flex justify-between">
                  <span>Coupons:</span>
                  {appliedCoupon ? (
                    <span className="text-green-600 font-semibold">
                      -₹ {couponDiscount} 
                      <span className="ml-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-medium">
                        {couponCode} applied
                      </span>
                    </span>
                  ) : (
                    <span className="text-gray-400">No coupon applied</span>
                  )}
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                  <span>Total:</span>
                  <span className="text-orange-600">₹ {total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-[#f8f8f8] rounded-lg p-6 shadow-sm">
              <h2 className="font-semibold text-lg mb-2">Delivering Address</h2>
              {formData && (
                <div className="text-sm space-y-1">
                  <div><span className="font-medium">Full Name:</span> {formData.name}</div>
                  <div><span className="font-medium">Mobile number:</span> {formData.phone}</div>
                  <div><span className="font-medium">Postcode:</span> {formData.zipCode}</div>
                  <div><span className="font-medium">City:</span> {formData.province}</div>
                  <div><span className="font-medium">House / apartment no. and street address:</span> {formData.street}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodPage;