import * as React from 'react';
import { Search } from 'lucide-react';
import { useModeStore } from '../../store/modeStore';
import { useUIStore } from '../../store/uiStore';
import { usePreferences } from '../../hooks/usePreferences';
import { Mode, ModeCategory } from '../../core/types';
import { ModeItem } from './ModeItem';
import { Input } from '../ui/input';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';
import { DebugLogger } from '../../core/DebugLogger';
import { ContentBridge } from '../../core/ContentBridge';
import { InstructionBuilder } from '../../core/InstructionBuilder';

/**
 * 模式列表组件
 * 包含搜索、分类过滤和模式卡片展示。
 */
export function ModeList() {
  const { 
    filteredModes, 
    searchQuery, 
    selectedCategory, 
    setSearchQuery, 
    setCategory,
    activeScenario
  } = useModeStore();

  const { showToast } = useUIStore();
  const { preferences } = usePreferences();
  const [processingModeId, setProcessingModeId] = React.useState<string | null>(null);

  const handleSelectMode = async (mode: Mode) => {
    if (processingModeId) return; // Prevent multiple clicks
    
    setProcessingModeId(mode.id);
    DebugLogger.info('Selected mode:', mode.id);
    
    try {
      // 1. Get current selection from the active tab
      let selection = '';
      try {
        selection = await ContentBridge.getSelection();
      } catch (e) {
        DebugLogger.warn('Failed to get selection, proceeding with empty string', e);
      }

      // 2. Build the instruction using the prompt template
      // Prioritize scenario-specific prompt if a scenario is active
      let promptTemplate = mode.prompts[0];
      if (activeScenario && mode.scenarioPrompts && mode.scenarioPrompts[activeScenario]) {
        promptTemplate = mode.scenarioPrompts[activeScenario];
      }

      if (!promptTemplate) {
        showToast('该模式未定义 Prompt', 'error');
        return;
      }

      const instruction = InstructionBuilder.build(promptTemplate, {
        selection: selection || '',
        text: selection || '' // Support both {{selection}} and {{text}}
      });

      // 3. Apply mode based on user preference
      if (preferences.autoInject) {
        // Auto-inject enabled: Try to insert text directly
        // User Request: In injection mode, also copy the prompt to clipboard.
        await navigator.clipboard.writeText(instruction);

        let success = false;
        try {
          success = await ContentBridge.replaceSelection(instruction);
        } catch (e) {
          DebugLogger.warn('Auto-injection failed', e);
          success = false;
        }
        
        if (success) {
          showToast(`已应用模式: ${mode.name}`, 'success');
        } else {
          // Fallback: Copy to clipboard if injection fails (already copied above)
          showToast('注入失败，已复制到剪贴板。', 'warning');
        }
      } else {
        // Auto-inject disabled: Only copy to clipboard
        await navigator.clipboard.writeText(instruction);
        showToast(`已复制指令: ${mode.name}`, 'success');
      }

    } catch (error) {
      DebugLogger.error('Failed to apply mode', error);
      showToast('应用模式时发生错误。', 'error');
    } finally {
      setProcessingModeId(null);
    }
  };

  const categories: { id: ModeCategory | 'all'; label: string }[] = [
    { id: 'all', label: '全部' },
    { id: 'L1_Micro', label: '极速(L1)' },
    { id: 'L2_Combo', label: '剧本(L2)' },
    { id: 'L3_Deep', label: '百科(L3)' },
  ];

  return (
    <div className="flex flex-col space-y-4 p-page">
      {/* Search Bar - Only show when no scenario is active */}
      {!activeScenario && (
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-hint" />
          <Input
            placeholder="搜索模式..."
            className="pl-9 h-9 bg-bg-panel border-transparent focus:bg-bg-page focus:border-brand-primary/50 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {/* Category Tabs - Only show when no scenario is active */}
      {!activeScenario && (
        <Tabs 
          defaultValue="all"
          value={selectedCategory} 
          onValueChange={(val) => setCategory(val as ModeCategory | 'all')}
          className="w-full"
        >
          <TabsList className="w-full grid grid-cols-4 bg-bg-panel p-1 rounded-lg">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className="text-xs px-1"
              >
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* Mode Grid */}
      <div className="grid grid-cols-1 gap-3 pb-4">
        {filteredModes.length > 0 ? (
          filteredModes.map((mode) => (
            <ModeItem 
              key={mode.id} 
              mode={mode} 
              onSelect={handleSelectMode}
              isLoading={processingModeId === mode.id}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="rounded-full bg-bg-panel p-3 mb-2">
              <Search className="h-6 w-6 text-text-hint" />
            </div>
            <p className="text-sm font-medium text-text-secondary">未找到相关模式</p>
            <p className="text-xs text-text-hint mt-1">请尝试其他关键词或分类</p>
          </div>
        )}
      </div>
    </div>
  );
}
