'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';

export default function AdminPage() {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Dashboard state
  const [menuItems, setMenuItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name_en: '', name_ar: '', description_en: '', description_ar: '', price: '', category_en: 'Main Course', category_ar: 'الطبق الرئيسي'
  });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchMenuItems();
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchMenuItems();
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setLoginError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError(error.message);
    setLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  async function fetchMenuItems() {
    const { data, error } = await supabase.from('menu_items').select('*').order('created_at', { ascending: false });
    if (!error && data) setMenuItems(data);
  }

  async function handleAddItem(e) {
    e.preventDefault();
    setSaving(true);
    let uploadedImageUrl = null;

    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('menu-images')
        .upload(fileName, imageFile);
      
      if (uploadError) {
        alert("Error uploading image: " + uploadError.message + "\nMake sure you created the storage bucket!");
        setSaving(false);
        return;
      }
      
      const { data: { publicUrl } } = supabase.storage.from('menu-images').getPublicUrl(fileName);
      uploadedImageUrl = publicUrl;
    }

    const { data, error } = await supabase.from('menu_items').insert([
      { ...newItem, price: parseFloat(newItem.price), image_url: uploadedImageUrl }
    ]).select();
    
    if (!error && data) {
      setMenuItems([data[0], ...menuItems]);
      setNewItem({ name_en: '', name_ar: '', description_en: '', description_ar: '', price: '', category_en: 'Main Course', category_ar: 'الطبق الرئيسي' });
      setImageFile(null);
      document.getElementById('image-upload').value = '';
    } else if (error) {
      alert("Error adding item: " + error.message);
    }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!confirm(isAr ? 'هل أنت متأكد من حذف هذا الصنف؟' : 'Are you sure you want to delete this item?')) return;
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (!error) {
      setMenuItems(menuItems.filter(item => item.id !== id));
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary-500 h-10 w-10" /></div>;
  }

  if (!session) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="glass-card p-8 rounded-2xl w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gradient mb-2">{isAr ? 'تسجيل دخول الإدارة' : 'Admin Login'}</h1>
            <p className="text-gray-500 text-sm">{isAr ? 'سجل دخولك لإدارة القائمة' : 'Sign in to manage your menu'}</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-6">
            {loginError && <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">{loginError}</div>}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{isAr ? 'البريد الإلكتروني' : 'Email Address'}</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-black focus:outline-none focus:border-primary-500 transition-colors"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{isAr ? 'كلمة المرور' : 'Password'}</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-black focus:outline-none focus:border-primary-500 transition-colors"
                required
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 rounded-lg transition-colors"
            >
              {isAr ? 'تسجيل الدخول' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className={`flex justify-between items-center mb-10 ${isAr ? 'flex-row-reverse' : ''}`}>
        <div className={isAr ? 'text-right' : 'text-left'}>
          <h1 className="text-3xl font-bold text-gradient">{isAr ? 'لوحة تحكم القائمة' : 'Menu Dashboard'}</h1>
          <p className="text-gray-500 mt-1">{isAr ? 'إدارة أصناف المطعم' : 'Manage your restaurant offerings'}</p>
        </div>
        <button onClick={handleLogout} className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
          {isAr ? 'تسجيل خروج' : 'Sign Out'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add New Item Form */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 rounded-2xl sticky top-24">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Plus className="text-primary-500" /> {isAr ? 'إضافة صنف جديد' : 'Add New Item'}
            </h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{isAr ? 'الاسم بالإنجليزية *' : 'English Name *'}</label>
                  <input required type="text" value={newItem.name_en} onChange={e => setNewItem({...newItem, name_en: e.target.value})} className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-sm text-black" />
                </div>
                <div dir="rtl">
                  <label className="block text-xs text-gray-500 mb-1">{isAr ? 'الاسم بالعربي *' : 'Arabic Name *'}</label>
                  <input required type="text" value={newItem.name_ar} onChange={e => setNewItem({...newItem, name_ar: e.target.value})} className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-sm text-black" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">{isAr ? 'السعر (ريال) *' : 'Price (SAR) *'}</label>
                <input required type="number" step="0.01" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-sm text-black" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{isAr ? 'الوصف بالإنجليزية' : 'Eng Desc.'}</label>
                  <textarea value={newItem.description_en} onChange={e => setNewItem({...newItem, description_en: e.target.value})} className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-sm text-black" rows="2" />
                </div>
                <div dir="rtl">
                  <label className="block text-xs text-gray-500 mb-1">{isAr ? 'الوصف بالعربي' : 'Ar Desc.'}</label>
                  <textarea value={newItem.description_ar} onChange={e => setNewItem({...newItem, description_ar: e.target.value})} className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-sm text-black" rows="2" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-500 mb-1">{isAr ? 'صورة الصنف' : 'Upload Image'}</label>
                <input 
                  id="image-upload"
                  type="file" 
                  accept="image/*"
                  onChange={e => setImageFile(e.target.files[0])} 
                  className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-sm text-black file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" 
                />
              </div>

              <button disabled={saving} type="submit" className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-2 rounded transition-colors flex justify-center items-center gap-2 mt-4">
                {saving ? <Loader2 className="animate-spin h-5 w-5" /> : (isAr ? 'حفظ الصنف' : 'Save Item')}
              </button>
            </form>
          </div>
        </div>

        {/* Menu Items List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-foreground mb-4">
            {isAr ? `القائمة الحالية (${menuItems.length})` : `Current Menu (${menuItems.length})`}
          </h2>
          {menuItems.length === 0 ? (
            <div className="text-center p-10 border border-dashed border-gray-300 rounded-2xl text-gray-500">
              {isAr ? 'لا يوجد أصناف. أضف واحداً من القائمة الجانبية!' : 'No items yet. Add one from the left!'}
            </div>
          ) : (
            menuItems.map(item => (
              <div key={item.id} className="glass p-4 rounded-xl flex justify-between items-center group">
                <div className={`flex gap-6 items-center ${isAr ? 'flex-row-reverse text-right' : ''}`}>
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name_en} className="h-16 w-16 object-cover rounded-lg" />
                  ) : (
                    <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">
                      🍲
                    </div>
                  )}
                  <div>
                    <h3 className={`font-bold text-foreground text-lg flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                      {item.name_en} <span className="text-gray-300 text-sm font-normal">|</span> <span dir="rtl" className="font-arabic">{item.name_ar}</span>
                    </h3>
                    <p className="text-primary-600 font-semibold">{item.price} {isAr ? 'ريال' : 'SAR'}</p>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
