export type ModeCategory = 'L1_Micro' | 'L2_Combo' | 'L3_Deep' | string;

export interface Mode {
  id: string;
  name: string; // Key for i18n
  description: string; // Key for i18n
  category: ModeCategory;
  prompts: string[];
  scenarioPrompts?: Record<string, string>;
  tags: string[];
  isCustom?: boolean;
}

export interface Scenario {
  id: string;
  label: string;
  icon: string;
  isCustom?: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'zh';
  autoInject: boolean;
}

export interface StorageSchema {
  preferences: UserPreferences;
  customModes: Mode[];
  customScenarios: Scenario[];
  history: string[]; // IDs of recently used modes
}

export type MessageAction = 'GET_SELECTION' | 'REPLACE_SELECTION';

export interface MessagePayload {
  action: MessageAction;
  text?: string;
}

export interface MessageResponse {
  text?: string;
  success?: boolean;
  error?: string;
}
