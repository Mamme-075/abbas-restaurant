'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';
import { useCart } from '@/components/CartProvider';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function SuccessPage() {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';
  const { cart, clearCart, cartTotal } = useCart();
  const [savingOrder, setSavingOrder] = useState(true);

  useEffect(() => {
    async function saveOrder() {
      if (cart.length === 0) {
        setSavingOrder(false);
        return; // Already saved or empty
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Insert order into database
        const { error } = await supabase.from('orders').insert([{
          user_id: session.user.id,
          total_amount: cartTotal,
          status: 'Paid',
          items: cart
        }]);
        
        if (error) console.error("Failed to save order", error);
      }
      
      clearCart();
      setSavingOrder(false);
    }

    saveOrder();
  }, [cart, cartTotal, clearCart]);

  if (savingOrder) {
    return <div className="min-h-[70vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary-500 h-10 w-10" /></div>;
  }

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
        <div className="flex flex-col gap-3">
          <Link 
            href="/profile" 
            className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 px-8 rounded-xl transition-colors inline-block"
          >
            {isAr ? 'عرض سجل الطلبات' : 'View Order History'}
          </Link>
          <Link 
            href="/" 
            className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 font-bold py-3 px-8 rounded-xl transition-colors inline-block"
          >
            {isAr ? 'العودة للقائمة' : 'Back to Menu'}
          </Link>
        </div>
      </div>
    </div>
  );
}
