'use client';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { Stepper } from "@/components/ui/stepper";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";

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

export default function Checkout() {
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
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    email: '',
    street: '',
    country: 'Indonesia',
    province: '',
    zipCode: ''
  });

  const router = useRouter();

  // Get auth headers (memoized for stability)
  const getAuthHeaders = useCallback(() => {
    const token = localStorage?.getItem('token') || sessionStorage?.getItem('token');
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
      if (!headers['Authorization']) return;
      
      const response = await fetch(`${API_BASE_URL}/addresses`, { headers });

      if (response.ok) {
        const data = await response.json();
        const addresses = data.addresses || [];
        setSavedAddresses(addresses);
        
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

  // Initialize checkout process
  useEffect(() => {
    const initializeCheckout = async () => {
      setLoading(true);
      setError(null);

      const token = localStorage?.getItem('token') || sessionStorage?.getItem('token');
      if (!token) {
        router?.push('/login');
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

        const savedFormData = localStorage?.getItem('checkoutFormData');
        if (savedFormData) {
          const parsedData = JSON.parse(savedFormData) as FormData;
          setFormData(prev => ({ ...prev, ...parsedData }));
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load checkout data');
      } finally {
        setLoading(false);
      }
    };
    
    initializeCheckout();
  }, [router, fetchCart, fetchAddresses]);

  // Handle address selection
  const handleAddressSelect = useCallback((addressId: number) => {
    const selectedAddress = savedAddresses.find(addr => addr.id === addressId);
    if (selectedAddress) {
      setSelectedAddressId(addressId);
      setUseNewAddress(false);
      setFormData(prev => ({
        ...prev,
        name: selectedAddress.name,
        phone: selectedAddress.phone,
        street: selectedAddress.street,
        country: selectedAddress.country,
        province: selectedAddress.state,
        zipCode: selectedAddress.zip
      }));
    }
  }, [savedAddresses]);

  // Handle new address option
  const handleUseNewAddress = useCallback(() => {
    setUseNewAddress(true);
    setSelectedAddressId(null);
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
  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (field !== 'email' && selectedAddressId && !useNewAddress) {
      setSelectedAddressId(null);
    }
  }, [selectedAddressId, useNewAddress]);

  // Handle continue to next step
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
    localStorage?.setItem('checkoutFormData', JSON.stringify(formData));
    router?.push('/checkout/shipping');

  }, [isFormValid, formData, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-orange-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} className="w-full bg-orange-500 hover:bg-orange-600">
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  if (!cartData || cartData.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add items to your cart before checking out.</p>
          <Button onClick={() => router?.push('/productlist')} className="w-full bg-orange-500 hover:bg-orange-600">
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  // Calculate totals
  const discount = 0; // Mock discount from image
  const shipping = 0;
  const subtotal = cartData.summary.subtotal;
  const total = Math.max(0, subtotal - discount + shipping);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">CHECKOUT FORM</h2>
              

              {/* Progress Steps */}
              <div className="flex items-center justify-between  mb-8">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">PERSONAL INFO</p>
                  </div>
                </div>
                <div className="flex-1 h-px bg-gray-200 mx-4"></div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">PAYMENT</p>
                  </div>
                </div>
                <div className="flex-1 h-px bg-gray-200 mx-4"></div>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">CONFIRMATION</p>
                  </div>
                </div>
              </div>

              {/* Address Selection for existing users */}
              {savedAddresses.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Delivery Address</h3>
                  <div className="space-y-3">
                    {savedAddresses.map((address) => (
                      <label
                        key={address.id}
                        className={`block border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedAddressId === address.id
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-300 hover:border-orange-300'
                        }`}
                      >
                        <div className="flex items-start">
                          <input
                            type="radio"
                            name="address"
                            checked={selectedAddressId === address.id}
                            onChange={() => handleAddressSelect(address.id)}
                            className="mt-1 h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                          />
                          <div className="ml-3 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900">{address.name}</span>
                              {address.isDefault && (
                                <Badge className="bg-green-100 text-green-800 text-xs">Default</Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {address.street}, {address.city}, {address.state} {address.zip}
                            </p>
                            <p className="text-sm text-gray-600">Phone: {address.phone}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                    
                    <label
                      className={`block border rounded-lg p-4 cursor-pointer transition-colors ${
                        useNewAddress
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-300 hover:border-orange-300'
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="address"
                          checked={useNewAddress}
                          onChange={handleUseNewAddress}
                          className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                        />
                        <span className="ml-3 font-semibold text-gray-900">Use a new address</span>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Contact Person */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">CONTACT PERSON</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NAME</label>
                    <Input 
                      placeholder="Eg: John Doe"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="focus:ring-orange-500 focus:border-orange-500"
                      disabled={selectedAddressId !== null && !useNewAddress}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">PHONE NUMBER</label>
                    <div className="flex gap-2">
                      <Select defaultValue="+62">
                        <SelectTrigger className="w-20 focus:ring-orange-500 focus:border-orange-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="+62">(+62)</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input 
                        placeholder="111-2222-33333"
                        className="flex-1 focus:ring-orange-500 focus:border-orange-500"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={selectedAddressId !== null && !useNewAddress}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">EMAIL</label>
                    <Input 
                      placeholder="Eg: example@example.com"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Address Detail - Show when using new address or no saved addresses */}
              {(useNewAddress || savedAddresses.length === 0) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">ADDRESS DETAIL</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ADDRESS</label>
                      <Input 
                        placeholder="Eg: ABC Street 12A, West Java, Indonesia"
                        value={formData.street}
                        onChange={(e) => handleInputChange('street', e.target.value)}
                        className="focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">COUNTRY</label>
                      <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                        <SelectTrigger className="focus:ring-orange-500 focus:border-orange-500">
                          <SelectValue placeholder="--Choose Country--" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Indonesia">Indonesia</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">STATE/PROVINCE</label>
                        <Select value={formData.province} onValueChange={(value) => handleInputChange('province', value)}>
                          <SelectTrigger className="focus:ring-orange-500 focus:border-orange-500">
                            <SelectValue placeholder="--Choose Province--" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Jakarta">Jakarta</SelectItem>
                            <SelectItem value="West Java">West Java</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ZIP CODE</label>
                        <Input
                          placeholder="--Choose ZIP Code--"
                          value={formData.zipCode}
                          onChange={(e) => handleInputChange('zipCode', e.target.value)}
                          className="focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button 
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 font-medium"
                onClick={handleContinue}
                disabled={!isFormValid()}
              >
                CONTINUE TO SHIPPING
              </Button>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 sticky top-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">ORDER SUMMARY</h3>
              
             

              {/* Product Items */}
              <div className="space-y-4 mb-6">
                {cartData.items.map((item) => (
                  <div key={`${item.productId}-${item.size}`} className="flex iitems-center gap-3">
                    <div className="relative">
                      <Image
                        src={item.product.image[0] || "/placeholder.svg"}
                        alt={item.product.name}
                        width={60}
                        height={60}
                        className="object-cover rounded-lg"
                      />
                      <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{item.product.name}</p>
                      <p className="text-xs text-gray-500">Size: {item.size}</p>
                      <p className="text-sm text-gray-700 font-medium">IDR {item.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Totals */}
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">IDR {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-red-600">
                 
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">IDR {shipping.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span className="text-gray-900">Total</span>
                  <span className="text-orange-600">IDR {total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}