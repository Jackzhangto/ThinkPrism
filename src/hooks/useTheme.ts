import { useState, useEffect } from 'react';
import { StorageService } from '../core/StorageService';
import { UserPreferences } from '../core/types';

type Theme = UserPreferences['theme'];

/**
 * Hook: 管理应用主题 (Light/Dark/System)
 * 
 * 1. 初始化时从 StorageService 读取设置。
 * 2. 监听变化并应用 'dark' 类到 document.documentElement。
 * 3. 提供 toggleTheme 方法。
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>('system');

  // Load theme from storage on mount
  useEffect(() => {
    StorageService.get().then((data) => {
      setTheme(data.preferences.theme || 'system');
    });
  }, []);

  // Apply theme class
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  // Listen for system theme changes if 'system' is selected
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const root = window.document.documentElement;
      if (root.classList.contains('dark') !== mediaQuery.matches) {
        root.classList.toggle('dark', mediaQuery.matches);
        root.classList.toggle('light', !mediaQuery.matches);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const updateTheme = async (newTheme: Theme) => {
    setTheme(newTheme);
    const current = await StorageService.get();
    await StorageService.set({
      preferences: { ...current.preferences, theme: newTheme }
    });
  };

  return { theme, setTheme: updateTheme };
}
