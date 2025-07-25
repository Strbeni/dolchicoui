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
import { useState, useEffect } from "react";
import { Stepper } from "@/components/ui/stepper";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Types matching your API response
type Product = { 
  name: string; 
  image: string; 
}

type CartItem = {
  id: number;
  productId: number;
  size: string;
  quantity: number;
  price: number;
  product: Product;
}

type CartSummary = {
  totalItems: number;
  subtotal: number;
}

// API Helper functions
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

const authHeaders = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export default function Checkout() {
  const [currentStep, setCurrentStep] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartSummary, setCartSummary] = useState<CartSummary>({ totalItems: 0, subtotal: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    country: '',
    province: '',
    zipCode: ''
  });

  const router = useRouter();

  // Fetch cart data
  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/cart`, {
        method: 'GET',
        headers: authHeaders(),
      });

      if (!res.ok) {
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch cart');
      }

      const data = await res.json();
      setCartItems(data.items || []);
      setCartSummary(data.summary || { totalItems: 0, subtotal: 0 });
      
      // If cart is empty, redirect back to cart page
      if (!data.items || data.items.length === 0) {
        router.push('/cartpage');
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      setError('Failed to load cart data');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Validate form
  const validateForm = () => {
    const required = ['name', 'phone', 'email', 'address', 'country', 'province', 'zipCode'];
    return required.every(field => formData[field as keyof typeof formData].trim() !== '');
  };

  // Handle continue to shipping
  const handleContinue = () => {
    if (!validateForm()) {
      alert('Please fill in all required fields');
      return;
    }
    
    // Store form data in localStorage for next step
    localStorage.setItem('checkoutFormData', JSON.stringify(formData));
    router.push('/checkout/shipping');
  };

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    fetchCart();
  }, []);

  // Calculate totals
  const subtotal = cartSummary.subtotal;
  const discount = 50000; // Fixed discount
  const shipping = 0; // Free shipping
  const total = subtotal - discount + shipping;

  if (loading) {
    return (
      <div className="min-h-screen bg-white px-6 lg:px-20 py-12 flex justify-center items-center">
        <p className="text-lg">Loading checkout...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white px-6 lg:px-20 py-12 flex justify-center items-center">
        <div className="text-center">
          <p className="text-lg text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/cartpage')}>Back to Cart</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-6 lg:px-20 py-12 flex flex-col lg:flex-row gap-10">
      {/* Left Form */}
      <div className="w-full lg:w-2/3">
        {/* Logo */}
        <h1 className="text-3xl font-serif mb-2">
          <span className="text-[#844416] font-bold">M</span>
          <span className="text-black font-medium">ODEVA</span>
        </h1>

        {/* Title */}
        <h2 className="text-4xl font-serif font-bold text-gray-800 mb-6">Checkout Form</h2>

        {/* Stepper */}
        <Stepper
          steps={[
            { title: "1", label: "PERSONAL INFO" },
            { title: "2", label: "SHIPPING DELIVERY" },
            { title: "3", label: "CONFIRMATION" },
          ]}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
        />

        {/* Contact Info */}
        <h3 className="text-lg font-semibold mt-6 mb-2">Contact Person</h3>

        <div className="space-y-4">
          <Input 
            placeholder="Eg: John Doe" 
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
          />
          <div className="flex gap-2">
            <Select>
              <SelectTrigger className="w-24">
                <SelectValue placeholder="(+62)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="+62">+62</SelectItem>
              </SelectContent>
            </Select>
            <Input 
              placeholder="111-2222-33333" 
              className="w-full"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </div>
          <Input 
            placeholder="Eg: example@example.com"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
        </div>

        {/* Address Info */}
        <h3 className="text-lg font-semibold mt-8 mb-2">Address Detail</h3>

        <div className="space-y-4">
          <Input 
            placeholder="Eg: ABC Street 12A, West Java, Indonesia"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
          />
          <Select onValueChange={(value) => handleInputChange('country', value)}>
            <SelectTrigger>
              <SelectValue placeholder="--Choose Country--" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="indonesia">Indonesia</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-4">
            <Select onValueChange={(value) => handleInputChange('province', value)}>
              <SelectTrigger>
                <SelectValue placeholder="--Choose Province--" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="jakarta">Jakarta</SelectItem>
                <SelectItem value="west-java">West Java</SelectItem>
                <SelectItem value="east-java">East Java</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={(value) => handleInputChange('zipCode', value)}>
              <SelectTrigger>
                <SelectValue placeholder="--Choose ZIP Code--" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12345">12345</SelectItem>
                <SelectItem value="54321">54321</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button 
          onClick={handleContinue}
          className="mt-8 bg-[#844416] hover:bg-[#6f3612] text-white text-sm px-6 py-3 uppercase"
        >
          Continue to Shipping
        </Button>
      </div>

      {/* Right Order Summary */}
      <div className="w-full lg:w-1/3 bg-white border border-gray-200 p-6 rounded shadow-sm">
        <h3 className="text-xl font-semibold mb-4">Order Summary</h3>

        <div className="bg-[#f3f3f3] text-sm p-2 mb-4 text-[#844416] flex justify-between">
          <span>Hooray! You use promo code!</span>
          <span className="text-black cursor-pointer">X</span>
        </div>

        {/* Cart Items */}
        <div className="max-h-64 overflow-y-auto">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-start gap-4 mb-4">
              <Image
                src={item.product.image || "/placeholder.png"}
                alt={item.product.name}
                width={64}
                height={64}
                className="object-cover rounded"
              />
              <div className="flex-1">
                <p className="font-semibold text-sm">{item.product.name}</p>
                <p className="text-sm">{item.quantity} X IDR {item.price.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Size: {item.size}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Totals */}
        <div className="text-sm space-y-2 border-t pt-4 mt-4">
          <div className="flex justify-between">
            <span>Subtotal ({cartSummary.totalItems} items)</span>
            <span>IDR {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-red-600">
            <span>Discount (50KDISCOUNT)</span>
            <span>-IDR {discount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Shipping</span>
            <span>IDR {shipping.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-semibold pt-2 border-t">
            <span>Total</span>
            <span>IDR {total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
