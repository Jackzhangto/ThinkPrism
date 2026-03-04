import * as React from 'react';
import { Settings, Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../ui/button';
import { i18n } from '../../core/i18n';

/**
 * 弹出窗口顶部栏组件
 * 包含 Logo、主题切换和设置入口。
 */
export function PopupHeader() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const renderThemeIcon = () => {
    if (theme === 'light') return <Sun className="h-4 w-4" />;
    if (theme === 'dark') return <Moon className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border-default bg-bg-page px-page shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-primary text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        <span className="text-lg font-bold text-text-primary">ThinkPrism</span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          title={`${i18n.t('ui.theme')}: ${theme === 'system' ? i18n.t('ui.themeSystem') : theme === 'light' ? i18n.t('ui.themeLight') : i18n.t('ui.themeDark')}`}
        >
          {renderThemeIcon()}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (chrome.runtime && chrome.runtime.openOptionsPage) {
              chrome.runtime.openOptionsPage();
            }
          }}
          title={i18n.t('ui.settings')}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
