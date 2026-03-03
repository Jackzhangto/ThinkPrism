import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';
import { StorageService } from '../core/StorageService';
import { UserPreferences, Mode } from '../core/types';

// Mock StorageService
vi.mock('../core/StorageService', () => ({
  StorageService: {
    get: vi.fn(),
    updatePreferences: vi.fn(),
    addCustomMode: vi.fn(),
    removeCustomMode: vi.fn(),
  },
}));

// Mock DebugLogger to avoid console spam
vi.mock('../core/DebugLogger', () => ({
  DebugLogger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Options Page App', () => {
  const mockPreferences: UserPreferences = {
    theme: 'light',
    language: 'en',
    autoInject: true,
  };

  const mockCustomModes: Mode[] = [
    {
      id: 'custom_1',
      name: 'My Custom Mode',
      description: 'Test Description',
      category: 'L3_Deep',
      prompts: ['Test Prompt'],
      tags: ['test'],
      isCustom: true,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(StorageService.get).mockResolvedValue({
      preferences: mockPreferences,
      customModes: mockCustomModes,
      history: [],
    });
  });

  it('renders correctly and loads preferences', async () => {
    render(<App />);

    // Wait for loading to finish and header to appear
    await waitFor(() => {
      expect(screen.getByText('ThinkPrism 设置')).toBeDefined();
    });

    // Check if preferences are loaded (e.g., Auto Injection switch)
    expect(StorageService.get).toHaveBeenCalled();

    // Check tabs
    expect(screen.getByText('常规')).toBeDefined();
    expect(screen.getByText('自定义模式')).toBeDefined();
    expect(screen.getByText('关于')).toBeDefined();
  });

  it('updates preferences when switch is toggled', async () => {
    render(<App />);

    await waitFor(() => {
      expect(StorageService.get).toHaveBeenCalled();
    });

    // Find Auto Injection switch
    // The switch might not have a label associated via htmlFor, so we might need to find by role
    const switchElement = screen.getByRole('switch');
    expect(switchElement).toBeDefined();
    
    // Initial state should be checked (true)
    // Note: Radix UI switch uses data-state
    expect(switchElement.getAttribute('data-state')).toBe('checked');

    // Click to toggle
    fireEvent.click(switchElement);

    // Verify updatePreference was called
    await waitFor(() => {
      expect(StorageService.updatePreferences).toHaveBeenCalledWith({ autoInject: false });
    });
  });

  it('displays custom modes in the Custom Modes tab', async () => {
    render(<App />);

    await waitFor(() => {
      expect(StorageService.get).toHaveBeenCalled();
    });

    // Switch to Custom Modes tab
    const customModesTab = screen.getByText('自定义模式');
    fireEvent.click(customModesTab);

    // Should see the custom mode
    await waitFor(() => {
      expect(screen.getByText('My Custom Mode')).toBeDefined();
    });
  });
});
