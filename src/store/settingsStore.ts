import { STORAGE_KEYS, type UnitSystem } from '@/shared/constants';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const createNamespacedStorage = () =>
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
      name: STORAGE_KEYS.settings,
      version: 1,
      storage: createNamespacedStorage(),
      partialize: (s) => ({ unitSystem: s.unitSystem }),
    }
  )
);
