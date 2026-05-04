'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';
import { useCart } from '@/components/CartProvider';
import { CheckCircle2 } from 'lucide-react';
import { useEffect } from 'react';

export default function SuccessPage() {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';
  const { clearCart } = useCart();

  useEffect(() => {
    // Clear the cart when payment is successful
    clearCart();
  }, []);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="glass-card p-10 rounded-3xl max-w-md w-full text-center">
        <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-foreground mb-4">
          {isAr ? 'تم الدفع بنجاح!' : 'Payment Successful!'}
        </h1>
        <p className="text-gray-500 mb-8">
          {isAr 
            ? 'شكراً لطلبك. سيتم تجهيز طعامك قريباً.' 
            : 'Thank you for your order. Your food will be prepared shortly.'}
        </p>
        <Link 
          href="/" 
          className="inline-block bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 px-8 rounded-xl transition-colors"
        >
          {isAr ? 'العودة للقائمة' : 'Back to Menu'}
        </Link>
      </div>
    </div>
  );
}
