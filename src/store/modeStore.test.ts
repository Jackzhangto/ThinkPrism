import { describe, it, expect, beforeEach } from 'vitest';
import { useModeStore } from './modeStore';
import * as fc from 'fast-check';

describe('useModeStore', () => {
  beforeEach(() => {
    useModeStore.getState().reset();
  });

  it('should initialize with default modes', () => {
    const { modes, filteredModes } = useModeStore.getState();
    expect(modes.length).toBeGreaterThan(0);
    expect(filteredModes.length).toBe(modes.length);
  });

  it('should filter by search query', () => {
    const store = useModeStore.getState();
    // Search for '红队' (Red Team) which exists in the new manual-aligned modes
    store.setSearchQuery('红队');
    const { filteredModes } = useModeStore.getState();
    expect(filteredModes.length).toBeGreaterThan(0);
    expect(filteredModes.every(m => m.name.includes('红队') || m.description.includes('红队') || m.tags.includes('红队'))).toBe(true);
  });

  it('should filter by category', () => {
    const store = useModeStore.getState();
    store.setCategory('L1_Micro');
    const { filteredModes } = useModeStore.getState();
    expect(filteredModes.every(m => m.category === 'L1_Micro')).toBe(true);
  });

  // Property Test #3: Verify search filtering accuracy
  it('Property #3: Filtered modes should always contain the search query in name, description, or tags', () => {
    fc.assert(
      fc.property(fc.string(), (query) => {
        useModeStore.getState().setSearchQuery(query);
        const { filteredModes } = useModeStore.getState();
        
        if (query.trim() === '') {
             // If query is empty, it might return all modes (depending on category)
             // But here we just check if it returns something valid.
             // Actually if query is empty string, all modes should be returned (if category is all)
             return true; 
        }

        const lowerQuery = query.toLowerCase();
        
        return filteredModes.every(mode => {
           return mode.name.toLowerCase().includes(lowerQuery) ||
                  mode.description.toLowerCase().includes(lowerQuery) ||
                  mode.tags.some(t => t.toLowerCase().includes(lowerQuery));
        });
      })
    );
  });

  // Another property: If a mode matches exactly, it should be in the results
  it('Property: If a mode name matches the query, it must be in the filtered list (assuming category matches)', () => {
     const allModes = useModeStore.getState().modes;
     
     fc.assert(
        fc.property(fc.constantFrom(...allModes), (targetMode) => {
            useModeStore.getState().setCategory('all'); // Ensure category doesn't block
            useModeStore.getState().setSearchQuery(targetMode.name);
            
            const { filteredModes } = useModeStore.getState();
            return filteredModes.some(m => m.id === targetMode.id);
        })
     );
  });
});
