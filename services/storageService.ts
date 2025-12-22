import { CustomCategory } from '../types';

const STORAGE_KEY = 'imposter_game_custom_categories';

export const storageService = {
  getCustomCategories: (): CustomCategory[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveCustomCategory: (category: CustomCategory) => {
    const categories = storageService.getCustomCategories();
    const index = categories.findIndex(c => c.id === category.id);
    if (index >= 0) {
      categories[index] = category;
    } else {
      categories.push(category);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
  },

  deleteCustomCategory: (id: string) => {
    const categories = storageService.getCustomCategories();
    const filtered = categories.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  }
};