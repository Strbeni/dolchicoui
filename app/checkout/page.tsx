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

export default function Checkout() {
  const [currentStep, setCurrentStep] = useState(0);
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    // Contact Info
    name: '',
    phone: '',
    email: '',
    // Address Info
    street: '',
    country: 'Indonesia',
    province: '',
    zipCode: ''
  });

  const router = useRouter();

  // Fetch cart data on component mount
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('http://localhost:4000/api/cart', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch cart');
        }

        const result = await response.json();
        if (result.success) {
          setCartData(result.data);
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [router]);

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Validate and continue to next step
  const handleContinue = () => {
    // Store form data for next steps
    localStorage.setItem('checkoutFormData', JSON.stringify(formData));
    router.push('/checkout/shipping');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading cart...</p>
        </div>
      </div>
    );
  }

  if (!cartData || cartData.items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">Your cart is empty</p>
          <Button onClick={() => router.push('/productlist')}>
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  const discount = 50000;
  const subtotal = cartData.summary.subtotal;
  const total = Math.max(0, subtotal - discount);

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

        {/* Contact Info */}
        <h3 className="text-lg font-semibold mt-6 mb-2">Contact Person</h3>
        <div className="space-y-4">
          <Input 
            placeholder="Eg: John Doe" 
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
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
            value={formData.street}
            onChange={(e) => handleInputChange('street', e.target.value)}
          />
          <Select value={formData.country} onValueChange={(value) => handleInputChange('country', value)}>
            <SelectTrigger>
              <SelectValue placeholder="--Choose Country--" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Indonesia">Indonesia</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-4">
            <Select value={formData.province} onValueChange={(value) => handleInputChange('province', value)}>
              <SelectTrigger>
                <SelectValue placeholder="--Choose Province--" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Jakarta">Jakarta</SelectItem>
                <SelectItem value="West Java">West Java</SelectItem>
              </SelectContent>
            </Select>
            <Select value={formData.zipCode} onValueChange={(value) => handleInputChange('zipCode', value)}>
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
          className="mt-8 bg-[#844416] hover:bg-[#6f3612] text-white text-sm px-6 py-3 uppercase"
          onClick={handleContinue}
          disabled={!formData.name || !formData.phone || !formData.email || !formData.street}
        >
          Continue to Shipping
        </Button>
      </div>

      {/* Right Order Summary */}
      <div className="w-full lg:w-1/3 bg-white border border-gray-200 p-6 rounded shadow-sm"></div>
        <h3 className="text-xl font-semibold mb-4">Order Summary</h3>

        <div className="bg-[#f3f3f3] text-sm p-2 mb-4 text-[#844416] flex justify-between">
          <span>Hooray! You use promo code!</span>
          <span className="text-black cursor-pointer">X</span>
        </div>

        {cartData.items.map((item) => (
          <div key={item.id} className="flex items-start gap-4 mb-4">
            <Image
              src={item.product.image[0] || "/checkout.svg"}
              alt={item.product.name}
              width={64}
              height={64}
              className="object-cover rounded"
            />
            <div>
              <p className="font-semibold text-sm">{item.product.name}</p>
              <p className="text-sm">{item.quantity} X IDR {item.price.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Size: {item.size}</p>
            </div>
          ))}
        </div>

        {/* Order Summary Totals */}
        <div className="text-sm space-y-2 border-t pt-4 mt-4">
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
          <div className="flex justify-between font-semibold pt-2 border-t">
            <span>Total</span>
            <span>IDR {total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
