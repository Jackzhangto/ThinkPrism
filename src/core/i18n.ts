import en from '../locales/en.json';
import zh from '../locales/zh.json';
import { DebugLogger } from './DebugLogger';

export type Locale = 'en' | 'zh';
export type TranslationKey = string; // In a real app, we might use template literal types for nested keys

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const translations: Record<Locale, any> = {
  en,
  zh,
};

/**
 * 国际化服务类 (单例)
 * 负责管理当前语言环境和提供翻译功能。
 */
export class I18nService {
  private static instance: I18nService;
  private currentLocale: Locale = 'zh';

  /**
   * 私有构造函数，防止直接实例化。
   */
  private constructor() {}

  /**
   * 获取 I18nService 单例实例。
   * @returns I18nService 实例
   */
  public static getInstance(): I18nService {
    if (!I18nService.instance) {
      I18nService.instance = new I18nService();
    }
    return I18nService.instance;
  }

  /**
   * 设置当前语言环境。
   * @param locale 目标语言代码 ('en' | 'zh')
   */
  public setLocale(locale: Locale): void {
    if (translations[locale]) {
      this.currentLocale = locale;
    } else {
      DebugLogger.warn(`Locale ${locale} not supported, falling back to en`);
      this.currentLocale = 'en';
    }
  }

  /**
   * 获取当前语言环境。
   * @returns 当前语言代码
   */
  public getLocale(): Locale {
    return this.currentLocale;
  }

  /**
   * 获取翻译文本。
   * 支持嵌套键 (e.g. 'common.ok') 和参数替换 (e.g. 'Hello {name}').
   * 
   * @param key 翻译键
   * @param params 可选参数对象
   * @returns 翻译后的字符串，如果未找到则返回 key
   */
  public t(key: TranslationKey, params?: Record<string, string>): string {
    const keys = key.split('.');
    let value = translations[this.currentLocale];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        DebugLogger.warn(`Translation key missing: ${key} for locale ${this.currentLocale}`);
        return key;
      }
    }

    if (typeof value !== 'string') {
        DebugLogger.warn(`Translation key is not a string: ${key} for locale ${this.currentLocale}`);
        return key;
    }

    if (params) {
      return value.replace(/\{(\w+)\}/g, (_, k) => params[k] || `{${k}}`);
    }

    return value;
  }
}

export const i18n = I18nService.getInstance();
