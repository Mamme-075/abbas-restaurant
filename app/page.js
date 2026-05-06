'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/components/LanguageProvider';
import { useCart } from '@/components/CartProvider';
import { Loader2, ShoppingCart, Info, MapPin, Phone, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';
  const { addToCart } = useCart();

  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDesc, setExpandedDesc] = useState({});
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      fetchMenu();
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    async function fetchMenu() {
      const { data, error } = await supabase.from('menu_items').select('*').order('created_at', { ascending: false });
      if (!error && data) setMenuItems(data);
      setLoading(false);
    }
    fetchMenu();
  }, []);

  const toggleDesc = (id) => {
    setExpandedDesc(prev => ({...prev, [id]: !prev[id]}));
  };

  const handleAddToCart = (item) => {
    if (!session) {
      window.location.href = '/login';
    } else {
      addToCart(item);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-black">
          <div className="absolute inset-0 bg-primary-900/30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary-900/40 via-background to-background z-10" />
          <Image src="/shaw.jpg" alt="Restaurant Background" fill className="object-cover opacity-20" priority />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-10">
          <div className="mb-6 flex justify-center">
             <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-primary-500 shadow-xl bg-white">
                <Image src="/logo.jpg" alt="Abbas Restaurant Logo" fill className="object-contain" />
              </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient drop-shadow-sm">
            {isAr ? 'مرحباً بكم في مطعم عباس' : 'Welcome to Abbas'}
          </h1>
          <p className="text-xl md:text-2xl text-foreground/80 mb-8 max-w-2xl mx-auto font-medium">
            {isAr 
              ? 'نقدم لكم أشهى المأكولات العربية الأصيلة بلمسة عصرية' 
              : 'Authentic Arabic cuisine served with a modern touch'}
          </p>
          <a href="#menu" className="inline-block bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-full text-lg font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
            {isAr ? 'استعرض القائمة' : 'Explore Menu'}
          </a>
        </div>
      </section>

      {/* Main Menu Section */}
      <section id="menu" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            {isAr ? 'قائمة الطعام' : 'Our Menu'}
          </h2>
          <div className="h-1 w-24 bg-primary-500 mx-auto rounded-full"></div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
          </div>
        ) : menuItems.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-white/50 rounded-3xl border border-border">
            <Info className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-xl">{isAr ? 'القائمة فارغة حالياً. سيتم إضافة الأصناف قريباً!' : 'Menu is currently empty. Items coming soon!'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {menuItems.map(item => {
              const desc = isAr ? item.description_ar : item.description_en;
              const isExpanded = expandedDesc[item.id];
              return (
                <div key={item.id} className="glass-card rounded-2xl overflow-hidden group hover:shadow-2xl transition-all duration-300 flex flex-col">
                  <div className="relative h-56 w-full overflow-hidden bg-gray-100 flex-shrink-0">
                    {item.image_url ? (
                      <Image src={item.image_url} alt={isAr ? item.name_ar : item.name_en} fill className="object-cover image-hover-zoom" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20">🍲</div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-primary-900 font-bold px-4 py-2 rounded-full shadow-md">
                      {item.price} {isAr ? 'ريال' : 'SAR'}
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-2xl font-bold text-foreground">
                        {isAr ? item.name_ar : item.name_en}
                      </h3>
                    </div>
                    <p className="text-sm text-primary-600 font-bold mb-3">
                      {isAr ? item.category_ar : item.category_en}
                    </p>
                    
                    <div className="mb-6 flex-1">
                      <p className={`text-gray-600 ${isExpanded ? '' : 'line-clamp-2'}`}>
                        {desc}
                      </p>
                      {desc && desc.length > 80 && (
                        <button 
                          onClick={() => toggleDesc(item.id)} 
                          className="text-primary-600 text-sm font-semibold mt-1 flex items-center hover:underline"
                        >
                          {isExpanded ? (
                            <>{isAr ? 'عرض أقل' : 'Show less'} <ChevronUp className="h-4 w-4 ml-1" /></>
                          ) : (
                            <>{isAr ? 'اقرأ المزيد' : 'Read more'} <ChevronDown className="h-4 w-4 ml-1" /></>
                          )}
                        </button>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => handleAddToCart(item)}
                      className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 mt-auto"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      {isAr ? 'أضف للسلة' : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Footer / Contact */}
      <footer className="bg-foreground text-background py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-start">
          <div>
            <h4 className="text-xl font-bold mb-4 text-primary-400">{isAr ? 'مطعم عباس' : 'Abbas Restaurant'}</h4>
            <p className="text-gray-400 max-w-sm mx-auto md:mx-0">
              {isAr ? 'نقدم أفضل الأطباق العربية المحضرة يومياً من أجود المكونات الطازجة.' : 'Serving the best Arabic dishes prepared daily with the finest fresh ingredients.'}
            </p>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-xl font-bold mb-4 text-primary-400">{isAr ? 'تواصل معنا' : 'Contact Us'}</h4>
            <div className="space-y-3 text-gray-400">
              <p className="flex items-center gap-2"><Phone className="h-5 w-5" /> +966 50 000 0000</p>
              <p className="flex items-center gap-2"><MapPin className="h-5 w-5" /> {isAr ? 'المملكة العربية السعودية' : 'Saudi Arabia'}</p>
            </div>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-xl font-bold mb-4 text-primary-400">{isAr ? 'ساعات العمل' : 'Opening Hours'}</h4>
            <div className="space-y-3 text-gray-400">
              <p>{isAr ? 'يومياً: 8:00 صباحاً - 12:00 منتصف الليل' : 'Daily: 8:00 AM - 12:00 AM'}</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}