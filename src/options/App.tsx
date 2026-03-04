import React, { useCallback, useMemo, useEffect } from 'react';
import { usePreferences } from '../hooks/usePreferences';
import { i18n } from '../core/i18n';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { DebugLogger } from '../core/DebugLogger';
import { StorageService } from '../core/StorageService';
import { Mode, Scenario } from '../core/types';
import { DEFAULT_SCENARIOS } from '../core/constants';
import { Trash2, Plus, Command } from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * 选项页面应用组件
 * 管理用户偏好设置和自定义模式。
 */
function App() {
  const { preferences, loading, updatePreference } = usePreferences();
  const [customModes, setCustomModes] = React.useState<Mode[]>([]);
  const [customScenarios, setCustomScenarios] = React.useState<Scenario[]>([]);

  // Add Mode Form State
  const [newModeName, setNewModeName] = React.useState('');
  const [newModeDesc, setNewModeDesc] = React.useState('');
  const [newModePrompt, setNewModePrompt] = React.useState('');
  const [newModeScenarios, setNewModeScenarios] = React.useState<string[]>([]);
  
  // Add Scenario Form State
  const [newScenarioLabel, setNewScenarioLabel] = React.useState('');
  const [newScenarioIcon, setNewScenarioIcon] = React.useState('');

  const loadData = useCallback(async () => {
    try {
      const data = await StorageService.get();
      setCustomModes(data.customModes || []);
      setCustomScenarios(data.customScenarios || []);
    } catch (error) {
      DebugLogger.error('Failed to load data', error);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    i18n.setLocale(preferences.language);
  }, [preferences.language]);

  // --- Scenario Actions ---

  const handleAddScenario = async () => {
    if (!newScenarioLabel.trim() || !newScenarioIcon.trim()) return;

    const newScenario: Scenario = {
      id: `custom_scene_${Date.now()}`,
      label: newScenarioLabel,
      icon: newScenarioIcon,
      isCustom: true,
    };

    try {
      await StorageService.addCustomScenario(newScenario);
      setCustomScenarios([...customScenarios, newScenario]);
      setNewScenarioLabel('');
      setNewScenarioIcon('');
    } catch (error) {
      DebugLogger.error('Failed to add custom scenario', error);
    }
  };

  const handleDeleteScenario = async (id: string) => {
    if (!confirm(i18n.t('options.confirmDeleteScenario'))) return;
    try {
      await StorageService.removeCustomScenario(id);
      setCustomScenarios(customScenarios.filter(s => s.id !== id));
    } catch (error) {
      DebugLogger.error('Failed to delete custom scenario', error);
    }
  };

  // --- Mode Actions ---

  const handleAddMode = async () => {
    if (!newModeName.trim() || !newModePrompt.trim()) return;

    const newMode: Mode = {
      id: `custom_mode_${Date.now()}`,
      name: newModeName,
      description: newModeDesc || i18n.t('options.customModeDefaultDesc'),
      category: 'L3_Deep', // Default to Deep for custom modes
      prompts: [newModePrompt],
      tags: ['自定义', ...newModeScenarios], // Tags link to scenario IDs
      isCustom: true,
    };

    try {
      await StorageService.addCustomMode(newMode);
      setCustomModes([...customModes, newMode]);
      // Reset form
      setNewModeName('');
      setNewModeDesc('');
      setNewModePrompt('');
      setNewModeScenarios([]);
    } catch (error) {
      DebugLogger.error('Failed to add custom mode', error);
    }
  };

  const handleDeleteMode = async (id: string) => {
    if (!confirm(i18n.t('options.confirmDeleteMode'))) return;
    try {
      await StorageService.removeCustomMode(id);
      setCustomModes(customModes.filter(m => m.id !== id));
    } catch (error) {
      DebugLogger.error('Failed to delete custom mode', error);
    }
  };

  const toggleScenarioSelection = (scenarioId: string) => {
    setNewModeScenarios(prev => 
      prev.includes(scenarioId) 
        ? prev.filter(id => id !== scenarioId)
        : [...prev, scenarioId]
    );
  };

  const allScenarios = useMemo(() => [...DEFAULT_SCENARIOS, ...customScenarios], [customScenarios]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-text-secondary">{i18n.t('options.loading')}</div>;
  }

  return (
    <div className="min-h-screen bg-bg-page p-8 text-text-primary">
      <div key={preferences.language} className="mx-auto max-w-5xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-brand-primary">{i18n.t('options.title')}</h1>
            <p className="text-text-secondary mt-1">{i18n.t('options.subtitle')}</p>
          </div>
        </div>

        <Tabs defaultValue="modes" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="modes">{i18n.t('options.tabModes')}</TabsTrigger>
            <TabsTrigger value="scenarios">{i18n.t('options.tabScenarios')}</TabsTrigger>
            <TabsTrigger value="general">{i18n.t('options.tabGeneral')}</TabsTrigger>
            <TabsTrigger value="about">{i18n.t('options.tabAbout')}</TabsTrigger>
          </TabsList>

          {/* --- Custom Modes Tab --- */}
          <TabsContent value="modes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{i18n.t('options.addModeTitle')}</CardTitle>
                <CardDescription>{i18n.t('options.addModeDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{i18n.t('options.modeName')}</label>
                    <Input 
                      placeholder={i18n.t('options.modeNamePlaceholder')} 
                      value={newModeName}
                      onChange={(e) => setNewModeName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{i18n.t('options.modeDesc')}</label>
                    <Input 
                      placeholder={i18n.t('options.modeDescPlaceholder')} 
                      value={newModeDesc}
                      onChange={(e) => setNewModeDesc(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">{i18n.t('options.modePrompt')}</label>
                  <textarea 
                    className="flex min-h-[100px] w-full rounded-md border border-border-default bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-text-hint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={i18n.t('options.modePromptPlaceholder')}
                    value={newModePrompt}
                    onChange={(e) => setNewModePrompt(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">{i18n.t('options.modeScenarios')}</label>
                  <div className="flex flex-wrap gap-2">
                    {allScenarios.map(scenario => (
                      <Badge
                        key={scenario.id}
                        variant={newModeScenarios.includes(scenario.id) ? 'default' : 'outline'}
                        className={cn(
                          "cursor-pointer px-3 py-1 hover:bg-brand-hover hover:text-white transition-colors",
                          newModeScenarios.includes(scenario.id) ? "bg-brand-primary" : "text-text-secondary"
                        )}
                        onClick={() => toggleScenarioSelection(scenario.id)}
                      >
                        <span className="mr-1">{scenario.icon}</span>
                        {scenario.label}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleAddMode} disabled={!newModeName || !newModePrompt}>
                  <Plus className="mr-2 h-4 w-4" /> {i18n.t('options.addMode')}
                </Button>
              </CardFooter>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {customModes.map((mode) => (
                <Card key={mode.id} className="relative group hover:border-brand-primary transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base font-medium flex items-center gap-2">
                        <Command className="h-4 w-4 text-brand-primary" />
                        {mode.name}
                      </CardTitle>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 text-text-hint hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteMode(mode.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardDescription className="line-clamp-2 text-xs">{mode.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {mode.tags.filter(t => t !== i18n.t('options.custom') && t !== '自定义').map((tag) => {
                        const scenario = allScenarios.find(s => s.id === tag);
                        return scenario ? (
                          <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                            {scenario.icon} {scenario.isCustom ? scenario.label : i18n.t(`scenes.${scenario.id}` as 'scenes.product')}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {customModes.length === 0 && (
                <div className="col-span-full flex h-32 items-center justify-center rounded-lg border border-dashed text-text-hint text-sm">
                  {i18n.t('options.noCustomModesYet')}
                </div>
              )}
            </div>
          </TabsContent>

          {/* --- Custom Scenarios Tab --- */}
          <TabsContent value="scenarios" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{i18n.t('options.addScenarioTitle')}</CardTitle>
                <CardDescription>{i18n.t('options.addScenarioDescription')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-4">
                  <div className="space-y-2 flex-1">
                    <label className="text-sm font-medium">{i18n.t('options.scenarioName')}</label>
                    <Input 
                      placeholder={i18n.t('options.scenarioNamePlaceholder')} 
                      value={newScenarioLabel}
                      onChange={(e) => setNewScenarioLabel(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 w-24">
                    <label className="text-sm font-medium">{i18n.t('options.scenarioIcon')}</label>
                    <Input 
                      placeholder="✍️" 
                      className="text-center"
                      value={newScenarioIcon}
                      onChange={(e) => setNewScenarioIcon(e.target.value)}
                      maxLength={2}
                    />
                  </div>
                  <Button onClick={handleAddScenario} disabled={!newScenarioLabel || !newScenarioIcon}>
                    <Plus className="mr-2 h-4 w-4" /> {i18n.t('scenes.add')}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
              {DEFAULT_SCENARIOS.map((scenario) => (
                <Card key={scenario.id} className="opacity-75 bg-bg-panel/50 border-border-default">
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-2">
                    <span className="text-2xl filter grayscale opacity-70">{scenario.icon}</span>
                    <span className="font-medium text-sm text-text-secondary">{i18n.t(`scenes.${scenario.id}` as 'scenes.product')}</span>
                    <Badge variant="outline" className="text-[10px] scale-90">{i18n.t('options.systemDefault')}</Badge>
                  </CardContent>
                </Card>
              ))}
              {customScenarios.map((scenario) => (
                <Card key={scenario.id} className="relative group hover:border-brand-primary transition-colors cursor-pointer">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-text-hint hover:text-red-500"
                      onClick={() => handleDeleteScenario(scenario.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-2">
                    <span className="text-2xl">{scenario.icon}</span>
                    <span className="font-medium text-sm">{scenario.label}</span>
                    <Badge variant="secondary" className="text-[10px] scale-90 text-brand-primary bg-brand-primary/10">{i18n.t('options.custom')}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* --- General Settings Tab --- */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{i18n.t('options.preferencesTitle')}</CardTitle>
                <CardDescription>{i18n.t('options.preferencesDescription')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border-default p-4">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">{i18n.t('options.autoInject')}</label>
                    <p className="text-xs text-text-secondary">
                      {i18n.t('options.autoInjectDesc')}
                    </p>
                  </div>
                  <Switch
                    checked={preferences.autoInject}
                    onCheckedChange={(checked) => updatePreference('autoInject', checked)}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border-default p-4">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">{i18n.t('options.themeLabel')}</label>
                    <p className="text-xs text-text-secondary">
                      {i18n.t('options.themeDesc')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={preferences.theme === 'light' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updatePreference('theme', 'light')}
                    >
                      {i18n.t('options.light')}
                    </Button>
                    <Button
                      variant={preferences.theme === 'dark' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updatePreference('theme', 'dark')}
                    >
                      {i18n.t('options.dark')}
                    </Button>
                    <Button
                      variant={preferences.theme === 'system' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updatePreference('theme', 'system')}
                    >
                      {i18n.t('options.followSystem')}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border-default p-4">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">{i18n.t('options.languageLabel')}</label>
                    <p className="text-xs text-text-secondary">
                      {i18n.t('options.languageDesc')}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={preferences.language === 'en' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updatePreference('language', 'en')}
                    >
                      {i18n.t('options.languageEn')}
                    </Button>
                    <Button
                      variant={preferences.language === 'zh' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updatePreference('language', 'zh')}
                    >
                      {i18n.t('options.languageZh')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* --- About Tab --- */}
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>{i18n.t('options.aboutTitle')}</CardTitle>
                <CardDescription>{i18n.t('options.aboutVersion')}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {i18n.t('options.aboutDesc')}
                  <br /><br />
                  {i18n.t('options.aboutBy')}
                  <br />
                  {i18n.t('options.aboutFeatures')}
                  <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
                    <li>{i18n.t('options.aboutFeature1')}</li>
                    <li>{i18n.t('options.aboutFeature2')}</li>
                    <li>{i18n.t('options.aboutFeature3')}</li>
                    <li>{i18n.t('options.aboutFeature4')}</li>
                  </ul>
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;
