'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/components/LanguageProvider';
import { Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import Image from 'next/image';

const CATEGORIES = [
  { id: 'all', en: 'All', ar: 'الكل', icon: '🍽️' },
  { id: 'Foul', en: 'Foul', ar: 'فول', icon: '🍲' },
  { id: 'Gallaba', en: 'Gallaba', ar: 'قلابة', icon: '🥘' },
  { id: 'Shawarma', en: 'Shawarma', ar: 'شاورما', icon: '🌯' },
  { id: 'Grills', en: 'Grills', ar: 'مشاوي', icon: '🥩' },
  { id: 'Masoub', en: 'Masoub', ar: 'معصوب', icon: '🍌' },
  { id: 'Muttabak', en: 'Muttabak', ar: 'مطبق', icon: '🫓' },
  { id: 'Drinks', en: 'Drinks', ar: 'مشروبات', icon: '🥤' },
  { id: 'Extras', en: 'Extras', ar: 'إضافات', icon: '🍟' },
];

export default function MenuPage() {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';

  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedDesc, setExpandedDesc] = useState({});
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    async function fetchMenu() {
      const { data, error } = await supabase.from('menu_items').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        setMenuItems(data);
      }
      setLoading(false);
    }
    fetchMenu();
  }, []);

  const toggleDesc = (id) => {
    setExpandedDesc(prev => ({...prev, [id]: !prev[id]}));
  };

  const filteredItems = selectedCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.category_en === selectedCategory);

  const MenuItemCard = ({ item }) => {
    const desc = isAr ? item.description_ar : item.description_en;
    const isExpanded = expandedDesc[item.id];

    return (
      <div className="glass-card rounded-3xl overflow-hidden group hover:shadow-2xl transition-all duration-300 flex flex-col w-full border border-gray-100">
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
    <div className="min-h-screen bg-gray-50/50 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-gray-900 mb-6 drop-shadow-sm">
            {isAr ? 'قائمة الطعام' : 'Our Menu'}
          </h1>
          <div className="h-1.5 w-24 bg-primary-500 mx-auto rounded-full"></div>
          <p className="mt-6 text-gray-500 max-w-2xl mx-auto text-lg">
            {isAr ? 'استكشف تشكيلتنا الواسعة من أشهى المأكولات العربية المحضرة بحب وعناية' : 'Explore our wide selection of delicious Arabic dishes prepared with love and care'}
          </p>
        </div>

        {/* Category Tabs */}
        {!loading && menuItems.length > 0 && (
          <div className="mb-12 overflow-x-auto hide-scrollbar">
            <div className={`flex gap-3 pb-4 min-w-max px-2 ${isAr ? 'flex-row-reverse' : ''}`}>
              {CATEGORIES.map(category => {
                const isSelected = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all duration-300 ${
                      isSelected 
                        ? 'bg-primary-600 text-white shadow-lg scale-105' 
                        : 'bg-white text-gray-600 hover:bg-primary-50 hover:text-primary-600 shadow-sm'
                    } ${isAr ? 'flex-row-reverse' : ''}`}
                  >
                    <span className="text-xl">{category.icon}</span>
                    <span>{isAr ? category.ar : category.en}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary-500" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <p className="text-xl">
              {menuItems.length === 0 
                ? (isAr ? 'القائمة فارغة حالياً. سيتم إضافة الأصناف قريباً!' : 'Menu is currently empty. Items coming soon!')
                : (isAr ? 'لا توجد أصناف في هذا التصنيف.' : 'No items found in this category.')
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredItems.map(item => (
              <MenuItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
