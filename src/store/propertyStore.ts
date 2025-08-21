import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Property, TabType } from '@/types';

interface PropertyState {
  // Properties data
  properties: Record<string, Property>;
  currentPropertyId: string | null;
  
  // UI state
  activeTab: TabType;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setProperties: (properties: Property[]) => void;
  addProperty: (property: Property) => void;
  updateProperty: (id: string, updates: Partial<Property>) => void;
  setCurrentProperty: (id: string | null) => void;
  setActiveTab: (tab: TabType) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed values
  getCurrentProperty: () => Property | null;
  getPropertiesList: () => Property[];
}

export const usePropertyStore = create<PropertyState>()(
  devtools(
    (set, get) => ({
      // Initial state
      properties: {},
      currentPropertyId: null,
      activeTab: 'overview',
      isLoading: false,
      error: null,

      // Actions
      setProperties: (properties) =>
        set(() => ({
          properties: properties.reduce((acc, prop) => {
            acc[prop.id] = prop;
            return acc;
          }, {} as Record<string, Property>),
        })),

      addProperty: (property) =>
        set((state) => ({
          properties: {
            ...state.properties,
            [property.id]: property,
          },
        })),

      updateProperty: (id, updates) =>
        set((state) => ({
          properties: {
            ...state.properties,
            [id]: { ...state.properties[id], ...updates },
          },
        })),

      setCurrentProperty: (id) =>
        set(() => ({
          currentPropertyId: id,
        })),

      setActiveTab: (tab) =>
        set(() => ({
          activeTab: tab,
        })),

      setLoading: (loading) =>
        set(() => ({
          isLoading: loading,
        })),

      setError: (error) =>
        set(() => ({
          error,
        })),

      // Computed values
      getCurrentProperty: () => {
        const { properties, currentPropertyId } = get();
        return currentPropertyId ? properties[currentPropertyId] || null : null;
      },

      getPropertiesList: () => {
        const { properties } = get();
        return Object.values(properties);
      },
    }),
    {
      name: 'property-store',
    }
  )
);
