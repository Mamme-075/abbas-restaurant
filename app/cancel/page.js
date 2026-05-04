'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';
import { XCircle } from 'lucide-react';

export default function CancelPage() {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="glass-card p-10 rounded-3xl max-w-md w-full text-center">
        <XCircle className="h-20 w-20 text-red-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-foreground mb-4">
          {isAr ? 'تم إلغاء الدفع' : 'Payment Cancelled'}
        </h1>
        <p className="text-gray-500 mb-8">
          {isAr 
            ? 'لقد قمت بإلغاء عملية الدفع. لم يتم خصم أي مبلغ.' 
            : 'You have cancelled the payment process. No charges were made.'}
        </p>
        <Link 
          href="/" 
          className="inline-block bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-xl transition-colors"
        >
          {isAr ? 'العودة للقائمة' : 'Back to Menu'}
        </Link>
      </div>
    </div>
  );
}
