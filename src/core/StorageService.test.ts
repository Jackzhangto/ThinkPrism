import { describe, it, expect, beforeEach, vi } from 'vitest';
import { StorageService } from './StorageService';
import { Mode } from './types';

// Mock chrome.storage
const mockStorage = {
  local: {
    get: vi.fn(),
    set: vi.fn(),
  }
};

global.chrome = {
  storage: mockStorage
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

describe('StorageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return default storage when empty', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockStorage.local.get.mockImplementation((_, cb: any) => cb({}));
    const data = await StorageService.get();
    expect(data.preferences.language).toBe('zh');
    expect(data.customModes).toEqual([]);
  });

  it('should merge saved preferences with defaults', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockStorage.local.get.mockImplementation((_, cb: any) => cb({
      preferences: { theme: 'dark' }
    }));
    const data = await StorageService.get();
    expect(data.preferences.theme).toBe('dark');
    expect(data.preferences.language).toBe('zh'); // Default preserved
  });

  it('should add custom mode', async () => {
    // Mock get to return empty
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockStorage.local.get.mockImplementation((_, cb: any) => cb({}));
    // Mock set
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockStorage.local.set.mockImplementation((_, cb: any) => cb());

    const newMode: Mode = {
      id: 'custom_1',
      name: 'My Mode',
      description: 'Desc',
      category: 'L3_Deep',
      prompts: ['Test'],
      tags: []
    };

    await StorageService.addCustomMode(newMode);

    expect(mockStorage.local.set).toHaveBeenCalledWith(
      expect.objectContaining({
        customModes: expect.arrayContaining([
          expect.objectContaining({ id: 'custom_1', isCustom: true })
        ])
      }),
      expect.any(Function)
    );
  });

  it('should manage history (LRU-like)', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockStorage.local.get.mockImplementation((_, cb: any) => cb({
      history: ['A', 'B']
    }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockStorage.local.set.mockImplementation((_, cb: any) => cb());

    await StorageService.addToHistory('C'); // Add new
    await StorageService.addToHistory('B'); // Move to top

    // First call: Add C -> [C, A, B]
    // Second call: Add B -> [B, C, A]
    // Since we mock get() to always return ['A', 'B'], the logic flow in test is slightly different
    // unless we statefully mock. Let's just check the single call logic.
    
    // Reset for single call verification
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockStorage.local.get.mockImplementation((_, cb: any) => cb({
      history: ['A', 'B']
    }));
    await StorageService.addToHistory('A');
    
    expect(mockStorage.local.set).toHaveBeenCalledWith(
      { history: ['A', 'B'] }, // A moves to front (was already front)
      expect.any(Function)
    );
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mockStorage.local.get.mockImplementation((_, cb: any) => cb({
        history: ['A', 'B']
    }));
    await StorageService.addToHistory('C');
    expect(mockStorage.local.set).toHaveBeenCalledWith(
        { history: ['C', 'A', 'B'] },
        expect.any(Function)
    );
  });
});
