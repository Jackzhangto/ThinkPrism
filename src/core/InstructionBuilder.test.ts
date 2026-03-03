import { describe, it, expect } from 'vitest';
import { InstructionBuilder } from './InstructionBuilder';
import * as fc from 'fast-check';

describe('InstructionBuilder', () => {
  it('should replace variables correctly', () => {
    const template = 'Translate: {{text}} to {{lang}}';
    const result = InstructionBuilder.build(template, { text: 'Hello', lang: 'Chinese' });
    expect(result).toBe('Translate: Hello to Chinese');
  });

  it('should leave unknown variables as is', () => {
    const template = 'Hello {{name}}, welcome to {{place}}';
    const result = InstructionBuilder.build(template, { name: 'World' });
    expect(result).toBe('Hello World, welcome to {{place}}');
  });

  it('should handle empty template', () => {
    expect(InstructionBuilder.build('', {})).toBe('');
  });

  // Property Test #1: Verify instruction assembly order (idempotency/consistency)
  it('Property #1: Build result should not contain replaced keys if variables provided', () => {
    fc.assert(
      fc.property(fc.string(), fc.string(), (key, value) => {
        // Skip if key is empty or contains special regex chars for simplicity in this property test context
        if (!key || !/^[a-zA-Z0-9]+$/.test(key)) return true;
        
        const template = `Prefix {{${key}}} Suffix`;
        const result = InstructionBuilder.build(template, { [key]: value });
        
        return result.includes(value) && !result.includes(`{{${key}}}`);
      })
    );
  });

  // Property Test #2: Verify placeholder replacement logic (correctness)
  it('Property #2: Validation should fail if required variables are missing', () => {
     const template = '{{required}}';
     expect(InstructionBuilder.validate(template, {})).toBe(false);
     expect(InstructionBuilder.validate(template, { required: 'ok' })).toBe(true);
  });
});
