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
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
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
          // *** FIX: Use a functional update to prevent dependency on formData ***
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
  }, [getAuthHeaders, selectedAddressId]); // *** FIX: Removed formData.email dependency ***

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

      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        router.push('/login');
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

        const savedFormData = localStorage.getItem('checkoutFormData');
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
  }, [router, fetchCart, fetchAddresses]); // Dependencies are stable now

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
      email: prev.email, // Preserve email
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
    localStorage.setItem('checkoutFormData', JSON.stringify(formData));
    router.push('/checkout/shipping');

  }, [isFormValid, formData, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} className="w-full">
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  
  if (!cartData || cartData.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add items to your cart before checking out.</p>
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
    <div className="min-h-screen bg-white px-6 lg:px-20 py-12 flex flex-col lg:flex-row gap-10">
      <div className="w-full lg:w-2/3">
        <h1 className="text-3xl font-serif mb-2">
          <span className="text-[#844416] font-bold">M</span>
          <span className="text-black font-medium">ODEVA</span>
        </h1>
        <h2 className="text-4xl font-serif font-bold text-gray-800 mb-6">Checkout Form</h2>
        <Stepper
          steps={[
            { title: "1", label: "PERSONAL INFO" },
            { title: "2", label: "SHIPPING DELIVERY" },
            { title: "3", label: "CONFIRMATION" },
          ]}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
        />

        <div className="space-y-8 mt-8">
          {savedAddresses.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Delivery Address</h3>
              <div className="space-y-3 mb-4">
                {savedAddresses.map((address) => (
                  <div
                    key={address.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      selectedAddressId === address.id
                        ? 'border-[#844416] bg-[#844416]/5'
                        : 'border-gray-300 hover:border-[#844416]/50'
                    }`}
                    onClick={() => handleAddressSelect(address.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="radio"
                            name="address"
                            checked={selectedAddressId === address.id}
                            onChange={() => handleAddressSelect(address.id)}
                            className="form-radio text-[#844416] focus:ring-[#844416]"
                          />
                          <span className="font-semibold">{address.name}</span>
                          {address.isDefault && (
                            <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 ml-6">
                          {address.street}, {address.city}, {address.state} {address.zip}
                        </p>
                        <p className="text-sm text-gray-600 ml-6">
                          Phone: {address.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    useNewAddress
                      ? 'border-[#844416] bg-[#844416]/5'
                      : 'border-gray-300 hover:border-[#844416]/50'
                  }`}
                  onClick={handleUseNewAddress}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="address"
                      checked={useNewAddress}
                      onChange={handleUseNewAddress}
                      className="form-radio text-[#844416] focus:ring-[#844416]"
                    />
                    <span className="font-semibold">Use a new address</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <Input 
              placeholder="Eg: example@example.com"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              aria-label="Email Address"
              className="focus:ring-2 focus:ring-[#844416] focus:border-[#844416]"
            />
          </div>

          {(useNewAddress || savedAddresses.length === 0) && (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  {savedAddresses.length > 0 ? 'New Address Details' : 'Address Details'}
                </h3>
                <div className="space-y-4">
                  <Input 
                    placeholder="Eg: John Doe" 
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    required
                    aria-label="Full Name"
                    className="focus:ring-2 focus:ring-[#844416] focus:border-[#844416]"
                  />
                  
                  <div className="flex gap-2">
                    <Select defaultValue="+62">
                      <SelectTrigger className="w-24">
                        <SelectValue placeholder="(+62)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="+62">+62</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input 
                      placeholder="111-2222-33333" 
                      className="flex-1 focus:ring-2 focus:ring-[#844416] focus:border-[#844416]"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      required
                      aria-label="Phone Number"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Address Detail</h3>
                <div className="space-y-4">
                  <Input 
                    placeholder="Eg: ABC Street 12A"
                    value={formData.street}
                    onChange={(e) => handleInputChange('street', e.target.value)}
                    required
                    aria-label="Street Address"
                    className="focus:ring-2 focus:ring-[#844416] focus:border-[#844416]"
                  />
                  
                  <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
                    <SelectTrigger><SelectValue placeholder="--Choose Country--" /></SelectTrigger>
                    <SelectContent><SelectItem value="Indonesia">Indonesia</SelectItem></SelectContent>
                  </Select>

                  <div className="flex gap-4">
                    <Select value={formData.province} onValueChange={(value) => handleInputChange('province', value)}>
                      <SelectTrigger><SelectValue placeholder="--Choose Province--" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Jakarta">Jakarta</SelectItem>
                        <SelectItem value="West Java">West Java</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Input
                      placeholder="ZIP Code"
                      value={formData.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      required
                      aria-label="ZIP Code"
                      className="focus:ring-2 focus:ring-[#844416] focus:border-[#844416]"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <Button 
            className="mt-8 bg-[#844416] hover:bg-[#6f3612] text-white w-full"
            onClick={handleContinue}
            disabled={!isFormValid()}
          >
            Continue to Shipping
          </Button>

        </div>
      </div>
      
      {/* Right Order Summary */}
      <div className="w-full lg:w-1/3 bg-white border border-gray-200 p-6 rounded-lg shadow-sm h-fit">
        <h3 className="text-xl font-semibold mb-4">Order Summary</h3>
        <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
          {cartData.items.map((item) => (
            <div key={`${item.productId}-${item.size}`} className="flex items-start gap-4">
              <div className="relative flex-shrink-0">
                <Image
                  src={item.product.image[0] || "/placeholder.svg"}
                  alt={item.product.name}
                  width={64}
                  height={64}
                  className="object-cover rounded"
                />
                <span className="absolute -top-2 -right-2 bg-[#844416] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{item.product.name}</p>
                <p className="text-sm text-gray-600">{item.quantity} × IDR {item.price.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Size: {item.size}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="text-sm space-y-2 border-t pt-4 mt-4">
          <div className="flex justify-between">
            <span>Subtotal ({cartData.summary.totalItems} items)</span>
            <span>IDR {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-red-600">
            <span>Voucher</span>
            <span>-IDR {discount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>IDR {shipping.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-semibold text-lg pt-2 border-t">
            <span>Total</span>
            <span className="text-[#844416]">IDR {total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}