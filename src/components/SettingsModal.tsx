import React, { useState, useRef } from 'react';
import { X, Upload, Save, Image as ImageIcon } from 'lucide-react';
import { CATEGORIES } from '../data';

interface SettingsModalProps {
  onClose: () => void;
  onSaveSettings: (settings: { siteTitle: string; siteSubtitle: string; bannerUrl: string }) => Promise<void>;
  onAddPrompt: (prompt: { categoryId: string; imageUrl: string; promptText: string }) => Promise<void>;
  currentSettings: { siteTitle: string; siteSubtitle: string; bannerUrl: string };
}

export function SettingsModal({ onClose, onSaveSettings, onAddPrompt, currentSettings }: SettingsModalProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  // Settings State
  const [siteTitle, setSiteTitle] = useState(currentSettings.siteTitle);
  const [siteSubtitle, setSiteSubtitle] = useState(currentSettings.siteSubtitle);
  const [bannerUrl, setBannerUrl] = useState(currentSettings.bannerUrl);

  // New Prompt State
  const [promptCategory, setPromptCategory] = useState(CATEGORIES[0]?.id || 'Unknown');
  const [promptText, setPromptText] = useState('');
  const [promptImage, setPromptImage] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '0000') {
      setIsAuthenticated(true);
    } else {
      alert('كلمة المرور غير صحيحة');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    await onSaveSettings({ siteTitle, siteSubtitle, bannerUrl });
    setIsSaving(false);
    alert('تم حفظ الإعدادات بنجاح');
  };

  const handleSavePrompt = async () => {
    if (!promptText || !promptImage) {
      alert('يرجى إدخال البرومبت واختيار أو إدخال رابط الصورة');
      return;
    }
    setIsSaving(true);
    
    let finalPromptText = promptText;
    
    try {
      // Translate the prompt if it is not in English
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: promptText })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.translatedText) {
          finalPromptText = data.translatedText;
        }
      }
    } catch (e) {
      console.error('Translation failed', e);
    }

    await onAddPrompt({ categoryId: promptCategory, imageUrl: promptImage, promptText: finalPromptText });
    setPromptText('');
    setPromptImage('');
    setIsSaving(false);
    alert('تمت إضافة البرومبت بنجاح');
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" dir="rtl">
        <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">تسجيل الدخول للإعدادات</h2>
              <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-slate-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">كلمة المرور</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all font-sans"
                  placeholder="أدخل كلمة المرور"
                  autoFocus
                  dir="ltr"
                />
              </div>
              <button 
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-lg transition-all"
              >
                دخول
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" dir="rtl">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200 custom-scrollbar">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-slate-800">لوحة التحكم والإعدادات</h2>
          <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 flex flex-col gap-8">
          
          {/* Settings Section */}
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">إعدادات الموقع</h3>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">اسم الموقع</label>
              <input 
                type="text" 
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">وصف الموقع (العنوان الفرعي)</label>
              <input 
                type="text" 
                value={siteSubtitle}
                onChange={(e) => setSiteSubtitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="flex flex-col gap-2">
               <label className="text-sm font-semibold text-slate-700">صورة البانر (رابط أو رفع)</label>
               <div className="flex gap-2">
                 <input 
                   type="text" 
                   value={bannerUrl}
                   onChange={(e) => setBannerUrl(e.target.value)}
                   placeholder="الرابط هنا..."
                   className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 text-left"
                   dir="ltr"
                 />
                 <input 
                   type="file" 
                   accept="image/*"
                   className="hidden" 
                   ref={bannerInputRef} 
                   onChange={(e) => handleImageUpload(e, setBannerUrl)} 
                 />
                 <button 
                   onClick={() => bannerInputRef.current?.click()}
                   className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center justify-center border border-slate-300 transition-colors"
                   title="رفع صورة"
                 >
                   <Upload className="w-5 h-5" />
                 </button>
               </div>
            </div>

            <button 
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="mt-2 py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all self-end"
            >
              <Save className="w-5 h-5" />
              حفظ الإعدادات
            </button>
          </div>

          {/* Add Prompt Section */}
          <div className="flex flex-col gap-4 mt-4 border-t pt-8 text-slate-800">
            <h3 className="text-lg font-bold text-slate-800 border-b pb-2">إضافة برومبت جديد</h3>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">القسم</label>
              <select 
                value={promptCategory}
                onChange={(e) => setPromptCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 appearance-none"
              >
                {CATEGORIES.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
               <label className="text-sm font-semibold text-slate-700">صورة البرومبت (رابط أو رفع من الجهاز)</label>
               <div className="flex gap-2">
                 <input 
                   type="text" 
                   value={promptImage}
                   onChange={(e) => setPromptImage(e.target.value)}
                   placeholder="https://..."
                   className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 text-left"
                   dir="ltr"
                 />
                 <input 
                   type="file" 
                   accept="image/*"
                   className="hidden" 
                   ref={fileInputRef} 
                   onChange={(e) => handleImageUpload(e, setPromptImage)} 
                 />
                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center justify-center border border-slate-300 transition-colors"
                 >
                   <Upload className="w-5 h-5" />
                 </button>
               </div>
               {promptImage && (
                 <div className="mt-2 w-32 h-32 rounded-lg border overflow-hidden bg-slate-100">
                    <img src={promptImage} alt="Preview" className="w-full h-full object-cover" />
                 </div>
               )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-700">البرومبت (Prompt)</label>
              <textarea 
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                rows={4}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none text-left"
                placeholder="أدخل البرومبت بالكامل هنا..."
                dir="ltr"
              />
            </div>

            <button 
              onClick={handleSavePrompt}
              disabled={isSaving}
              className="mt-2 py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all self-end"
            >
              <Save className="w-5 h-5" />
              حفظ البرومبت وإضافته
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
