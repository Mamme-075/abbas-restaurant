'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, ShieldCheck, X } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';
import Image from 'next/image';

export default function LoginPage() {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';

  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [agreed, setAgreed] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  async function handleAuth(e) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (isRegistering && !agreed) {
      setErrorMsg(isAr ? 'يجب الموافقة على سياسة الخصوصية للمتابعة' : 'You must agree to the Privacy Policy to continue');
      setLoading(false);
      return;
    }

    if (isRegistering) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name, phone: phone }
        }
      });
      if (error) {
        setErrorMsg(error.message);
      } else {
        setSuccessMsg(isAr ? 'تم التسجيل بنجاح! جاري تحويلك...' : 'Registration successful! Redirecting...');
        setTimeout(() => window.location.href = '/', 1500);
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setErrorMsg(error.message);
      } else {
        window.location.href = '/';
      }
    }
    setLoading(false);
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-primary-900/5 z-0" />
      
      <div className={`glass-card p-8 rounded-3xl w-full max-w-lg z-10 relative ${isAr ? 'text-right' : 'text-left'}`}>
        <div className="flex justify-center mb-6">
          <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-primary-500 bg-white">
            <Image src="/logo.jpg" alt="Logo" fill className="object-contain" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-2 text-center">
          {isRegistering ? (isAr ? 'إنشاء حساب جديد' : 'Create an Account') : (isAr ? 'تسجيل الدخول' : 'Log In')}
        </h1>
        <p className="text-gray-500 text-center mb-8">
          {isAr ? 'أدخل تفاصيلك للمتابعة' : 'Enter your details to continue'}
        </p>

        {errorMsg && <div className="bg-red-50 text-red-500 p-3 rounded-xl text-sm mb-6">{errorMsg}</div>}
        {successMsg && <div className="bg-green-50 text-green-600 p-3 rounded-xl text-sm mb-6 font-bold">{successMsg}</div>}

        <form onSubmit={handleAuth} className="space-y-4">
          {isRegistering && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? 'الاسم الكامل' : 'Full Name'}</label>
                <input required type="text" value={name} onChange={e => setName(e.target.value)} className={`w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-black focus:border-primary-500 ${isAr ? 'text-right' : ''}`} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? 'رقم الجوال (السعودية)' : 'Phone Number (Saudi)'}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 font-bold border-r border-gray-200 pr-3" dir="ltr">
                    +966
                  </div>
                  <input 
                    required 
                    type="tel" 
                    placeholder="5XXXXXXXX"
                    pattern="^(05|5)([- ]?[0-9]){8}$"
                    title={isAr ? "يجب أن يكون رقم جوال سعودي صحيح (مثال: 501234567)" : "Must be a valid Saudi phone number (e.g. 501234567)"}
                    value={phone} 
                    onChange={e => setPhone(e.target.value)} 
                    className={`w-full bg-white border border-gray-200 rounded-xl pl-20 pr-4 py-3 text-black focus:border-primary-500`} 
                    dir="ltr"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? 'البريد الإلكتروني' : 'Email Address'}</label>
            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className={`w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-black focus:border-primary-500 ${isAr ? 'text-right' : ''}`} />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{isAr ? 'كلمة المرور' : 'Password'}</label>
            <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className={`w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-black focus:border-primary-500 ${isAr ? 'text-right' : ''}`} />
          </div>

          {isRegistering && (
            <div className="bg-primary-50 border border-primary-100 p-4 rounded-xl mt-6">
              <label className={`flex items-start gap-3 cursor-pointer ${isAr ? 'flex-row-reverse' : ''}`}>
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-1 w-5 h-5 text-primary-600 rounded border-gray-300" />
                <div className="text-sm">
                  <span className="font-bold text-gray-900 block mb-1">
                    <ShieldCheck className="inline h-4 w-4 text-primary-600 mr-1" />
                    {isAr ? 'موافقة سياسة الخصوصية (SDAIA)' : 'Privacy Policy Consent (SDAIA)'}
                  </span>
                  <span className="text-gray-600">
                    {isAr 
                      ? 'أوافق على معالجة بياناتي الشخصية بشكل آمن وتشفيرها بالكامل وفقاً لنظام حماية البيانات الشخصية السعودي (PDPL).' 
                      : 'I consent to the secure processing and encryption of my personal data in accordance with the Saudi PDPL.'}
                  </span>
                  <button type="button" onClick={() => setShowPrivacyModal(true)} className="text-primary-600 font-bold hover:underline mx-1">
                    {isAr ? '(اقرأ المزيد)' : '(Read More)'}
                  </button>
                </div>
              </label>
            </div>
          )}

          <button disabled={loading} type="submit" className="w-full bg-primary-500 hover:bg-primary-600 text-white font-bold py-3.5 rounded-xl transition-colors mt-6 flex justify-center items-center">
            {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (isRegistering ? (isAr ? 'إنشاء حساب' : 'Sign Up') : (isAr ? 'دخول' : 'Sign In'))}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => setIsRegistering(!isRegistering)} className="text-primary-600 font-bold hover:underline">
            {isRegistering 
              ? (isAr ? 'لديك حساب بالفعل؟ سجل دخولك' : 'Already have an account? Sign in') 
              : (isAr ? 'ليس لديك حساب؟ أنشئ حساباً جديداً' : 'Don\'t have an account? Sign up')}
          </button>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className={`bg-white rounded-3xl p-6 max-w-lg w-full relative ${isAr ? 'text-right' : 'text-left'}`}>
            <button onClick={() => setShowPrivacyModal(false)} className={`absolute top-4 ${isAr ? 'left-4' : 'right-4'} p-2 bg-gray-100 hover:bg-gray-200 rounded-full`}>
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-2xl font-bold mb-4">{isAr ? 'سياسة الخصوصية الكاملة' : 'Full Privacy Policy'}</h2>
            <div className={`h-64 overflow-y-auto text-sm text-gray-600 space-y-4 ${isAr ? 'pl-2' : 'pr-2'}`} dir={isAr ? 'rtl' : 'ltr'}>
              <p><strong>{isAr ? '1. جمع البيانات:' : '1. Data Collection:'}</strong> {isAr ? 'نقوم بجمع اسمك، بريدك الإلكتروني، ورقم جوالك حصرياً لمعالجة الطلبات وإدارة حسابك.' : 'We collect your name, email, and phone number exclusively for order processing and account management.'}</p>
              <p><strong>{isAr ? '2. التشفير (نظام PDPL):' : '2. Encryption (SDAIA PDPL):'}</strong> {isAr ? 'بياناتك مشفرة بالكامل. نحن لا نبيع أو نشارك بياناتك مع أي أطراف ثالثة غير مصرح لها.' : 'Your data is fully encrypted at rest and in transit. We do not sell or share your data with unauthorized third parties.'}</p>
              <p><strong>{isAr ? '3. الحق في النسيان:' : '3. Right to be Forgotten:'}</strong> {isAr ? 'لديك الحق في طلب الحذف الكامل لحسابك وبياناتك في أي وقت.' : 'You have the right to request full deletion of your account and data at any time.'}</p>
              <p><strong>{isAr ? '4. المدفوعات:' : '4. Payments:'}</strong> {isAr ? 'تتم معالجة معلومات البطاقة الائتمانية بشكل آمن عبر Stripe ولا يتم تخزينها أبداً على خوادمنا.' : 'Credit card information is handled securely by Stripe and is never stored on our servers.'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
