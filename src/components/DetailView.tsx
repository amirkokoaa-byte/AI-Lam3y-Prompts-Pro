import React, { useState, useMemo } from 'react';
import { Copy, Check, ArrowRight } from 'lucide-react';
import { PromptItem } from '../types';

interface DetailViewProps {
  item: PromptItem;
  onClose: () => void;
  onSelect: (item: PromptItem) => void;
  allData: PromptItem[];
}

export function DetailView({ item, onClose, onSelect, allData }: DetailViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(item.promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const suggestions = useMemo(() => {
    return allData
      .filter(d => d.categoryId === item.categoryId && d.id !== item.id)
      .sort(() => 0.5 - Math.random()) // Randomize slightly
      .slice(0, 6);
  }, [item, allData]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full animate-in fade-in duration-300">
      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col">
          <div className="w-full bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center min-h-[400px]">
            <img 
              src={item.imageUrl} 
              alt="AI Generated Full" 
              className="max-w-full max-h-[70vh] object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="mt-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 border-b pb-2">البرومبت (Prompt)</h2>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <p className="text-slate-800 text-lg leading-relaxed whitespace-pre-wrap font-medium" dir="ltr">
                {item.promptText}
              </p>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 w-full py-4 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all shadow-sm hover:shadow text-lg font-bold mt-2"
            >
              {copied ? (
                <>
                  <Check className="w-6 h-6 text-green-400" />
                  <span className="text-green-400">تم النسخ بنجاح!</span>
                </>
              ) : (
                <>
                  <Copy className="w-6 h-6" />
                  <span>نسخ البرومبت بالكامل</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar Suggestions */}
      <div className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-4">
        <h3 className="text-lg font-bold text-slate-800 bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-200">
          اقتراحات مشابهة
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
          {suggestions.map(suggestion => (
            <div 
              key={suggestion.id}
              onClick={() => onSelect(suggestion)}
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer group flex flex-col"
            >
              <div className="aspect-square relative bg-gray-100 overflow-hidden">
                <img 
                  src={suggestion.imageUrl} 
                  alt="Suggestion" 
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="p-3">
                <p className="text-xs text-slate-600 line-clamp-2" dir="ltr">
                  {suggestion.promptText}
                </p>
              </div>
            </div>
          ))}
          {suggestions.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">لا توجد اقتراحات أخرى في هذا القسم.</p>
          )}
        </div>
      </div>
    </div>
  );
}
