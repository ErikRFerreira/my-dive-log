import type { UnitSystem } from '@/shared/constants';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

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
      name: 'settings',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ unitSystem: s.unitSystem }),
    }
  )
);

