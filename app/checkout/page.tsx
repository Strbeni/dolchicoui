"use client";
import React, { useState, useEffect, useCallback } from "react";
import { ChevronRight, Plus, Edit2, ShoppingCart, MapPin, Phone, Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

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

interface FormData {
  name: string;
  phone: string;
  email: string;
  street: string;
  country: string;
  province: string;
  zipCode: string;
}

interface AddressType {
  id: number;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  instructions?: string;
  isDefault: boolean;
}

export default function CheckoutForm() {
  // Get coupon code from query params
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const couponCode = searchParams ? searchParams.get('coupon') : null;
  // State Management
  const [currentStep, setCurrentStep] = useState(0);
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Address related state
  const [savedAddresses, setSavedAddresses] = useState<AddressType[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showAllAddresses, setShowAllAddresses] = useState(false);
  // const [showEmailAdress, setShowEmailAdress] = useState(null); For additional email field if needed

  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    street: '',
    country: 'Indonesia',
    province: '',
    zipCode: ''
  });

  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  // Get auth headers (memoized for stability)
  const getAuthHeaders = useCallback(() => {
    const token = typeof window !== 'undefined' ?
      localStorage?.getItem('token') || sessionStorage?.
      getItem('token') : null;
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }, []);

  // Fetch saved addresses
  const fetchAddresses = useCallback(async () => {
    try {
      setAddressesLoading(true);
      const headers = getAuthHeaders();
      if (!headers['Authorization'] || headers['Authorization'] === 'Bearer null') {
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/addresses`, { headers });

      if (response.ok) {
        const data = await response.json();
        const addresses = data.addresses || [];
        setSavedAddresses(addresses);
        console.log('Fetched addresses:', addresses);
        const defaultAddress = addresses.find((addr: AddressType) => addr.isDefault);
        if (defaultAddress && !selectedAddressId) {
          setSelectedAddressId(defaultAddress.id);
          setFormData(prev => ({
            ...prev,
            name: defaultAddress.name,
            phone: defaultAddress.phone,
            street: defaultAddress.street,
            country: defaultAddress.country,
            province: defaultAddress.state,
            zipCode: defaultAddress.zip,
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching addresses:', err);
    } finally {
      setAddressesLoading(false);
    }
  }, [getAuthHeaders, selectedAddressId]);

  // Fetch cart data
  const fetchCart = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/cart`, {
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

  // Initialize checkout process
  useEffect(() => {
    const initializeCheckout = async () => {
      setLoading(true);
      setError(null);

      const token = typeof window !== 'undefined' ?
        localStorage?.getItem('token') || sessionStorage?.getItem('token') : null;

      if (!token) {
        setError('Please login to continue with checkout');
        setLoading(false);
        return;
      }

      try {
        const [cartResult] = await Promise.all([
          fetchCart(),
          fetchAddresses()
        ]);

        if (!cartResult || cartResult.items.length === 0) {
          setCartData(null);
          setLoading(false);
          return;
        }

        setCartData(cartResult);

        const savedFormData = typeof window !== 'undefined' ?
          localStorage?.getItem('checkoutFormData') : null;
        if (savedFormData) {
          const parsedData = JSON.parse(savedFormData) as FormData;
          setFormData(prev => ({ ...prev, ...parsedData }));
        }

        // Coupon sync from localStorage
        const storedCoupon = typeof window !== 'undefined' ? localStorage.getItem("appliedCoupon") : null;
        if (storedCoupon) {
          setAppliedCoupon(JSON.parse(storedCoupon));
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load checkout data');
      } finally {
        setLoading(false);
      }
    };

    initializeCheckout();
  }, [fetchCart, fetchAddresses]);

  // Handle address selection
  const handleAddressSelect = useCallback((addressId: number, e?: React.MouseEvent | React.ChangeEvent) => {
    // Prevent any default form submission or page refresh
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const selectedAddress = savedAddresses.find(addr => addr.id === addressId);
    if (selectedAddress) {
      setSelectedAddressId(addressId);
      setUseNewAddress(false);
      // Show the address form so users can see and edit the populated values
      setShowAddressForm(true);
      setFormData({
        name: selectedAddress.name || '',
        phone: selectedAddress.phone || '',
        email: '',
        street: selectedAddress.street || '',
        country: selectedAddress.country || 'Indonesia',
        province: selectedAddress.state || '',
        zipCode: selectedAddress.zip || ''
      });
    }
  }, [savedAddresses]);

  // Handle new address option
  const handleUseNewAddress = useCallback((e?: React.MouseEvent | React.ChangeEvent) => {
    // Prevent any default form submission or page refresh
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    setUseNewAddress(true);
    setSelectedAddressId(null);
    setShowAddressForm(true);
    setFormData(prev => ({
      name: '',
      phone: '',
      email: prev.email,
      street: '',
      country: 'Indonesia',
      province: '',
      zipCode: ''
    }));
  }, []);

  // Form validation
  const isFormValid = useCallback(() => {
    return !!(
      formData.name.trim() &&
      formData.phone.trim() &&
      formData.email.trim() &&
      formData.street.trim() &&
      formData.province &&
      formData.zipCode
    );
  }, [formData]);

  // Handle form input changes
  const handleInputChange = useCallback((field: keyof FormData, value: string, e?: React.ChangeEvent) => {
    // Prevent any default form submission
    if (e) {
      e.preventDefault();
    }

    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Only clear address selection if user is actually editing the address details
    // and not just changing country, province/state, or other non-address fields
    if (field !== 'email' && field !== 'country' && field !== 'province' && selectedAddressId && !useNewAddress) {
      setSelectedAddressId(null);
    }
  }, [selectedAddressId, useNewAddress]);

  const handleContinue = useCallback(() => {
    if (!isFormValid()) {
      setError('Please fill in all required fields');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    setError(null);
    if (typeof window !== 'undefined') {
      localStorage?.setItem('checkoutFormData', JSON.stringify(formData));
    }
    router.push("/checkout/shipping"); // <-- Yahan route update karo
  }, [isFormValid, formData, router]);

  // Handle edit cart (Back)
  const handleEditCart = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!cartData || cartData.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center max-w-md mx-auto">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add items to your cart before checking out.</p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md font-medium"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  // Calculate totals
  const subtotal = cartData.summary.subtotal;
  const savings = 0;
  const deliveryCharges = 0;

  let couponDiscount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      couponDiscount = Math.floor((subtotal * appliedCoupon.discount) / 100);
    } else {
      couponDiscount = appliedCoupon.discount;
    }
  }

  // Calculate tax (18% GST on subtotal after discount)
  const taxRate = 0.18; // 18% GST
  const taxableAmount = subtotal - couponDiscount;
  const taxCollected = Math.round(taxableAmount * taxRate * 100) / 100; // Round to 2 decimal places

  const total = Math.max(0, subtotal - savings + taxCollected + deliveryCharges - couponDiscount);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-8 font-libre">Checkout Form</h1>
              {/* Saved Addresses Section */}
              {savedAddresses.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Saved Address</h2>
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(true)}
                      className="flex items-center text-orange-500 hover:text-orange-600 text-sm font-medium"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Address
                    </button>
                  </div>
                  <div className="grid grid-cols-1  md:grid-cols-2 gap-4">
                    {(showAllAddresses ? savedAddresses : savedAddresses.slice(0, 2)).map((address) => (
                      <div
                        key={address.id}
                        className={`border rounded-lg p-4 cursor-pointer bg-gray-100 transition-all duration-200 ${selectedAddressId === address.id
                            ? 'border-orange-500 bg-orange-50 shadow-sm'
                            : 'border-gray-200 hover:border-orange-300 hover:shadow-sm'
                          }`}
                        onClick={() => handleAddressSelect(address.id)}
                      >
                        <div className="flex items-start space-x-3">
                          <input
                            type="radio"
                            name="address"
                            checked={selectedAddressId === address.id}
                            onChange={(e) => handleAddressSelect(address.id, e)}
                            className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-sm font-medium text-gray-900">Use this address</span>
                              <div className="flex items-center gap-2">
                                {address.isDefault && (
                                  <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded font-medium">
                                    Default
                                  </span>
                                )}
                                <button type="button" className="text-orange-500 hover:text-orange-600 text-xs font-medium">
                                  Edit 
                                </button>
                              </div>
                            </div>
                            <div className="text-sm text-gray-700 space-y-1">
                              <p>
                                <span className="font-medium">Full Name :</span> {address.name}
                              </p>
                              <p>
                                <span className="font-medium">Mobile number :</span> {address.phone}
                              </p>
                              <p>
                                <span className="font-medium">Postcode :</span> {address.zip}
                              </p>
                              <p>
                                <span className="font-medium">City :</span> {address.city}
                              </p>
                              <p>
                                <span className="font-medium">House / apartment no. and street address :</span> {address.street}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* Add New Address Option */}
                    <div
                      className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${useNewAddress
                          ? 'border-orange-500 bg-orange-50 shadow-sm'
                          : 'border-gray-200 hover:border-orange-300 hover:shadow-sm'
                        }`}
                      onClick={(e) => handleUseNewAddress(e)}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="address"
                          checked={useNewAddress}
                          onChange={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleUseNewAddress();
                          }}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                        />
                        <span className="font-medium text-gray-900">Use this address</span>
                        <Plus className="w-4 h-4 text-orange-500" />
                      </div>
                    </div>
                  </div>
                  {savedAddresses.length > 2 && (
                    <div className="mt-4 text-center">
                      <button 
                        type="button"
                        onClick={() => setShowAllAddresses(!showAllAddresses)}
                        className="text-orange-500 hover:text-orange-600 text-sm font-medium transition-colors duration-200"
                      >
                        {showAllAddresses ? 'See Less' : `See More (${savedAddresses.length - 2} more)`}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Address Form - Show when adding new address or no saved addresses */}
              {(showAddressForm || useNewAddress || savedAddresses.length === 0) && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Address details</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value, e)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mobile Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="Enter mobile number"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value, e)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="Enter email address"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value, e)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value, e)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                      >
                        <option value="Indonesia">Indonesia</option>
                        <option value="India">India</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State/Province <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.province}
                          onChange={(e) => handleInputChange('province', e.target.value, e)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                        >
                          <option value="">Select State/Province</option>
                          <option value="Jakarta">Jakarta</option>
                          <option value="West Java">West Java</option>
                          <option value="Maharashtra">Maharashtra</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ZIP Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Enter ZIP code"
                          value={formData.zipCode}
                          onChange={(e) => handleInputChange('zipCode', e.target.value, e)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Street Address <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        placeholder="House number and street name"
                        value={formData.street}
                        onChange={(e) => handleInputChange('street', e.target.value, e)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                type="button"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-md font-medium transition-colors duration-200 flex items-center justify-center"
                onClick={handleContinue}
                disabled={!isFormValid()}
              >
                Proceed To Checkout
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Order summary</h3>
                <button
                  onClick={handleEditCart}
                  className="text-orange-500 hover:text-orange-600 text-sm font-medium"
                >
                  Edit Cart
                </button>
              </div>
              {/* Items Header */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">Items</p>
                <div className="flex space-x-3">
                  {cartData.items.slice(0, 2).map((item, index) => (
                    <div key={`${item.productId}-${item.size}`} className="relative">
                      <img
                        src={item.product.image[0] || "/api/placeholder/80/80"}
                        alt={item.product.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                        {item.quantity}
                      </span>
                      {index === 1 && cartData.items.length > 2 && (
                        <div className="text-xs text-gray-500 mt-1 text-center">
                          +{cartData.items.length - 2} more
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              {/* Order Totals */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({cartData.summary.totalItems} items):</span>
                  <span className="text-gray-900">₹ {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Savings:</span>
                  <span>₹ {savings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax Collected:</span>
                  <span className="text-gray-900">₹ {taxCollected}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Charges:</span>
                  <span className="text-green-600 font-medium">Free Delivery</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Coupons:</span>
                  {appliedCoupon ? (
                    <span className="text-green-600">
                      -₹ {couponDiscount}
                      <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">{appliedCoupon.code}</span>
                    </span>
                  ) : (
                    <span className="text-gray-400">No coupon applied</span>
                  )}
                </div>
                <div className="flex justify-between text-lg font-bold pt-3 border-t">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-orange-600">₹ {total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}