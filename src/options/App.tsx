import React, { useCallback } from 'react';
import { usePreferences } from '../hooks/usePreferences';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import { DebugLogger } from '../core/DebugLogger';
import { StorageService } from '../core/StorageService';
import { Mode } from '../core/types';

/**
 * 选项页面应用组件
 * 管理用户偏好设置和自定义模式。
 */
function App() {
  const { preferences, loading, updatePreference } = usePreferences();
  const [customModes, setCustomModes] = React.useState<Mode[]>([]);

  const loadCustomModes = useCallback(async () => {
    try {
      const data = await StorageService.get();
      setCustomModes(data.customModes || []);
    } catch (error) {
      DebugLogger.error('Failed to load custom modes', error);
    }
  }, []);

  React.useEffect(() => {
    loadCustomModes();
  }, [loadCustomModes]);

  const handleAddMode = async () => {
    // Placeholder for add mode dialog/form
    const newMode: Mode = {
      id: `custom_${Date.now()}`,
      name: '新自定义模式',
      description: '在此描述您的自定义模式',
      category: 'L3_Deep',
      prompts: ['分析这段文本...'],
      tags: ['自定义'],
      isCustom: true,
    };
    try {
      await StorageService.addCustomMode(newMode);
      setCustomModes([...customModes, newMode]);
    } catch (error) {
      DebugLogger.error('Failed to add custom mode', error);
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center">正在加载设置...</div>;
  }

  return (
    <div className="min-h-screen bg-bg-page p-8 text-text-primary">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ThinkPrism 设置</h1>
            <p className="text-text-secondary">管理您的偏好设置和自定义模式。</p>
          </div>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList>
            <TabsTrigger value="general">常规</TabsTrigger>
            <TabsTrigger value="modes">自定义模式</TabsTrigger>
            <TabsTrigger value="about">关于</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>偏好设置</CardTitle>
                <CardDescription>配置扩展行为。</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">自动注入内容脚本</label>
                    <p className="text-xs text-text-secondary">
                      在页面加载时自动注入内容脚本（如果权限允许）。
                    </p>
                  </div>
                  <Switch
                    checked={preferences.autoInject}
                    onCheckedChange={(checked) => updatePreference('autoInject', checked)}
                  />
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">主题</label>
                    <p className="text-xs text-text-secondary">
                      选择浅色、深色或跟随系统主题。
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={preferences.theme === 'light' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updatePreference('theme', 'light')}
                    >
                      浅色
                    </Button>
                    <Button
                      variant={preferences.theme === 'dark' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updatePreference('theme', 'dark')}
                    >
                      深色
                    </Button>
                    <Button
                      variant={preferences.theme === 'system' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updatePreference('theme', 'system')}
                    >
                      跟随系统
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">语言</label>
                    <p className="text-xs text-text-secondary">
                      界面和 Prompt 的首选语言。
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={preferences.language === 'en' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updatePreference('language', 'en')}
                    >
                      English
                    </Button>
                    <Button
                      variant={preferences.language === 'zh' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updatePreference('language', 'zh')}
                    >
                      中文
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="modes" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={handleAddMode}>添加自定义模式</Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {customModes.map((mode) => (
                <Card key={mode.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{mode.name}</CardTitle>
                      <Badge variant="outline">{mode.category}</Badge>
                    </div>
                    <CardDescription>{mode.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {mode.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {customModes.length === 0 && (
                <div className="col-span-2 flex h-32 items-center justify-center rounded-lg border border-dashed text-text-hint">
                  暂无自定义模式。创建一个试试吧！
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>关于 ThinkPrism</CardTitle>
                <CardDescription>版本 1.0.0</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-text-secondary">
                  ThinkPrism 是一款 AI 驱动的浏览器扩展，旨在增强您的阅读和写作体验。
                  <br /><br />
                  由 Trae AI Pair Programmer 创建。
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
