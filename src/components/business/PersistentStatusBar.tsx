import * as React from 'react';
import { X, Layers } from 'lucide-react';
import { useModeStore } from '../../store/modeStore';
import { useUIStore } from '../../store/uiStore';
import { Button } from '../ui/button';
import { i18n } from '../../core/i18n';

/**
 * 持久化状态栏
 * 显示当前激活的持久化模式，并提供快速取消入口。
 */
export function PersistentStatusBar() {
  const { persistentModeId, modes, setPersistentMode } = useModeStore();
  const { showToast } = useUIStore();

  const persistentMode = React.useMemo(() => 
    modes.find(m => m.id === persistentModeId),
    [modes, persistentModeId]
  );

  if (!persistentModeId || !persistentMode) return null;

  const handleDeactivate = () => {
    setPersistentMode(null);
    showToast(i18n.t('persistent.deactivated'), 'info');
  };

  return (
    <div className="flex items-center justify-between border-b border-border-default bg-brand-primary/10 px-page py-2 text-sm text-brand-primary">
      <div className="flex items-center gap-2">
        <Layers className="h-4 w-4" />
        <span className="font-medium">
          {i18n.t('persistent.label')}: <span className="font-bold">{persistentMode.name}</span>
        </span>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-brand-primary hover:bg-brand-primary/20 hover:text-brand-primary"
        onClick={handleDeactivate}
        title={i18n.t('persistent.deactivate')}
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}
