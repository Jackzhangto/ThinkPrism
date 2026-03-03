import * as React from 'react';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';
import { Sparkles } from 'lucide-react';
import { DebugLogger } from '../../core/DebugLogger';
import { useModeStore } from '../../store/modeStore';

const SCENARIOS = [
  { id: 'product', label: '产品', icon: '🛠️' },
  { id: 'code', label: '代码', icon: '🛡️' },
  { id: 'decision', label: '决策', icon: '🧭' },
  { id: 'learning', label: '学习', icon: '🎓' },
];

/**
 * 场景推荐组件
 * 展示常用场景标签，点击可过滤或触发相关模式（待实现）。
 */
export function SceneRecommender() {
  const { activeScenario, setActiveScenario } = useModeStore();

  const handleScenarioClick = (id: string) => {
    const scenario = SCENARIOS.find(s => s.id === id);
    if (!scenario) return;

    // Check if this scenario is currently active
    // We compare labels because store stores the label for filtering
    const isActive = activeScenario === scenario.label;
    
    if (isActive) {
      setActiveScenario(null);
      DebugLogger.info('Cleared scenario');
    } else {
      setActiveScenario(scenario.label);
      DebugLogger.info('Selected scenario:', scenario.label);
    }
  };

  return (
    <div className="flex flex-col space-y-2 p-page">
      <div className="flex items-center gap-2 text-xs font-medium text-text-secondary">
        <Sparkles className="h-3 w-3 text-brand-primary" />
        <span>推荐场景</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {SCENARIOS.map((scenario) => (
          <Badge
            key={scenario.id}
            variant={activeScenario === scenario.label ? 'default' : 'outline'}
            className={cn(
              "cursor-pointer whitespace-nowrap px-3 py-1 transition-all hover:bg-brand-hover hover:text-white",
              activeScenario === scenario.label ? "bg-brand-primary text-white border-transparent" : "bg-bg-panel text-text-secondary border-border-default"
            )}
            onClick={() => handleScenarioClick(scenario.id)}
          >
            <span className="mr-1">{scenario.icon}</span>
            {scenario.label}
          </Badge>
        ))}
      </div>
    </div>
  );
}
