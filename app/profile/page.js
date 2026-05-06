'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/components/LanguageProvider';
import { Loader2, Package, LogOut, User as UserIcon } from 'lucide-react';

export default function ProfilePage() {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/login';
        return;
      }
      setUser(session.user);

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setOrders(data);
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = '/login';
  }

  if (loading) {
    return <div className="min-h-[70vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary-500 h-10 w-10" /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      
      {/* Profile Header */}
      <div className={`glass-card p-6 rounded-2xl mb-8 flex justify-between items-center ${isAr ? 'flex-row-reverse' : ''}`}>
        <div className={`flex items-center gap-4 ${isAr ? 'flex-row-reverse' : ''}`}>
          <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
            <UserIcon className="h-8 w-8" />
          </div>
          <div className={isAr ? 'text-right' : 'text-left'}>
            <h1 className="text-2xl font-bold text-foreground">
              {user?.user_metadata?.full_name || (isAr ? 'عميل عباس' : 'Abbas Customer')}
            </h1>
            <p className="text-gray-500">{user?.email}</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors font-semibold"
        >
          <LogOut className="h-5 w-5" />
          {isAr ? 'تسجيل خروج' : 'Log Out'}
        </button>
      </div>

      {/* Order History */}
      <div className={isAr ? 'text-right' : 'text-left'}>
        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2 justify-start" style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}>
          <Package className="text-primary-500" />
          {isAr ? 'سجل الطلبات' : 'Order History'}
        </h2>

        {orders.length === 0 ? (
          <div className="glass-card p-10 rounded-2xl text-center text-gray-500">
            <Package className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p>{isAr ? 'لم تقم بأي طلبات حتى الآن.' : 'You have not made any orders yet.'}</p>
            <a href="/" className="inline-block mt-4 text-primary-600 font-bold hover:underline">
              {isAr ? 'تصفح القائمة' : 'Browse Menu'}
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className={`glass-card p-6 rounded-2xl border border-border ${isAr ? 'text-right' : 'text-left'}`}>
                <div className={`flex justify-between items-center mb-4 pb-4 border-b border-gray-100 ${isAr ? 'flex-row-reverse' : ''}`}>
                  <div>
                    <p className="text-sm text-gray-500">
                      {isAr ? 'رقم الطلب:' : 'Order ID:'} <span className="font-mono text-xs">{order.id.split('-')[0]}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(order.created_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
                        year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-bold ${order.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {order.status === 'Paid' ? (isAr ? 'تم الدفع' : 'Paid') : order.status}
                  </div>
                </div>

                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className={`flex justify-between items-center ${isAr ? 'flex-row-reverse' : ''}`}>
                      <div className={`flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold">{item.quantity}x</span>
                        <span className="font-medium">{isAr ? item.name_ar : item.name_en}</span>
                      </div>
                      <span className="text-gray-600">{(item.price * item.quantity).toFixed(2)} {isAr ? 'ريال' : 'SAR'}</span>
                    </div>
                  ))}
                </div>

                <div className={`mt-4 pt-4 border-t border-gray-100 flex justify-between items-center font-bold ${isAr ? 'flex-row-reverse' : ''}`}>
                  <span>{isAr ? 'الإجمالي:' : 'Total:'}</span>
                  <span className="text-lg text-primary-600">{Number(order.total_amount).toFixed(2)} {isAr ? 'ريال' : 'SAR'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
