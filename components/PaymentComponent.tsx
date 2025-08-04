// components/PaymentComponent.tsx
import React, { useState } from 'react';
import { usePayment } from '../app/hooks/usePayment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PaymentComponentProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const PaymentComponent: React.FC<PaymentComponentProps> = ({ onSuccess, onError }) => {
  const [amount, setAmount] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  
  const { initiatePayment, processPayment, loading, error } = usePayment();

  const handlePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const config = await initiatePayment({
      amount: parseFloat(amount),
      customerEmail,
      customerPhone
    });

    if (config) {
      processPayment(config);
    } else if (error) {
      onError?.(error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Make Payment</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="amount">Amount (INR)</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            min="1"
            step="0.01"
          />
        </div>

        <div>
          <Label htmlFor="email">Email (Optional)</Label>
          <Input
            id="email"
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            placeholder="Enter your email"
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone Number (Optional)</Label>
          <Input
            id="phone"
            type="tel"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            placeholder="Enter your phone number"
          />
        </div>

        <Button
          onClick={handlePayment}
          disabled={loading || !amount}
          className="w-full bg-[#002970] hover:bg-[#001950] text-white"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              Processing...
            </span>
          ) : (
            'Pay with Paytm'
          )}
        </Button>
      </div>
    </div>
  );
};

export default PaymentComponent;
