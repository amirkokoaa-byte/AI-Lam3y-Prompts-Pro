import React, { useState, useMemo, useEffect } from 'react';
import { CATEGORIES, fetchTrendingPrompts } from './data';
import { PromptCard } from './components/PromptCard';
import { DetailView } from './components/DetailView';
import { SettingsModal } from './components/SettingsModal';
import { PromptItem } from './types';
import { Settings as SettingsIcon } from 'lucide-react';
import { db } from './lib/firebase';
import { collection, doc, onSnapshot, setDoc, addDoc } from 'firebase/firestore';

const ITEMS_PER_PAGE = 30;

export default function App() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [selectedItem, setSelectedItem] = useState<PromptItem | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [localPrompts, setLocalPrompts] = useState<PromptItem[]>([]);

  const [appSettings, setAppSettings] = useState({ 
    siteTitle: 'AI Lam3y Prompts Pro', 
    siteSubtitle: 'اكتشف وانسخ أفضل البرومبتس لتوليد الصور بالذكاء الاصطناعي',
    bannerUrl: '/banner.png'
  });
  const [firebasePrompts, setFirebasePrompts] = useState<PromptItem[]>([]);

  useEffect(() => {
    // Fetch local json file
    fetchTrendingPrompts().then(setLocalPrompts);

    const unsubSettings = onSnapshot(doc(db, 'settings', 'main'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setAppSettings({
          siteTitle: data.siteTitle || 'AI Lam3y Prompts Pro',
          siteSubtitle: data.siteSubtitle || 'اكتشف وانسخ أفضل البرومبتس لتوليد الصور بالذكاء الاصطناعي',
          bannerUrl: data.bannerUrl || '/banner.png'
        });
      }
    });

    const unsubPrompts = onSnapshot(collection(db, 'prompts'), (snapshot) => {
      const p: PromptItem[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        p.push({
          id: doc.id,
          categoryId: data.categoryId,
          imageUrl: data.imageUrl,
          promptText: data.promptText,
        });
      });
      setFirebasePrompts(p.reverse());
    });

    return () => {
      unsubSettings();
      unsubPrompts();
    };
  }, []);

  const allDataCombined = useMemo(() => {
    return [...firebasePrompts, ...localPrompts];
  }, [firebasePrompts, localPrompts]);

  const filteredData = useMemo(() => {
    return activeCategory 
      ? allDataCombined.filter(item => item.categoryId === activeCategory)
      : allDataCombined;
  }, [activeCategory, allDataCombined]);

  const visibleData = filteredData.slice(0, visibleCount);
  const hasMore = visibleCount < filteredData.length;

  const handleCategoryChange = (categoryId: string | null) => {
    setActiveCategory(categoryId);
    setVisibleCount(ITEMS_PER_PAGE);
    setSelectedItem(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  };

  const handleSaveSettings = async (settings: { siteTitle: string; siteSubtitle: string; bannerUrl: string }) => {
    await setDoc(doc(db, 'settings', 'main'), settings);
  };

  const handleAddPrompt = async (prompt: { categoryId: string; imageUrl: string; promptText: string }) => {
    await addDoc(collection(db, 'prompts'), {
      ...prompt,
      createdAt: Date.now()
    });
  };

  if (selectedItem) {
    return (
      <div className="min-h-screen bg-gray-100 font-sans text-slate-900 flex flex-col" dir="rtl">
        <header className="bg-slate-900 text-white shadow-md sticky top-0 z-10 p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-display font-bold tracking-tight">{appSettings.siteTitle}</h1>
            <div className="flex gap-4 items-center">
              <button 
                onClick={() => setSelectedItem(null)}
                className="text-gray-300 hover:text-white transition-colors"
                title="العودة للرئيسية"
              >
                العودة للرئيسية
              </button>
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="text-gray-300 hover:text-white transition-colors"
                title="الإعدادات"
              >
                <SettingsIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Banner Section */}
        <div className="w-full bg-slate-900 border-b border-slate-800">
          <img 
            src={appSettings.bannerUrl} 
            alt="Banner" 
            className="w-full h-auto max-h-[300px] object-cover mx-auto"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://placehold.co/1200x300/1e293b/ffffff?text=Please+upload+a+banner+image";
            }}
          />
        </div>

        <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
           <DetailView 
             item={selectedItem} 
             onClose={() => setSelectedItem(null)} 
             onSelect={(item) => {
                setSelectedItem(item);
                window.scrollTo({ top: 0, behavior: 'smooth' });
             }}
             allData={allDataCombined}
           />
        </main>
        
        <footer className="bg-slate-900 text-center py-6 text-gray-300 border-t border-slate-800">
           مع تحيات المطور Amir Lamay
        </footer>

        {isSettingsOpen && (
          <SettingsModal 
            onClose={() => setIsSettingsOpen(false)}
            onSaveSettings={handleSaveSettings}
            onAddPrompt={handleAddPrompt}
            currentSettings={appSettings}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-slate-900 flex flex-col" dir="rtl">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-display font-bold tracking-tight">{appSettings.siteTitle}</h1>
            <p className="text-gray-300 mt-1">{appSettings.siteSubtitle}</p>
          </div>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="text-gray-300 hover:text-white transition-colors"
            title="الإعدادات"
          >
            <SettingsIcon className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Banner Section */}
      <div className="w-full bg-slate-900 border-b border-slate-800">
        <img 
          src={appSettings.bannerUrl} 
          alt="Banner" 
          className="w-full h-auto max-h-[300px] object-cover mx-auto"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://placehold.co/1200x300/1e293b/ffffff?text=Please+upload+a+banner+image";
          }}
        />
      </div>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8 w-full">
        
        {/* Sidebar / Categories */}
        <aside className="md:w-64 flex-shrink-0">
          <div className="sticky top-28 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b pb-2">
              الأقسام
            </h2>
            <nav className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto custom-scrollbar pl-2">
              <button
                onClick={() => handleCategoryChange(null)}
                className={`text-right px-3 py-2 rounded-lg text-sm font-medium transition-colors flex justify-between items-center ${
                  activeCategory === null 
                    ? 'bg-slate-900 text-white' 
                    : 'text-slate-600 hover:bg-gray-100 hover:text-slate-900'
                }`}
              >
                <span className="truncate">جميع البرومبتات</span>
                <span className={`text-xs mr-2 ${activeCategory === null ? 'text-gray-300' : 'text-gray-400'}`}>
                  {allDataCombined.length}
                </span>
              </button>
              {CATEGORIES.map(category => {
                const count = allDataCombined.filter(i => i.categoryId === category.id).length;
                if (count === 0) return null;
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`text-right px-3 py-2 rounded-lg text-sm font-medium transition-colors flex justify-between items-center ${
                      activeCategory === category.id
                        ? 'bg-slate-900 text-white' 
                        : 'text-slate-600 hover:bg-gray-100 hover:text-slate-900'
                    }`}
                  >
                    <span className="truncate">{category.name}</span>
                    <span className={`text-xs mr-2 ${activeCategory === category.id ? 'text-gray-300' : 'text-gray-400'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Gallery Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleData.map(item => (
              <PromptCard key={item.id} item={item} onClick={() => setSelectedItem(item)} />
            ))}
          </div>
          
          {hasMore && (
            <div className="flex justify-center mt-12 mb-8">
              <button
                onClick={handleLoadMore}
                className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg shadow-sm hover:shadow transition-all"
              >
                عرض المزيد
              </button>
            </div>
          )}

          {filteredData.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              لا توجد برومبتات في هذا القسم.
            </div>
          )}
        </div>
      </main>

      <footer className="bg-slate-900 text-center py-6 text-gray-300 border-t border-slate-800 mt-auto">
         مع تحيات المطور Amir Lamay
      </footer>

      {isSettingsOpen && (
        <SettingsModal 
          onClose={() => setIsSettingsOpen(false)}
          onSaveSettings={handleSaveSettings}
          onAddPrompt={handleAddPrompt}
          currentSettings={appSettings}
        />
      )}
    </div>
  );
}