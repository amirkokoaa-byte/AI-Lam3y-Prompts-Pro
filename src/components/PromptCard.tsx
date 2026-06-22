import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { PromptItem } from '../types';

interface PromptCardProps {
  item: PromptItem;
  onClick?: () => void;
}

export function PromptCard({ item, onClick }: PromptCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      onClick={onClick}
      className={`flex flex-col bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-all group ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="aspect-square relative overflow-hidden bg-gray-100">
        <img 
          src={item.imageUrl} 
          alt="AI Generated" 
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="p-4 flex flex-col flex-grow gap-4">
        <p className="text-sm text-slate-700 line-clamp-3 flex-grow leading-relaxed" dir="ltr">
          {item.promptText}
        </p>
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors text-sm font-bold border border-slate-300"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-green-600" />
              <span className="text-green-600">تم النسخ!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>نسخ البرومبت</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
