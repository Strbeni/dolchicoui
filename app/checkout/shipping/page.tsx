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
  const [processingOrder, setProcessingOrder] = useState(false);
  
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
    if (paymentMethod === 'upi') return true;
  }, [paymentMethod]);

  // Handle COD order submission
  const handleCodOrderSubmission = useCallback(async (codCharges) => {
    if (!cartData || !formData) {
      throw new Error('Missing required data for order creation');
    }

    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    setProcessingOrder(true);

    // Calculate totals
    const subtotal = cartData.summary.subtotal || 0;
    const couponDiscount = appliedCoupon ? (appliedCoupon.type === "percentage" 
      ? Math.floor((subtotal * appliedCoupon.discount) / 100) 
      : appliedCoupon.discount) : 0;
    const finalAmount = subtotal - couponDiscount + codCharges;

    // Prepare order data matching the confirmation page format
    const orderData = {
      items: cartData.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        price: item.price
      })),
      amount: finalAmount,
      address: {
        name: formData.name,
        street: formData.street,
        city: formData.province,
        state: formData.province,
        zip: formData.zipCode,
        phone: formData.phone
      },
      paymentMethod: 'cod',
      codCharges: codCharges,
      notes: {
        coupon: appliedCoupon?.code || null,
        totalItems: cartData.summary.totalItems,
        paymentMethod: 'Cash on Delivery'
      }
    };

    try {
      // Create order using the same endpoint as confirmation page
      const response = await fetch(`${API_BASE_URL}/payment/create-order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      const orderResult = await response.json();
      
      if (!orderResult.success) {
        throw new Error(orderResult.message || 'Failed to create COD order');
      }

      const { dbOrderId } = orderResult.data;

      // Clear cart from backend
      try {
        await fetch(`${API_BASE_URL}/cart/clear`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (clearError) {
        console.error('Failed to clear cart:', clearError);
      }

      // Clear checkout data
      localStorage.removeItem('checkoutFormData');
      localStorage.removeItem('checkoutPaymentData');
      localStorage.removeItem('appliedCoupon');
      
      // Navigate to success page with order ID
      window.location.href = `/checkout/success?orderId=${dbOrderId}`;
      
    } catch (error) {
      console.error('COD order creation error:', error);
      throw new Error(error.message || 'Failed to create COD order');
    } finally {
      setProcessingOrder(false);
    }
  }, [cartData, formData, appliedCoupon]);

const handleContinueToPayment = useCallback(async () => {
  try {
    setError(null);
    const currentCodCharges = paymentMethod === 'cod' ? 100 : 0;
    const paymentData = {
      method: paymentMethod,
      codCharges: currentCodCharges
    };
    localStorage.setItem('checkoutPaymentData', JSON.stringify(paymentData));
    
    // If COD, create order directly without payment gateway
    if (paymentMethod === 'cod') {
      await handleCodOrderSubmission(currentCodCharges);
    } else {
      // For online payment, go to confirmation page
      window.location.href = '/checkout/confirmation';
    }
  } catch (err) {
    setError(err.message || 'Failed to process payment. Please try again.');
  }
}, [paymentMethod, cartData, formData, appliedCoupon]);


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
  const codCharges = paymentMethod === 'cod' ? 100 : 0;
  const total = Math.max(0, subtotal + savings + taxCollected + deliveryCharges + codCharges - couponDiscount);

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
                <label htmlFor="upi-mobile" className="ml-2 font-medium text-gray-900">Pay Online</label>
              </div>
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
                  A convenience fee of ₹100 will apply.
                </div>
              )}
            </div>

            {/* Payment Button */}
            <button
              type="button"
              className="w-full bg-orange-500 text-white py-4 rounded-md font-semibold text-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              onClick={handleContinueToPayment}
              disabled={!isPaymentValid() || processingOrder}
            >
              {processingOrder ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{paymentMethod === 'cod' ? 'PLACING ORDER...' : 'PROCESSING...'}</span>
                </div>
              ) : (
                paymentMethod === 'cod' ? 'Place COD Order' : 'Make Payment'
              )}
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
                {codCharges > 0 && (
                  <div className="flex justify-between">
                    <span>COD Charges:</span>
                    <span>₹ {codCharges}</span>
                  </div>
                )}
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
                  <label htmlFor="upi" className="ml-3 font-medium text-gray-900">Pay Online</label>
                </div>
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
                    A convenience fee of ₹100 will apply.
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
                disabled={!isPaymentValid() || processingOrder}
              >
                {processingOrder ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{paymentMethod === 'cod' ? 'PLACING...' : 'PROCESSING...'}</span>
                  </div>
                ) : (
                  paymentMethod === 'cod' ? 'Place COD Order' : 'Proceed To Checkout'
                )}
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
                {codCharges > 0 && (
                  <div className="flex justify-between">
                    <span>COD Charges:</span>
                    <span>₹ {codCharges}</span>
                  </div>
                )}
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