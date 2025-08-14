import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ImageItem {
  id: string;
  uri: string;
  timestamp: string;
}

interface ImageStore {
  images: ImageItem[];
  addImage: (image: ImageItem) => void;
  removeImage: (id: string) => void;
  loadImages: () => Promise<void>;
  saveImages: () => Promise<void>;
}

const STORAGE_KEY = 'captured_images';

export const useImageStore = create<ImageStore>((set, get) => ({
  images: [],
  
  addImage: (image: ImageItem) => {
    set(state => ({
      images: [...state.images, image]
    }));
    get().saveImages();
  },
  
  removeImage: (id: string) => {
    set(state => ({
      images: state.images.filter(img => img.id !== id)
    }));
    get().saveImages();
  },
  
  loadImages: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const images = JSON.parse(stored);
        set({ images });
      }
    } catch (error) {
      console.error('Error loading images:', error);
    }
  },
  
  saveImages: async () => {
    try {
      const { images } = get();
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(images));
    } catch (error) {
      console.error('Error saving images:', error);
    }
  },
}));