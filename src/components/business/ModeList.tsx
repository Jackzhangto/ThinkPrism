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
import { i18n } from '../../core/i18n';

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
        showToast(i18n.t('toast.modeNoPrompt'), 'error');
        return;
      }

      let instruction = InstructionBuilder.build(promptTemplate, {
        selection: selection || '',
        text: selection || '' // Support both {{selection}} and {{text}}
      });
      // 若模板未包含占位符，将用户选中/输入内容追加到指令末尾，保证注入和提交的是一整段
      const hasPlaceholder = /\{\{(?:selection|text)\}\}/.test(promptTemplate);
      if (!hasPlaceholder && (selection || '').trim()) {
        instruction = instruction.trimEnd() + '\n\n' + selection.trim();
      }

      // 3. Apply mode based on user preference
      if (preferences.autoInject) {
        // Auto-inject enabled: Try to insert text directly
        // User Request: In injection mode, also copy the prompt to clipboard.
        await navigator.clipboard.writeText(instruction);

        let success = false;
        try {
          success = await ContentBridge.replaceSelection(instruction, { replaceEntire: true });
        } catch (e) {
          DebugLogger.warn('Auto-injection failed', e);
          success = false;
        }
        
        if (success) {
          showToast(i18n.t('toast.modeApplied', { name: mode.name }), 'success');
        } else {
          // Fallback: Copy to clipboard if injection fails (already copied above)
          showToast(i18n.t('toast.injectFailedCopy'), 'warning');
        }
      } else {
        // Auto-inject disabled: Only copy to clipboard
        await navigator.clipboard.writeText(instruction);
        showToast(i18n.t('toast.instructionCopied', { name: mode.name }), 'success');
      }

    } catch (error) {
      DebugLogger.error('Failed to apply mode', error);
      showToast(i18n.t('toast.applyError'), 'error');
    } finally {
      setProcessingModeId(null);
    }
  };

  const categories: { id: ModeCategory | 'all' | 'custom'; labelKey: string }[] = [
    { id: 'all', labelKey: 'modes.tabAll' },
    { id: 'L1_Micro', labelKey: 'modes.tabMicro' },
    { id: 'L2_Combo', labelKey: 'modes.tabCombo' },
    { id: 'L3_Deep', labelKey: 'modes.tabDeep' },
    { id: 'custom', labelKey: 'modes.tabCustom' },
  ];

  const handleOpenSettings = () => {
    if (chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open('options.html', '_blank');
    }
  };

  return (
    <div className="flex flex-col space-y-4 p-page">
      {/* Search Bar - Only show when no scenario is active */}
      {!activeScenario && (
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-text-hint" />
          <Input
            placeholder={i18n.t('modes.search_placeholder')}
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
          onValueChange={(val) => setCategory(val as ModeCategory | 'all' | 'custom')}
          className="w-full"
        >
          <TabsList className="w-full grid grid-cols-5 bg-bg-panel p-1 rounded-lg">
            {categories.map((cat) => (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className="text-xs px-0.5"
              >
                {i18n.t(cat.labelKey)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* Mode Grid */}
      <div className="grid grid-cols-1 gap-3 pb-4">
        {selectedCategory === 'custom' && filteredModes.length > 0 && (
          <div className="flex justify-end px-1">
             <button 
                onClick={handleOpenSettings}
                className="text-xs text-brand-primary hover:underline flex items-center gap-1"
              >
                {i18n.t('modes.manageModes')}
              </button>
          </div>
        )}

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
            <p className="text-sm font-medium text-text-secondary">{i18n.t('modes.noResults')}</p>
            {selectedCategory === 'custom' ? (
              <div className="mt-3">
                 <p className="text-xs text-text-hint mb-2">{i18n.t('modes.noCustomModes')}</p>
                 <button 
                  onClick={handleOpenSettings}
                  className="px-4 py-2 bg-brand-primary text-white text-xs rounded-md hover:bg-brand-hover transition-colors"
                 >
                   {i18n.t('modes.addFirstMode')}
                 </button>
              </div>
            ) : (
              <p className="text-xs text-text-hint mt-1">{i18n.t('modes.tryOtherKeywords')}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
