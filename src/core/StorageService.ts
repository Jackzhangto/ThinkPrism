import { StorageSchema, UserPreferences, Mode, Scenario } from './types';
import { DebugLogger } from './DebugLogger';

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  language: 'zh', // Updated to default to Chinese
  autoInject: false
};

const DEFAULT_STORAGE: StorageSchema = {
  preferences: DEFAULT_PREFERENCES,
  customModes: [],
  customScenarios: [],
  history: []
};

/**
 * 存储服务类
 * 负责管理 Chrome Storage 和 LocalStorage (降级方案) 的读写操作。
 * 实现了单例模式 (虽然目前是静态方法集合，但作为服务层应视为单例)。
 */
export class StorageService {
  /**
   * 获取所有存储数据。
   * 如果在非扩展环境下，将回退到 LocalStorage。
   * 
   * @param key Optional specific key to retrieve
   * @returns {Promise<StorageSchema>} 返回完整的存储数据对象
   */
  public static async get(): Promise<StorageSchema> {
    if (typeof chrome === 'undefined' || !chrome.storage) {
      DebugLogger.warn('Chrome storage not available, using LocalStorage fallback.');
      return this.loadFromLocalStorage();
    }

    return new Promise((resolve) => {
      chrome.storage.local.get(null, (items) => {
        const data = items as Partial<StorageSchema>;
        DebugLogger.info('Storage loaded', data);
        resolve({
          preferences: { ...DEFAULT_PREFERENCES, ...data.preferences },
          customModes: data.customModes || [],
          customScenarios: data.customScenarios || [],
          history: data.history || []
        });
      });
    });
  }

  /**
   * 保存部分数据到存储。
   * 
   * @param {Partial<StorageSchema>} data 要保存的数据片段
   * @returns {Promise<void>} Promise
   */
  public static async set(data: Partial<StorageSchema>): Promise<void> {
    if (typeof chrome === 'undefined' || !chrome.storage) {
      this.saveToLocalStorage(data);
      return;
    }

    return new Promise((resolve) => {
      chrome.storage.local.set(data, () => {
        DebugLogger.info('Storage saved', data);
        resolve();
      });
    });
  }

  /**
   * 更新用户偏好设置。
   * 
   * @param {Partial<UserPreferences>} prefs 要更新的偏好设置字段
   * @returns {Promise<void>} Promise
   */
  public static async updatePreferences(prefs: Partial<UserPreferences>): Promise<void> {
    const current = await this.get();
    await this.set({
      preferences: { ...current.preferences, ...prefs }
    });
  }

  /**
   * 添加自定义模式。
   * 
   * @param {Mode} mode 要添加的模式对象
   * @returns {Promise<void>} Promise
   */
  public static async addCustomMode(mode: Mode): Promise<void> {
    const current = await this.get();
    await this.set({
      customModes: [...current.customModes, { ...mode, isCustom: true }]
    });
  }

  /**
   * 添加模式 ID 到历史记录。
   * 保持最近 10 条记录。
   * 
   * @param {string} modeId 模式 ID
   * @returns {Promise<void>} Promise
   */
  public static async addToHistory(modeId: string): Promise<void> {
    const current = await this.get();
    const newHistory = [modeId, ...current.history.filter(id => id !== modeId)].slice(0, 10); // Keep last 10
    await this.set({ history: newHistory });
  }

  /**
   * 添加自定义场景。
   * 
   * @param {Scenario} scenario 要添加的场景对象
   * @returns {Promise<void>} Promise
   */
  public static async addCustomScenario(scenario: Scenario): Promise<void> {
    const current = await this.get();
    await this.set({
      customScenarios: [...current.customScenarios, { ...scenario, isCustom: true }]
    });
  }

  /**
   * 删除自定义场景。
   * 
   * @param {string} scenarioId 要删除的场景 ID
   * @returns {Promise<void>} Promise
   */
  public static async removeCustomScenario(scenarioId: string): Promise<void> {
    const current = await this.get();
    await this.set({
      customScenarios: current.customScenarios.filter(s => s.id !== scenarioId)
    });
  }

  /**
   * 删除自定义模式。
   * 
   * @param {string} modeId 要删除的模式 ID
   * @returns {Promise<void>} Promise
   */
  public static async removeCustomMode(modeId: string): Promise<void> {
    const current = await this.get();
    await this.set({
      customModes: current.customModes.filter(m => m.id !== modeId)
    });
  }

  // --- LocalStorage Fallback for Development ---

  private static STORAGE_KEY = 'thinkprism_dev_storage';

  /**
   * 从 LocalStorage 加载数据 (仅开发用)。
   * 
   * @returns {StorageSchema} 存储数据
   */
  private static loadFromLocalStorage(): StorageSchema {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return DEFAULT_STORAGE;
      const parsed = JSON.parse(raw);
      return {
        preferences: { ...DEFAULT_PREFERENCES, ...parsed.preferences },
        customModes: parsed.customModes || [],
        customScenarios: parsed.customScenarios || [],
        history: parsed.history || []
      };
    } catch (e) {
      DebugLogger.error('Failed to load from LocalStorage', e);
      return DEFAULT_STORAGE;
    }
  }

  /**
   * 保存数据到 LocalStorage (仅开发用)。
   * 
   * @param {Partial<StorageSchema>} data 数据片段
   */
  private static saveToLocalStorage(data: Partial<StorageSchema>): void {
    const current = this.loadFromLocalStorage();
    const updated = { ...current, ...data };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    DebugLogger.info('Saved to LocalStorage', updated);
  }
}
