'use client';

import { useCart } from './CartProvider';
import { useLanguage } from './LanguageProvider';
import { X, Minus, Plus, ShoppingBag, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

export default function CartSidebar() {
  const { cart, removeFromCart, updateQuantity, cartTotal, isCartOpen, setIsCartOpen } = useCart();
  const { lang } = useLanguage();
  const isAr = lang === 'ar';
  const [checkingOut, setCheckingOut] = useState(false);

  if (!isCartOpen) return null;

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Checkout failed: " + data.error);
        setCheckingOut(false);
      }
    } catch (err) {
      alert("Error starting checkout");
      setCheckingOut(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity" onClick={() => setIsCartOpen(false)} />
      <div className={`fixed top-0 ${isAr ? 'left-0' : 'right-0'} h-full w-full sm:w-96 bg-background z-50 shadow-2xl flex flex-col transform transition-transform duration-300`}>
        
        {/* Header */}
        <div className={`p-4 border-b border-border flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <ShoppingBag className="text-primary-500" />
            {isAr ? 'سلة المشتريات' : 'Your Cart'}
          </h2>
          <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
              <ShoppingBag className="h-16 w-16 opacity-20" />
              <p>{isAr ? 'سلتك فارغة' : 'Your cart is empty'}</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className={`flex gap-4 bg-white p-3 rounded-xl border border-border shadow-sm ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                <div className="relative h-20 w-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.name_en} fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-2xl">🍲</div>
                  )}
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm line-clamp-1">{isAr ? item.name_ar : item.name_en}</h3>
                    <p className="text-primary-600 font-semibold text-sm">{item.price} {isAr ? 'ريال' : 'SAR'}</p>
                  </div>
                  
                  <div className={`flex items-center justify-between ${isAr ? 'flex-row-reverse' : ''}`}>
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1 border border-border">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-white rounded shadow-sm text-gray-500">
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-white rounded shadow-sm text-gray-500">
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-xs text-red-500 font-medium hover:underline">
                      {isAr ? 'إزالة' : 'Remove'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-border bg-gray-50">
            <div className={`flex justify-between items-center mb-4 ${isAr ? 'flex-row-reverse' : ''}`}>
              <span className="text-gray-500 font-medium">{isAr ? 'المجموع الإجمالي:' : 'Subtotal:'}</span>
              <span className="text-2xl font-bold text-foreground">{cartTotal.toFixed(2)} {isAr ? 'ريال' : 'SAR'}</span>
            </div>
            <button 
              onClick={handleCheckout}
              disabled={checkingOut}
              className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {checkingOut ? <Loader2 className="animate-spin h-5 w-5" /> : (isAr ? 'إتمام الطلب' : 'Proceed to Checkout')}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
