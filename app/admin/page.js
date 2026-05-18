'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Plus, Trash2, Star, Image as ImageIcon, Settings, Edit } from 'lucide-react';
import { useLanguage } from '@/components/LanguageProvider';

export const CATEGORIES = [
  { en: 'Foul', ar: 'فول', icon: '🍲' },
  { en: 'Gallaba', ar: 'قلابة', icon: '🥘' },
  { en: 'Shawarma', ar: 'شاورما', icon: '🌯' },
  { en: 'Grills', ar: 'مشاوي', icon: '🥩' },
  { en: 'Masoub', ar: 'معصوب', icon: '🍌' },
  { en: 'Muttabak', ar: 'مطبق', icon: '🫓' },
  { en: 'Drinks', ar: 'مشروبات', icon: '🥤' },
  { en: 'Extras', ar: 'إضافات', icon: '🍟' },
];

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
    name_en: '', name_ar: '', description_en: '', description_ar: '', price: '', 
    category_en: CATEGORIES[0].en, category_ar: CATEGORIES[0].ar, is_popular: false
  });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);

  // Site Settings State
  const [siteSettings, setSiteSettings] = useState({
    hero_title_en: 'ABBAS', hero_title_ar: 'مطاعم عباس',
    hero_subtitle_en: 'Taste the true meaning of authenticity', hero_subtitle_ar: 'تذوق المعنى الحقيقي للأصالة',
    hero_image_url: ''
  });
  const [settingsImageFile, setSettingsImageFile] = useState(null);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchMenuItems();
        fetchSiteSettings();
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchMenuItems();
        fetchSiteSettings();
      }
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

  async function fetchSiteSettings() {
    const { data, error } = await supabase.from('site_settings').select('*').limit(1).single();
    if (!error && data) setSiteSettings(data);
  }

  async function handleSaveSettings(e) {
    e.preventDefault();
    setSavingSettings(true);
    let uploadedImageUrl = siteSettings.hero_image_url;

    if (settingsImageFile) {
      const fileExt = settingsImageFile.name.split('.').pop();
      const fileName = `hero_${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('menu-images').upload(fileName, settingsImageFile);
      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage.from('menu-images').getPublicUrl(fileName);
        uploadedImageUrl = publicUrl;
      } else {
        alert("Error uploading image: " + uploadError.message);
        setSavingSettings(false);
        return;
      }
    }

    const newSettings = { ...siteSettings, hero_image_url: uploadedImageUrl };
    
    // Check if we need to insert or update
    const { data: existing } = await supabase.from('site_settings').select('id').limit(1).single();
    if (existing) {
      await supabase.from('site_settings').update(newSettings).eq('id', existing.id);
    } else {
      await supabase.from('site_settings').insert([newSettings]);
    }
    
    setSiteSettings(newSettings);
    setSettingsImageFile(null);
    document.getElementById('hero-upload').value = '';
    alert(isAr ? 'تم حفظ إعدادات الموقع!' : 'Site settings saved successfully!');
    setSavingSettings(false);
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

    const payload = { ...newItem, price: parseFloat(newItem.price) };
    if (uploadedImageUrl) {
      payload.image_url = uploadedImageUrl;
    }

    if (editingItemId) {
      const { data, error } = await supabase.from('menu_items').update(payload).eq('id', editingItemId).select();
      if (!error && data) {
        setMenuItems(menuItems.map(item => item.id === editingItemId ? data[0] : item));
        handleCancelEdit();
      } else if (error) {
        alert("Error updating item: " + error.message);
      }
    } else {
      const { data, error } = await supabase.from('menu_items').insert([payload]).select();
      if (!error && data) {
        setMenuItems([data[0], ...menuItems]);
        handleCancelEdit();
      } else if (error) {
        alert("Error adding item: " + error.message);
      }
    }
    setSaving(false);
  }

  function handleEdit(item) {
    setEditingItemId(item.id);
    setNewItem({
      name_en: item.name_en, name_ar: item.name_ar, 
      description_en: item.description_en || '', description_ar: item.description_ar || '', 
      price: item.price, category_en: item.category_en, category_ar: item.category_ar, 
      is_popular: item.is_popular || false
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleCancelEdit() {
    setEditingItemId(null);
    setNewItem({ 
      name_en: '', name_ar: '', description_en: '', description_ar: '', price: '', 
      category_en: CATEGORIES[0].en, category_ar: CATEGORIES[0].ar, is_popular: false 
    });
    setImageFile(null);
    const fileInput = document.getElementById('image-upload');
    if (fileInput) fileInput.value = '';
  }

  async function handleDelete(id) {
    if (!confirm(isAr ? 'هل أنت متأكد من حذف هذا الصنف؟' : 'Are you sure you want to delete this item?')) return;
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (!error) {
      setMenuItems(menuItems.filter(item => item.id !== id));
    }
  }

  async function togglePopular(id, currentStatus) {
    const { error } = await supabase.from('menu_items').update({ is_popular: !currentStatus }).eq('id', id);
    if (!error) {
      setMenuItems(menuItems.map(item => item.id === id ? { ...item, is_popular: !currentStatus } : item));
    }
  }

  const handleCategoryChange = (e) => {
    const selectedEn = e.target.value;
    const cat = CATEGORIES.find(c => c.en === selectedEn);
    setNewItem({ ...newItem, category_en: cat.en, category_ar: cat.ar });
  };

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
          <h1 className="text-3xl font-bold text-gradient">{isAr ? 'لوحة تحكم القائمة' : 'Admin Dashboard'}</h1>
          <p className="text-gray-500 mt-1">{isAr ? 'إدارة إعدادات الموقع وقائمة الطعام' : 'Manage your site settings and menu'}</p>
        </div>
        <button onClick={handleLogout} className="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
          {isAr ? 'تسجيل خروج' : 'Sign Out'}
        </button>
      </div>

      {/* Site Settings Section */}
      <div className="glass-card p-6 rounded-2xl mb-8">
        <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Settings className="text-primary-500" /> {isAr ? 'إعدادات الصفحة الرئيسية' : 'Landing Page Settings'}
        </h2>
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs text-gray-500 mb-1">{isAr ? 'العنوان الرئيسي بالإنجليزية' : 'Main Title (English)'}</label>
              <input required type="text" value={siteSettings.hero_title_en} onChange={e => setSiteSettings({...siteSettings, hero_title_en: e.target.value})} className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-sm text-black" />
            </div>
            <div dir="rtl">
              <label className="block text-xs text-gray-500 mb-1">{isAr ? 'العنوان الرئيسي بالعربي' : 'Main Title (Arabic)'}</label>
              <input required type="text" value={siteSettings.hero_title_ar} onChange={e => setSiteSettings({...siteSettings, hero_title_ar: e.target.value})} className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-sm text-black" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">{isAr ? 'النص الفرعي بالإنجليزية' : 'Subtitle (English)'}</label>
              <input required type="text" value={siteSettings.hero_subtitle_en} onChange={e => setSiteSettings({...siteSettings, hero_subtitle_en: e.target.value})} className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-sm text-black" />
            </div>
            <div dir="rtl">
              <label className="block text-xs text-gray-500 mb-1">{isAr ? 'النص الفرعي بالعربي' : 'Subtitle (Arabic)'}</label>
              <input required type="text" value={siteSettings.hero_subtitle_ar} onChange={e => setSiteSettings({...siteSettings, hero_subtitle_ar: e.target.value})} className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-sm text-black" />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">{isAr ? 'صورة الخلفية (اختياري)' : 'Background Image (Optional)'}</label>
            <div className="flex items-center gap-4">
              {siteSettings.hero_image_url && !settingsImageFile && (
                <img src={siteSettings.hero_image_url} alt="Current hero" className="h-12 w-20 object-cover rounded" />
              )}
              <input 
                id="hero-upload"
                type="file" 
                accept="image/*"
                onChange={e => setSettingsImageFile(e.target.files[0])} 
                className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-sm text-black file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200" 
              />
            </div>
          </div>
          <button disabled={savingSettings} type="submit" className="bg-gray-900 hover:bg-black text-white px-6 py-2 rounded transition-colors flex items-center justify-center gap-2 mt-4 text-sm font-semibold">
            {savingSettings ? <Loader2 className="animate-spin h-4 w-4" /> : (isAr ? 'حفظ الإعدادات' : 'Save Settings')}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add New Item Form */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 rounded-2xl sticky top-24">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              {editingItemId ? <Edit className="text-primary-500" /> : <Plus className="text-primary-500" />}
              {editingItemId ? (isAr ? 'تعديل الصنف' : 'Edit Menu Item') : (isAr ? 'إضافة صنف جديد' : 'Add New Menu Item')}
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{isAr ? 'التصنيف *' : 'Category *'}</label>
                  <select 
                    value={newItem.category_en} 
                    onChange={handleCategoryChange}
                    className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-sm text-black"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.en} value={cat.en}>
                        {cat.icon} {isAr ? cat.ar : cat.en}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">{isAr ? 'السعر (ريال) *' : 'Price (SAR) *'}</label>
                  <input required type="number" step="0.01" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} className="w-full bg-white border border-gray-200 rounded px-3 py-2 text-sm text-black" />
                </div>
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

              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="checkbox" 
                  id="is_popular" 
                  checked={newItem.is_popular} 
                  onChange={e => setNewItem({...newItem, is_popular: e.target.checked})}
                  className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                />
                <label htmlFor="is_popular" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  {isAr ? 'إضافة إلى الأكثر ترويجاً' : 'Mark as Popular'}
                </label>
              </div>

              <button disabled={saving} type="submit" className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-2 rounded transition-colors flex justify-center items-center gap-2 mt-4">
                {saving ? <Loader2 className="animate-spin h-5 w-5" /> : (editingItemId ? (isAr ? 'تحديث الصنف' : 'Update Item') : (isAr ? 'حفظ الصنف' : 'Save Item'))}
              </button>
              
              {editingItemId && (
                <button type="button" onClick={handleCancelEdit} className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 rounded transition-colors flex justify-center items-center gap-2 mt-2">
                  {isAr ? 'إلغاء التعديل' : 'Cancel Edit'}
                </button>
              )}
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
                    <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl text-gray-400">
                      <ImageIcon className="h-8 w-8" />
                    </div>
                  )}
                  <div>
                    <h3 className={`font-bold text-foreground text-lg flex items-center gap-3 ${isAr ? 'flex-row-reverse' : ''}`}>
                      {item.name_en} <span className="text-gray-300 text-sm font-normal">|</span> <span dir="rtl" className="font-arabic">{item.name_ar}</span>
                    </h3>
                    <div className={`flex items-center gap-3 mt-1 ${isAr ? 'flex-row-reverse' : ''}`}>
                      <p className="text-primary-600 font-semibold">{item.price} {isAr ? 'ريال' : 'SAR'}</p>
                      <span className="text-gray-400 text-xs px-2 py-0.5 bg-gray-100 rounded-full">{isAr ? item.category_ar : item.category_en}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => togglePopular(item.id, item.is_popular)} 
                    title={isAr ? 'الأكثر ترويجاً' : 'Popular'}
                    className={`p-2 rounded-lg transition-colors ${item.is_popular ? 'text-yellow-400 bg-yellow-50 hover:bg-yellow-100' : 'text-gray-300 hover:text-yellow-400 hover:bg-gray-50'}`}
                  >
                    <Star className={`h-5 w-5 ${item.is_popular ? 'fill-current' : ''}`} />
                  </button>
                  <button onClick={() => handleEdit(item)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                    <Edit className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
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
