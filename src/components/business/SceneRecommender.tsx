import * as React from 'react';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { Sparkles, PlusCircle } from 'lucide-react';
import { DebugLogger } from '../../core/DebugLogger';
import { useModeStore } from '../../store/modeStore';
import { DEFAULT_SCENARIOS } from '../../core/constants';
import { i18n } from '../../core/i18n';

/**
 * 场景推荐组件
 * 展示常用场景标签，点击可过滤或触发相关模式。
 */
export function SceneRecommender() {
  const { activeScenario, setActiveScenario, customScenarios } = useModeStore();
  
  const allScenarios = React.useMemo(() => {
    return [...DEFAULT_SCENARIOS, ...customScenarios];
  }, [customScenarios]);

  const handleScenarioClick = (id: string) => {
    const scenario = allScenarios.find(s => s.id === id);
    if (!scenario) return;

    // Check if this scenario is currently active
    // We compare ids because store stores the id for filtering
    const isActive = activeScenario === scenario.id;
    
    if (isActive) {
      setActiveScenario(null);
      DebugLogger.info('Cleared scenario');
    } else {
      setActiveScenario(scenario.id);
      DebugLogger.info('Selected scenario:', scenario.id);
    }
  };

  const handleOpenSettings = () => {
    if (chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open('options.html', '_blank');
    }
  };

  return (
    <div className="flex flex-col space-y-2 p-page">
      <div className="flex items-center justify-between text-xs font-medium text-text-secondary">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3 w-3 text-brand-primary" />
          <span>{i18n.t('scenes.recommend')}</span>
        </div>
        <button 
          onClick={handleOpenSettings}
          className="text-text-hint hover:text-brand-primary transition-colors flex items-center gap-1"
          title={i18n.t('scenes.manageScenarios')}
        >
          <PlusCircle className="h-3 w-3" />
          <span className="text-[10px]">{i18n.t('scenes.add')}</span>
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <Badge
          key="all"
          variant={!activeScenario ? 'default' : 'outline'}
          className={cn(
            "cursor-pointer whitespace-nowrap px-3 py-1 transition-all hover:bg-brand-hover hover:text-white shrink-0",
            !activeScenario ? "bg-brand-primary text-white border-transparent" : "bg-bg-panel text-text-secondary border-border-default"
          )}
          onClick={() => setActiveScenario(null)}
        >
          <span className="mr-1">🏠</span>
          {i18n.t('scenes.all')}
        </Badge>
        {allScenarios.map((scenario) => (
          <Badge
            key={scenario.id}
            variant={activeScenario === scenario.id ? 'default' : 'outline'}
            className={cn(
              "cursor-pointer whitespace-nowrap px-3 py-1 transition-all hover:bg-brand-hover hover:text-white shrink-0",
              activeScenario === scenario.id ? "bg-brand-primary text-white border-transparent" : "bg-bg-panel text-text-secondary border-border-default",
              scenario.isCustom && "border-brand-primary border-dashed"
            )}
            onClick={() => handleScenarioClick(scenario.id)}
          >
            <span className="mr-1">{scenario.icon}</span>
            {scenario.isCustom ? scenario.label : i18n.t(`scenes.${scenario.id}` as 'scenes.product')}
          </Badge>
        ))}
      </div>
    </div>
  );
}
