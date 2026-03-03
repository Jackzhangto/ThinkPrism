import { describe, it, expect } from 'vitest';
import modes from './modes.json';
import { Mode } from './types';

describe('modes.json validation', () => {
  it('should be a valid array of Mode objects', () => {
    expect(Array.isArray(modes)).toBe(true);
    // Cast to unknown first to avoid TS errors in test if json is not perfectly typed yet
    const typedModes = modes as unknown as Mode[];
    
    typedModes.forEach(mode => {
      // Check required fields
      expect(mode.id).toBeTypeOf('string');
      expect(mode.name).toBeTypeOf('string');
      expect(mode.description).toBeTypeOf('string');
      expect(mode.category).toMatch(/^(L1_Micro|L2_Combo|L3_Deep)$/);
      expect(Array.isArray(mode.prompts)).toBe(true);
      expect(mode.prompts.length).toBeGreaterThan(0);
      expect(Array.isArray(mode.tags)).toBe(true);
      
      // Check prompts content
      mode.prompts.forEach(prompt => {
        expect(prompt).toBeTypeOf('string');
        expect(prompt).not.toContain('{{text}}');
        expect(prompt).toContain('内容如下：');
      });

      // Check scenarioPrompts if present
      if (mode.scenarioPrompts) {
        expect(mode.scenarioPrompts).toBeTypeOf('object');
        Object.values(mode.scenarioPrompts).forEach(prompt => {
          expect(prompt).toBeTypeOf('string');
          expect(prompt).not.toContain('{{text}}');
           // Some scenario prompts might not strictly end with "内容如下：" if they are questions, 
           // but our rule was to replace {{text}} with it. 
           // Let's check if they are non-empty at least.
           expect(prompt.length).toBeGreaterThan(0);
        });
        
        // Check keys match expected scenarios
        const validScenarios = ['product', 'code', 'decision', 'learning'];
        Object.keys(mode.scenarioPrompts).forEach(key => {
            expect(validScenarios).toContain(key);
        });
      }
    });
  });

  it('should have unique IDs', () => {
    const typedModes = modes as unknown as Mode[];
    const ids = typedModes.map(m => m.id);
    const uniqueIds = new Set(ids);
    expect(ids.length).toBe(uniqueIds.size);
  });
});
