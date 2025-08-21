// pages/payment/success.tsx
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const PaymentSuccess = () => {
  const router = useRouter();
  const { orderId, txnId } = router.query;

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-green-800 mb-2">Payment Successful!</h1>
        <p className="text-gray-600 mb-4">Your payment has been processed successfully.</p>

        {orderId && (
          <div className="bg-gray-50 p-3 rounded mb-4">
            <p className="text-sm text-gray-600">
              Order&nbsp;ID:&nbsp;<span className="font-mono">{orderId}</span>
            </p>
            {txnId && (
              <p className="text-sm text-gray-600">
                Transaction&nbsp;ID:&nbsp;<span className="font-mono">{txnId}</span>
              </p>
            )}
          </div>
        )}

        <Link href="/home" legacyBehavior>
          <Button className="w-full">Continue Shopping</Button>
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;
