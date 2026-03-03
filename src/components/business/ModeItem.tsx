import * as React from 'react';
import { Pin, Zap, Loader2 } from 'lucide-react';
import { Mode, ModeCategory } from '../../core/types';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { useModeStore } from '../../store/modeStore';
import { useUIStore } from '../../store/uiStore';

interface ModeItemProps {
  mode: Mode;
  isLoading?: boolean;
  onSelect: (mode: Mode) => void;
}

const CategoryColors: Record<ModeCategory, string> = {
  'L1_Micro': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  'L2_Combo': 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  'L3_Deep': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
};

const CategoryLabels: Record<ModeCategory, string> = {
  'L1_Micro': '极速',
  'L2_Combo': '剧本',
  'L3_Deep': '百科',
};

/**
 * 模式卡片组件
 * 展示单个模式的信息，支持固定/取消固定持久化模式。
 * 
 * @param mode 模式对象
 * @param onSelect 点击回调
 */
export function ModeItem({ mode, onSelect, isLoading = false }: ModeItemProps) {
  const { persistentModeId, setPersistentMode } = useModeStore();
  const { showToast } = useUIStore();
  const isPersistent = persistentModeId === mode.id;

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLoading) return; // Prevent pin action while loading

    if (isPersistent) {
      setPersistentMode(null);
      showToast(`已取消固定 ${mode.name}`, 'info');
    } else {
      setPersistentMode(mode.id);
      showToast(`已将 ${mode.name} 固定为持久模式`, 'success');
    }
  };

  return (
    <Card 
      className={cn(
        "group relative cursor-pointer transition-all hover:border-brand-primary hover:shadow-md",
        isPersistent && "border-brand-primary bg-brand-primary/5",
        isLoading && "opacity-80 cursor-wait pointer-events-none"
      )}
      onClick={() => !isLoading && onSelect(mode)}
    >
      <CardHeader className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-sm font-semibold text-text-primary group-hover:text-brand-primary">
              {mode.name}
            </CardTitle>
            <CardDescription className="line-clamp-2 text-xs text-text-secondary">
              {mode.description}
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge 
              variant="secondary" 
              className={cn("text-[10px] px-1.5 py-0 h-5 whitespace-nowrap", CategoryColors[mode.category])}
            >
              {CategoryLabels[mode.category]}
            </Badge>
          </div>
        </div>
        
        <div className="mt-2 flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {mode.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-[10px] text-text-hint">#{tag}</span>
            ))}
          </div>
          
          <div className={cn("flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100", isLoading && "opacity-100")}>
            {!isLoading && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-6 w-6", 
                  isPersistent ? "text-brand-primary opacity-100" : "text-text-secondary hover:text-brand-primary"
                )}
                onClick={handlePin}
                title={isPersistent ? "取消固定" : "固定为持久模式"}
              >
                <Pin className={cn("h-3.5 w-3.5", isPersistent && "fill-current")} />
              </Button>
            )}
            
            <Button
              variant="default"
              size="icon"
              className={cn("h-6 w-6 bg-brand-primary hover:bg-brand-hover", isLoading && "cursor-wait")}
              title={isLoading ? "处理中..." : "运行模式"}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Zap className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
