import { create } from 'zustand';
import { Mode, ModeCategory } from '../core/types';
import defaultModesData from '../core/modes.json';

// Ensure JSON data matches Mode interface roughly (casting for now as JSON import is untyped by default without config)
const defaultModes = defaultModesData as unknown as Mode[];

interface ModeState {
  modes: Mode[];
  searchQuery: string;
  selectedCategory: ModeCategory | 'all';
  filteredModes: Mode[];
  persistentModeId: string | null;
  activeScenario: string | null;
  
  // Actions
  setModes: (modes: Mode[]) => void;
  setSearchQuery: (query: string) => void;
  setCategory: (category: ModeCategory | 'all') => void;
  setActiveScenario: (scenarioLabel: string | null) => void;
  setPersistentMode: (id: string | null) => void;
  reset: () => void;
}

const filterModesHelper = (
  modes: Mode[], 
  searchQuery: string, 
  category: ModeCategory | 'all',
  activeScenario: string | null
) => {
  // If a scenario is active, it overrides other filters
  if (activeScenario) {
    return modes.filter(mode => mode.tags.includes(activeScenario));
  }

  const lowerQuery = searchQuery.toLowerCase();
  return modes.filter(mode => {
    const matchesCategory = category === 'all' || mode.category === category;
    const matchesSearch = 
      mode.name.toLowerCase().includes(lowerQuery) || 
      mode.description.toLowerCase().includes(lowerQuery) ||
      mode.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
    
    return matchesCategory && matchesSearch;
  });
};

export const useModeStore = create<ModeState>((set, get) => ({
  modes: defaultModes,
  searchQuery: '',
  selectedCategory: 'all',
  filteredModes: defaultModes,
  persistentModeId: null,
  activeScenario: null,

  setModes: (modes) => {
    const { searchQuery, selectedCategory, activeScenario } = get();
    set({ 
      modes, 
      filteredModes: filterModesHelper(modes, searchQuery, selectedCategory, activeScenario) 
    });
  },

  setSearchQuery: (query) => {
    const { modes, selectedCategory, activeScenario } = get();
    set({ 
      searchQuery: query, 
      filteredModes: filterModesHelper(modes, query, selectedCategory, activeScenario) 
    });
  },

  setCategory: (category) => {
    const { modes, searchQuery, activeScenario } = get();
    set({ 
      selectedCategory: category,
      filteredModes: filterModesHelper(modes, searchQuery, category, activeScenario)
    });
  },

  setActiveScenario: (scenarioLabel) => {
    const { modes, searchQuery, selectedCategory } = get();
    // When entering scenario mode, we might want to clear search query visually, 
    // but keeping it in state might be fine. 
    // However, the requirement is to HIDE search bar, so effective search is null.
    // Let's rely on the helper to prioritize scenario.
    set({ 
      activeScenario: scenarioLabel,
      filteredModes: filterModesHelper(modes, searchQuery, selectedCategory, scenarioLabel)
    });
  },

  setPersistentMode: (id) => {
    set({ persistentModeId: id });
  },

  reset: () => {
    set({
      modes: defaultModes,
      searchQuery: '',
      selectedCategory: 'all',
      filteredModes: defaultModes,
      activeScenario: null
    });
  }
}));
