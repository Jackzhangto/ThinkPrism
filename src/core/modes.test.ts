import { describe, it, expect } from 'vitest';
import modesZh from './modes.json';
import modesEn from './modes.en.json';
import { Mode } from './types';

function validateModeStructure(typedModes: Mode[], promptSuffix: string) {
  typedModes.forEach((mode) => {
    expect(mode.id).toBeTypeOf('string');
    expect(mode.name).toBeTypeOf('string');
    expect(mode.description).toBeTypeOf('string');
    expect(mode.category).toMatch(/^(L1_Micro|L2_Combo|L3_Deep)$/);
    expect(Array.isArray(mode.prompts)).toBe(true);
    expect(mode.prompts.length).toBeGreaterThan(0);
    expect(Array.isArray(mode.tags)).toBe(true);

    mode.prompts.forEach((prompt) => {
      expect(prompt).toBeTypeOf('string');
      expect(prompt).not.toContain('{{text}}');
      expect(prompt).toContain(promptSuffix);
    });

    if (mode.scenarioPrompts) {
      expect(mode.scenarioPrompts).toBeTypeOf('object');
      Object.values(mode.scenarioPrompts).forEach((prompt) => {
        expect(prompt).toBeTypeOf('string');
        expect(prompt).not.toContain('{{text}}');
        expect(prompt.length).toBeGreaterThan(0);
      });
      const validScenarios = ['product', 'code', 'decision', 'learning'];
      Object.keys(mode.scenarioPrompts).forEach((key) => {
        expect(validScenarios).toContain(key);
      });
    }
  });
}

describe('modes.json (zh) validation', () => {
  it('should be a valid array of Mode objects', () => {
    expect(Array.isArray(modesZh)).toBe(true);
    const typedModes = modesZh as unknown as Mode[];
    validateModeStructure(typedModes, '内容如下：');
  });

  it('should have unique IDs', () => {
    const typedModes = modesZh as unknown as Mode[];
    const ids = typedModes.map((m) => m.id);
    expect(ids.length).toBe(new Set(ids).size);
  });
});

describe('modes.en.json (en) validation', () => {
  it('should be a valid array of Mode objects', () => {
    expect(Array.isArray(modesEn)).toBe(true);
    const typedModes = modesEn as unknown as Mode[];
    validateModeStructure(typedModes, ' below:');
  });

  it('should have same IDs as modes.json', () => {
    const zhIds = (modesZh as unknown as Mode[]).map((m) => m.id).sort();
    const enIds = (modesEn as unknown as Mode[]).map((m) => m.id).sort();
    expect(enIds).toEqual(zhIds);
  });
});
