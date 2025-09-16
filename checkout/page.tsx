"use client";
import React, { useState, useEffect, useCallback } from "react";
import { ChevronRight, Plus, ShoppingCart, MapPin, Phone } from "lucide-react";
import { useRouter } from "next/navigation";

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

// Types
interface CartItem {
  id: number;
  productId: number;
  size: string;
  quantity: number;
  price: number;
  product: { name: string; image: string[] };
}

interface CartData {
  items: CartItem[];
  summary: { totalItems: number; subtotal: number };
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
  isDefault: boolean;
}

export default function CheckoutForm() {
  const router = useRouter();

  // State
  const [currentStep, setCurrentStep] = useState(0);
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [savedAddresses, setSavedAddresses] = useState<AddressType[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [editingAddress, setEditingAddress] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    email: "",
    street: "",
    country: "Indonesia",
    province: "",
    zipCode: "",
  });

  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);

  const getAuthHeaders = useCallback(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") || sessionStorage.getItem("token") : null;
    return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  }, []);

  // Fetch Addresses
  const fetchAddresses = useCallback(async () => {
    setLoading(true);
    try {
      const headers = getAuthHeaders();
      if (!headers.Authorization || headers.Authorization === "Bearer null") return;

      const res = await fetch(`${API_BASE_URL}/api/addresses`, { headers });
      if (res.ok) {
        const data = await res.json();
        const addresses = data.addresses || [];
        setSavedAddresses(addresses);

        const defaultAddress = addresses.find((a) => a.isDefault);
        if (defaultAddress && !selectedAddressId) {
          selectAddress(defaultAddress);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, selectedAddressId]);

  // Fetch Cart
  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/cart`, { headers: getAuthHeaders() });
      if (!res.ok) throw new Error(res.statusText);
      const result = await res.json();
      return result.success ? result.data : null;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    const init = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") || sessionStorage.getItem("token") : null;
      if (!token) {
        setError("Please login to continue checkout");
        setLoading(false);
        return;
      }
      try {
        const [cartResult] = await Promise.all([fetchCart(), fetchAddresses()]);
        if (!cartResult || cartResult.items.length === 0) setCartData(null);
        else setCartData(cartResult);

        const savedForm = typeof window !== "undefined" ? localStorage.getItem("checkoutFormData") : null;
        if (savedForm) setFormData((prev) => ({ ...prev, ...JSON.parse(savedForm) }));

        const storedCoupon = typeof window !== "undefined" ? localStorage.getItem("appliedCoupon") : null;
        if (storedCoupon) setAppliedCoupon(JSON.parse(storedCoupon));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load checkout data");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [fetchCart, fetchAddresses]);

  const selectAddress = (address: AddressType) => {
    setSelectedAddressId(address.id);
    setEditingAddress(false);
    setFormData({
      name: address.name || "",
      phone: address.phone || "",
      email: "",
      street: address.street || "",
      country: address.country || "Indonesia",
      province: address.state || "",
      zipCode: address.zip || "",
    });
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (selectedAddressId && !editingAddress && field !== "email" && field !== "country" && field !== "province") {
      setSelectedAddressId(null);
      setEditingAddress(true);
    }
  };

  const validateForm = () => {
    const { name, phone, email, street, province, zipCode } = formData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return name && phone && email && street && province && zipCode && emailRegex.test(email);
  };

  const handleContinue = () => {
    if (!validateForm()) {
      setError("Please fill all required fields with valid data");
      return;
    }
    setError(null);
    if (typeof window !== "undefined") localStorage.setItem("checkoutFormData", JSON.stringify(formData));
    router.push("/checkout/shipping");
  };

  const handleEditCart = () => router.back();

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );

  if (error)
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

  if (!cartData || cartData.items.length === 0)
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="text-center max-w-md mx-auto">
          <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add items to your cart before checking out.</p>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-md font-medium"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );

  // Totals
  const subtotal = cartData.summary.subtotal;
  const savings = 0;
  const deliveryCharges = 0;
  const couponDiscount =
    appliedCoupon?.type === "percentage"
      ? Math.floor((subtotal * appliedCoupon.discount) / 100)
      : appliedCoupon?.discount || 0;
  const taxCollected = Math.round((subtotal - couponDiscount) * 0.18 * 100) / 100;
  const total = Math.max(0, subtotal - savings + deliveryCharges + taxCollected - couponDiscount);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-8">Checkout Form</h1>

              {/* Saved Addresses */}
              {savedAddresses.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Saved Address</h2>
                    <button
                      onClick={() => setEditingAddress(true)}
                      className="flex items-center text-orange-500 hover:text-orange-600 text-sm font-medium"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add Address
                    </button>
                  </div>
                  <div className="space-y-3">
                    {savedAddresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                          selectedAddressId === addr.id
                            ? "border-orange-500 bg-orange-50 shadow-sm"
                            : "border-gray-200 hover:border-orange-300 hover:shadow-sm"
                        }`}
                        onClick={() => selectAddress(addr)}
                      >
                        <div className="flex items-start space-x-3">
                          <input
                            type="radio"
                            name="address"
                            checked={selectedAddressId === addr.id}
                            readOnly
                            className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                          />
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">{addr.name}</div>
                            <div className="text-sm text-gray-600">
                              {addr.street}, {addr.city}, {addr.state}, {addr.zip}, {addr.country}
                            </div>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <Phone className="w-3 h-3 mr-1 text-gray-400" /> {addr.phone}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div
                      className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                        editingAddress ? "border-orange-500 bg-orange-50 shadow-sm" : "border-gray-200 hover:border-orange-300 hover:shadow-sm"
                      }`}
                      onClick={() => setEditingAddress(true)}
                    >
                      <div className="flex items-center space-x-3">
                        <input type="radio" name="address" checked={editingAddress} readOnly className="h-4 w-4 text-orange-600 border-gray-300" />
                        <span className="font-medium text-gray-900">Use a new address</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Address Form */}
              {editingAddress && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Address Details</h3>
                  <div className="space-y-4">
                    {["name", "phone", "email", "street"].map((field) => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {field.charAt(0).toUpperCase() + field.slice(1)} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type={field === "email" ? "email" : "text"}
                          value={(formData as any)[field]}
                          onChange={(e) => handleInputChange(field as keyof FormData, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                        />
                      </div>
                    ))}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          State/Province <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.province}
                          onChange={(e) => handleInputChange("province", e.target.value)}
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
                          value={formData.zipCode}
                          onChange={(e) => handleInputChange("zipCode", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.country}
                        onChange={(e) => handleInputChange("country", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-colors"
                      >
                        <option value="Indonesia">Indonesia</option>
                        <option value="India">India</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600">{error}</div>}

              <button
                type="button"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-6 rounded-md font-medium transition-colors duration-200 flex items-center justify-center"
                onClick={handleContinue}
                disabled={!validateForm()}
              >
                Proceed To Checkout <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
                <button onClick={handleEditCart} className="text-orange-500 hover:text-orange-600 text-sm font-medium">
                  Edit Cart
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-3">Items</p>
                <div className="flex space-x-3">
                  {cartData.items.slice(0, 2).map((item, index) => (
                    <div key={`${item.productId}-${item.size}`} className="relative">
                      <img src={item.product.image[0] || "/api/placeholder/80/80"} alt={item.product.name} className="w-16 h-16 object-cover rounded-md" />
                      <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">{item.quantity}</span>
                      {index === 1 && cartData.items.length > 2 && (
                        <div className="text-xs text-gray-500 mt-1 text-center">+{cartData.items.length - 2} more</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3 border-t pt-4 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal ({cartData.summary.totalItems} items):</span>
                  <span>₹ {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Savings:</span>
                  <span>₹ {savings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax Collected:</span>
                  <span>₹ {taxCollected}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Charges:</span>
                  <span className="text-green-600 font-medium">Free Delivery</span>
                </div>
                <div className="flex justify-between">
                  <span>Coupon Discount:</span>
                  <span>- ₹ {couponDiscount}</span>
                </div>
                <div className="flex justify-between font-semibold text-gray-900 border-t pt-2">
                  <span>Total:</span>
                  <span>₹ {total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
