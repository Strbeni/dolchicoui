// pages/payment/failed.tsx
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const PaymentFailed = () => {
  const router = useRouter();
  const { orderId, error } = router.query;

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-red-800 mb-2">Payment Failed</h1>
        <p className="text-gray-600 mb-4">Unfortunately, your payment could not be processed.</p>
        
        {orderId && (
          <div className="bg-gray-50 p-3 rounded mb-4">
            <p className="text-sm text-gray-600">Order ID: <span className="font-mono">{orderId}</span></p>
          </div>
        )}
        
        <div className="space-y-2">
          <Button 
            onClick={() => router.back()} 
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Try Again
          </Button>
          <Link href="/home">
            <Button variant="outline" className="w-full">Go to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
