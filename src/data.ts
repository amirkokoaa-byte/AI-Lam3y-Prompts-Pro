import { Category, PromptItem } from './types';
import rawData from './trending-prompts.json';

const categoryTranslation: Record<string, string> = {
  "Photography": "تصوير فوتوغرافي",
  "Illustration & 3D": "رسومات وثلاثي الأبعاد",
  "Product & Brand": "المنتجات والعلامات التجارية",
  "Food & Drink": "أطعمة ومشروبات",
  "Poster Design": "تصميم ملصقات",
  "UI & Graphic": "واجهة مستخدم وجرافيك",
  "Unknown": "غير معروف"
};

// Filter out prompts without images
const validData = rawData.filter((item: any) => 
  item.image && 
  typeof item.image === 'string' && 
  item.image.trim() !== '' &&
  item.prompt &&
  typeof item.prompt === 'string'
);

// Extract unique categories from valid data
const uniqueCategories = new Set<string>();
validData.forEach((item: any) => {
  if (item.categories && Array.isArray(item.categories) && item.categories.length > 0) {
    uniqueCategories.add(item.categories[0]);
  } else {
    uniqueCategories.add('Unknown');
  }
});

// Create category objects
export const CATEGORIES: Category[] = Array.from(uniqueCategories).map((name) => ({
  id: name,
  name: categoryTranslation[name] || name,
}));

// Map raw data to PromptItem array
export const MOCK_DATA: PromptItem[] = validData.map((item: any) => ({
  id: item.id,
  categoryId: item.categories && item.categories.length > 0 ? item.categories[0] : 'Unknown',
  imageUrl: item.image,
  promptText: item.prompt,
}));

