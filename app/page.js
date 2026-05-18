'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/components/LanguageProvider';
import { Loader2, Info, MapPin, Phone, ChevronDown, ChevronUp, ArrowRight, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';

  const [menuItems, setMenuItems] = useState([]);
  const [popularItems, setPopularItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDesc, setExpandedDesc] = useState({});
  const [showFullMenu, setShowFullMenu] = useState(false);

  useEffect(() => {

    async function fetchMenu() {
      const { data, error } = await supabase.from('menu_items').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        setMenuItems(data);
        // Just take the first 5 items as "popular" for now
        setPopularItems(data.slice(0, 5));
      }
      setLoading(false);
    }
    fetchMenu();
  }, []);

  const toggleDesc = (id) => {
    setExpandedDesc(prev => ({...prev, [id]: !prev[id]}));
  };

  // Reusable Item Card Component to avoid duplication
  const MenuItemCard = ({ item }) => {
    const desc = isAr ? item.description_ar : item.description_en;
    const isExpanded = expandedDesc[item.id];

    return (
      <div className="glass-card rounded-3xl overflow-hidden group hover:shadow-2xl transition-all duration-300 flex flex-col min-w-[300px] w-full snap-start border border-gray-100">
        <div className="relative h-56 w-full overflow-hidden bg-gray-50 flex-shrink-0">
          {item.image_url ? (
            <Image src={item.image_url} alt={isAr ? item.name_ar : item.name_en} fill className="object-cover image-hover-zoom" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20 bg-primary-50">🍲</div>
          )}
          <div className="absolute top-4 right-4 bg-primary-500 text-white font-bold text-sm px-3 py-1 rounded-md shadow-md">
            {item.price} {isAr ? 'ريال' : 'SAR'}
          </div>
        </div>
        
        <div className="p-6 flex flex-col flex-1 bg-white">
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-xl font-bold text-gray-900">
              {isAr ? item.name_ar : item.name_en}
            </h3>
          </div>
          <p className="text-sm text-primary-600 font-bold mb-4">
            {isAr ? item.category_ar : item.category_en}
          </p>
          
          <div className="mb-6 flex-1">
            <p className={`text-gray-500 text-sm leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`}>
              {desc}
            </p>
            {desc && desc.length > 80 && (
              <button 
                onClick={() => toggleDesc(item.id)} 
                className="text-primary-600 text-xs font-bold mt-2 flex items-center hover:text-primary-800 transition-colors"
              >
                {isExpanded ? (
                  <>{isAr ? 'عرض أقل' : 'Show less'} <ChevronUp className="h-3 w-3 ml-1" /></>
                ) : (
                  <>{isAr ? 'اقرأ المزيد' : 'Read more'} <ChevronDown className="h-3 w-3 ml-1" /></>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Section */}
      <section className="relative h-[75vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-black">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
          <Image src="/shaw.jpg" alt="Restaurant Background" fill className="object-cover opacity-60" priority />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-20">
          <div className="mb-8 flex justify-center animate-fade-in-up">
             <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-white">
                <Image src="/logo.jpg" alt="Abbas Restaurant Logo" fill className="object-contain" />
              </div>
          </div>
          <h1 className="text-5xl md:text-8xl font-black mb-6 text-white drop-shadow-xl tracking-tight">
            {isAr ? 'مطاعم عباس' : 'ABBAS'}
          </h1>
          <p className="text-xl md:text-3xl text-gray-200 mb-10 max-w-2xl mx-auto font-medium drop-shadow-md">
            {isAr 
              ? 'تذوق المعنى الحقيقي للأصالة' 
              : 'Taste the true meaning of authenticity'}
          </p>
          <a href="#popular" className="inline-block bg-primary-600 hover:bg-primary-500 text-white px-10 py-4 rounded-full text-lg font-bold transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
            {isAr ? 'اطلب الآن' : 'Order Now'}
          </a>
        </div>
        
        {/* Curved bottom edge for modern look */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-50 to-transparent z-20"></div>
      </section>

      {/* About Us (قصتنا) Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className={`glass-card p-8 md:p-12 rounded-3xl flex flex-col md:flex-row items-center gap-10 shadow-sm border border-gray-100 ${isAr ? 'md:flex-row-reverse text-right' : 'text-left'}`}>
          <div className="flex-1 space-y-6">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              {isAr ? 'قصتنا' : 'Our Story'}
            </h2>
            <div className={`h-1 w-20 bg-primary-500 rounded-full ${isAr ? 'ml-auto' : ''}`}></div>
            <p className="text-lg text-gray-600 leading-relaxed">
              {isAr 
                ? 'بدأت رحلتنا من شغف عميق بالطهي وتقديم أفضل المأكولات العربية. نحن في مطاعم عباس نؤمن بأن الطعام ليس مجرد وجبة، بل هو تجربة تجمع العائلة والأصدقاء. نستخدم أجود المكونات الطازجة والتوابل الأصيلة لنقدم لكم مذاقاً لا ينسى.' 
                : 'Our journey began with a deep passion for cooking and serving the best Arabic cuisine. At Abbas Restaurant, we believe that food is not just a meal, but an experience that brings family and friends together. We use the finest fresh ingredients and authentic spices to give you an unforgettable taste.'}
            </p>
          </div>
          <div className="flex-1 w-full">
            <div className="relative h-64 md:h-80 w-full rounded-2xl overflow-hidden shadow-lg">
              <Image src="/shaw.jpg" alt="Our Kitchen" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Most Popular Section (الاكثر ترويجا) */}
      <section id="popular" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex justify-between items-end mb-10 ${isAr ? 'flex-row-reverse' : ''}`}>
            <div className={isAr ? 'text-right' : 'text-left'}>
              <h2 className="text-4xl font-black text-gray-900 mb-4">
                {isAr ? 'الأكثر ترويجاً' : 'Most Popular'}
              </h2>
              <div className={`h-1 w-24 bg-primary-500 rounded-full ${isAr ? 'ml-auto' : ''}`}></div>
            </div>
            
            <div className="hidden md:flex gap-2">
              <div className="p-3 rounded-full bg-gray-100 text-gray-400"><ArrowLeft className="h-5 w-5" /></div>
              <div className="p-3 rounded-full bg-gray-100 text-gray-400"><ArrowRight className="h-5 w-5" /></div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
            </div>
          ) : (
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 pb-10 hide-scrollbar" style={{ scrollBehavior: 'smooth' }}>
              {popularItems.map(item => (
                <div key={item.id} className="snap-start shrink-0 w-80 md:w-96">
                  <MenuItemCard item={item} />
                </div>
              ))}
            </div>
          )}

          {/* View Full Menu Button */}
          {!loading && (
            <div className="mt-12 text-center">
              <Link 
                href="/menu"
                className="bg-primary-500 hover:bg-primary-600 text-white px-10 py-4 rounded-full text-lg font-bold transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 inline-flex items-center gap-3"
              >
                {isAr ? 'عرض القائمة الكاملة' : 'View Full Menu'}
                <ArrowRight className={`h-5 w-5 ${isAr ? 'rotate-180' : ''}`} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer / Contact */}
      <footer className="bg-white border-t border-gray-100 py-20 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-start">
          <div className={isAr ? 'md:text-right' : 'md:text-left'}>
            <div className="flex items-center gap-4 mb-6 justify-center md:justify-start" style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}>
              <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-white border border-gray-100">
                <Image src="/logo.jpg" alt="Logo" fill className="object-contain p-1" />
              </div>
              <h4 className="text-2xl font-black text-gray-900">{isAr ? 'مطاعم عباس' : 'Abbas'}</h4>
            </div>
            <p className="text-gray-500 leading-relaxed font-medium">
              {isAr ? 'نقدم أفضل الأطباق العربية المحضرة يومياً من أجود المكونات الطازجة لضمان تجربة طعام استثنائية.' : 'Serving the best Arabic dishes prepared daily with the finest fresh ingredients to ensure an exceptional dining experience.'}
            </p>
          </div>
          
          <div className={`flex flex-col items-center ${isAr ? 'md:items-end' : 'md:items-start'}`}>
            <h4 className="text-lg font-bold mb-6 text-gray-900">{isAr ? 'تواصل معنا' : 'Contact Us'}</h4>
            <div className="space-y-4 text-gray-500 font-medium">
              <p className="flex items-center gap-3" style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}>
                <Phone className="h-5 w-5 text-primary-500" /> +966 50 000 0000
              </p>
              <p className="flex items-center gap-3" style={{ flexDirection: isAr ? 'row-reverse' : 'row' }}>
                <MapPin className="h-5 w-5 text-primary-500" /> {isAr ? 'المملكة العربية السعودية' : 'Saudi Arabia'}
              </p>
            </div>
          </div>
          
          <div className={`flex flex-col items-center ${isAr ? 'md:items-end' : 'md:items-start'}`}>
            <h4 className="text-lg font-bold mb-6 text-gray-900">{isAr ? 'ساعات العمل' : 'Opening Hours'}</h4>
            <div className="space-y-4 text-gray-500 font-medium">
              <p className="flex justify-between w-48">
                <span>{isAr ? 'يومياً' : 'Daily'}</span>
                <span className="text-gray-900 font-bold">8:00 - 00:00</span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-gray-100 text-center text-gray-400 text-sm font-medium">
          <p>© {new Date().getFullYear()} {isAr ? 'مطاعم عباس. جميع الحقوق محفوظة.' : 'Abbas Restaurant. All rights reserved.'}</p>
        </div>
      </footer>
    </div>
  );
}
