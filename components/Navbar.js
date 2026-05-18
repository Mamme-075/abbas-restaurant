'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Globe } from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from './LanguageProvider';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { lang, toggleLanguage } = useLanguage();

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
                  {isAr ? 'مطاعم عباس' : 'Abbas'}
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
          </div>

          {/* Mobile menu button */}
          <div className={`md:hidden flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
            <button onClick={toggleLanguage} className="p-2 text-primary-600 bg-black/5 rounded-full transition-colors font-bold text-sm">
              {isAr ? 'EN' : 'AR'}
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
