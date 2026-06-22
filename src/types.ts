export interface PromptItem {
  id: string;
  categoryId: string;
  imageUrl: string;
  promptText: string;
}

export interface Category {
  id: string;
  name: string;
}
