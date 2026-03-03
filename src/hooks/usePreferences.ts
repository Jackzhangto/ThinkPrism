import { useState, useEffect } from 'react';
import { StorageService } from '../core/StorageService';
import { UserPreferences } from '../core/types';
import { DebugLogger } from '../core/DebugLogger';

/**
 * 偏好设置 Hook
 * 提供读取和更新用户偏好设置的功能。
 */
export function usePreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'system',
    language: 'zh',
    autoInject: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const data = await StorageService.get();
      setPreferences(data.preferences);
    } catch (error) {
      DebugLogger.error('Failed to load preferences', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePreference = async <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    try {
      const newPreferences = { ...preferences, [key]: value };
      setPreferences(newPreferences);
      await StorageService.updatePreferences({ [key]: value });
    } catch (error) {
      DebugLogger.error('Failed to update preference', error);
      // Revert on error
      loadPreferences();
    }
  };

  return {
    preferences,
    loading,
    updatePreference,
    reload: loadPreferences,
  };
}
