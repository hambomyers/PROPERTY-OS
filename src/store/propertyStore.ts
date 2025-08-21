import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Property, TabType } from '@/types';

interface PropertyState {
  properties: Property[];
  activeProperty: Property | null;
  activeTab: TabType;
  loading: boolean;
  error: string | null;
  
  // Actions
  addProperty: (property: Property) => void;
  removeProperty: (id: string) => void;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  setActiveProperty: (property: Property | null) => void;
  setActiveTab: (tab: TabType) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed
  getPropertyById: (id: string) => Property | undefined;
  getTotalValue: () => number;
  getMonthlyIncome: () => number;
}

export const usePropertyStore = create<PropertyState>()(
  devtools(
    (set, get) => ({
      // Initial state
      properties: [],
      activeProperty: null,
      activeTab: 'overview',
      loading: false,
      error: null,

      // Actions
      addProperty: (property: Property) =>
        set((state) => ({
          properties: [...state.properties, property]
        })),
      
      removeProperty: (id: string) =>
        set((state) => ({
          properties: state.properties.filter(p => p.id !== id)
        })),
      
      updateProperty: (id: string, updates: Partial<Property>) =>
        set((state) => ({
          properties: state.properties.map(p => 
            p.id === id ? { ...p, ...updates } : p
          )
        })),
      
      setActiveProperty: (property: Property | null) =>
        set(() => ({ activeProperty: property })),
      
      setActiveTab: (tab: TabType) =>
        set(() => ({ activeTab: tab })),
      
      setLoading: (loading: boolean) =>
        set(() => ({ loading })),
      
      setError: (error: string | null) =>
        set(() => ({ error })),

      // Computed
      getPropertyById: (id: string) => {
        return get().properties.find(p => p.id === id);
      },
      
      getTotalValue: () => {
        return get().properties.reduce((total, prop) => total + (prop.overview.vitals.currentValue.amount || 0), 0);
      },
      
      getMonthlyIncome: () => {
        return get().properties.reduce((total, prop) => total + (prop.overview.vitals.monthlyRevenue.amount || 0), 0);
      }
    }),
    {
      name: 'property-store',
    }
  )
);
