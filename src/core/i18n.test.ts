import { describe, it, expect, beforeEach } from 'vitest';
import { I18nService } from './i18n';

describe('I18nService', () => {
  let i18n: I18nService;

  beforeEach(() => {
    // Reset singleton state if possible or get instance
    i18n = I18nService.getInstance();
    i18n.setLocale('en'); // Reset to default
  });

  it('should translate simple keys', () => {
    expect(i18n.t('app.name')).toBe('ThinkPrism');
  });

  it('should switch locales', () => {
    i18n.setLocale('zh');
    expect(i18n.t('modes.categories.L1_Micro')).toBe('极速(L1)');
    i18n.setLocale('en');
    expect(i18n.t('modes.categories.L1_Micro')).toBe('Micro(L1)');
  });

  it('should handle nested keys', () => {
    expect(i18n.t('modes.summarize.name')).toBe('Summarize');
  });

  it('should return key if missing', () => {
    const missingKey = 'non.existent.key';
    expect(i18n.t(missingKey)).toBe(missingKey);
  });
  
  // Note: Current simple implementation might not support params yet, 
  // but let's test if we add it or just verify basic behavior first.
  // The implementation I wrote DOES support params.
  // Let's create a mock translation with params to test it properly 
  // OR rely on existing keys if any have params. 
  // Currently en.json doesn't have params. 
  // I will rely on the implementation logic being correct for now 
  // or I could mock the translations object if I exposed it, but it's private.
  // I'll skip params test for now as no keys use it yet.
});
