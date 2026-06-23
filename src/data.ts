import { Category, PromptItem } from './types';

const categoryTranslation: Record<string, string> = {
  "Photography": "تصوير فوتوغرافي",
  "Illustration & 3D": "رسومات وثلاثي الأبعاد",
  "Product & Brand": "المنتجات والعلامات التجارية",
  "Food & Drink": "أطعمة ومشروبات",
  "Poster Design": "تصميم ملصقات",
  "UI & Graphic": "واجهة مستخدم وجرافيك",
  "Unknown": "غير معروف"
};

export const CATEGORIES: Category[] = Object.keys(categoryTranslation).map(name => ({
  id: name,
  name: categoryTranslation[name] || name,
}));

export async function fetchTrendingPrompts(): Promise<PromptItem[]> {
  try {
    const response = await fetch('/trending-prompts.json');
    if (!response.ok) return [];
    const rawData = await response.json();
    
    const validData = rawData.filter((item: any) => 
      item.image && 
      typeof item.image === 'string' && 
      item.image.trim() !== '' &&
      item.prompt &&
      typeof item.prompt === 'string'
    );

    return validData.map((item: any) => ({
      id: item.id,
      categoryId: item.categories && item.categories.length > 0 ? item.categories[0] : 'Unknown',
      imageUrl: item.image,
      promptText: item.prompt,
    }));
  } catch (err) {
    console.error('Failed to load local prompts', err);
    return [];
  }
}
