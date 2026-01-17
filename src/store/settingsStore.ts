import type { UnitSystem } from '@/shared/constants';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const STORAGE_KEY = 'dive-log:settings';

const createNamespacedStorage = (name: string) =>
  createJSONStorage(() => ({
    getItem: (key) => {
      return localStorage.getItem(key);
    },
    setItem: (key, value) => localStorage.setItem(key, value),
    removeItem: (key) => {
      localStorage.removeItem(key);
    },
  }));

type SettingsState = {
  unitSystem: UnitSystem;
  setUnitSystem: (unitSystem: UnitSystem) => void;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      unitSystem: 'metric',
      setUnitSystem: (unitSystem) => set({ unitSystem }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createNamespacedStorage(STORAGE_KEY),
      partialize: (s) => ({ unitSystem: s.unitSystem }),
    }
  )
);
