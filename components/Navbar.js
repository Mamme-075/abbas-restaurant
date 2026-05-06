'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Menu, X, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageProvider';
import { useCart } from './CartProvider';
import { supabase } from '@/lib/supabase';
import { UserCircle } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const { lang, toggleLanguage } = useLanguage();
  const { itemCount, setIsCartOpen } = useCart();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const isAr = lang === 'ar';

  return (
    <nav className="fixed w-full z-50 glass top-0 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-primary-500 shadow-sm bg-white">
                <Image src="/logo.jpg" alt="Abbas Restaurant Logo" fill className="object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-wider text-gradient uppercase">
                  {isAr ? 'مطعم عباس' : 'Abbas'}
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className={`hidden md:flex items-center gap-8 ${isAr ? 'flex-row-reverse' : ''}`}>
            <Link href="/" className="text-foreground hover:text-primary-600 transition-colors font-medium">
              {isAr ? 'الرئيسية' : 'Home'}
            </Link>
            <Link href="#menu" className="text-foreground hover:text-primary-600 transition-colors font-medium">
              {isAr ? 'القائمة' : 'Menu'}
            </Link>
            
            <button onClick={toggleLanguage} className="flex items-center gap-2 text-foreground hover:text-primary-600 transition-colors bg-black/5 px-3 py-1.5 rounded-full">
              <Globe className="h-5 w-5" />
              <span className="font-semibold text-sm">{isAr ? 'English' : 'عربي'}</span>
            </button>

            {user ? (
              <Link href="/profile" className="flex items-center gap-2 text-foreground hover:text-primary-600 transition-colors bg-black/5 px-3 py-1.5 rounded-full cursor-pointer">
                <UserCircle className="h-5 w-5" />
                <span className="font-semibold text-sm">
                  {user.user_metadata?.full_name?.split(' ')[0] || (isAr ? 'حسابي' : 'Profile')}
                </span>
              </Link>
            ) : (
              <Link href="/login" className="flex items-center gap-2 text-foreground hover:text-primary-600 transition-colors bg-black/5 px-3 py-1.5 rounded-full cursor-pointer">
                <UserCircle className="h-5 w-5" />
                <span className="font-semibold text-sm">
                  {isAr ? 'تسجيل الدخول' : 'Log In'}
                </span>
              </Link>
            )}

            <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-500 text-white px-5 py-2.5 rounded-full transition-all shadow-md hover:shadow-lg cursor-pointer">
              <ShoppingCart className="h-5 w-5" />
              <span className="font-semibold">{itemCount}</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className={`md:hidden flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
            {user ? (
              <Link href="/profile" className="p-2 text-primary-600 bg-black/5 rounded-full transition-colors font-bold text-sm cursor-pointer">
                <UserCircle className="h-5 w-5" />
              </Link>
            ) : (
              <Link href="/login" className="p-2 text-primary-600 bg-black/5 rounded-full transition-colors font-bold text-sm cursor-pointer">
                <UserCircle className="h-5 w-5" />
              </Link>
            )}
            <button onClick={toggleLanguage} className="p-2 text-primary-600 bg-black/5 rounded-full transition-colors font-bold text-sm">
              {isAr ? 'EN' : 'AR'}
            </button>
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-primary-600 hover:bg-black/5 rounded-full transition-colors">
              <ShoppingCart className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-primary-500 rounded-full text-[10px] flex items-center justify-center font-bold text-white">{itemCount}</span>
              )}
            </button>
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground hover:text-primary-600 p-2"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass border-t border-black/5 absolute w-full">
          <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col">
            <Link 
              href="/" 
              className="block px-3 py-3 text-base font-medium text-foreground hover:text-primary-600 hover:bg-black/5 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {isAr ? 'الرئيسية' : 'Home'}
            </Link>
            <Link 
              href="#menu" 
              className="block px-3 py-3 text-base font-medium text-foreground hover:text-primary-600 hover:bg-black/5 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {isAr ? 'القائمة' : 'Menu'}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
