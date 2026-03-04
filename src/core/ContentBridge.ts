import { DebugLogger } from './DebugLogger';
import { MessagePayload, MessageResponse } from './types';

/**
 * 内容桥接服务
 * 负责与 Content Script 通信，是 InjectionService 的客户端。
 */
export class ContentBridge {
  /**
   * 获取当前激活的标签页 ID
   */
  private static async getActiveTabId(): Promise<number | null> {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs && tabs.length > 0 && tabs[0].id) {
        return tabs[0].id;
      }
      return null;
    } catch (error) {
      DebugLogger.error('ContentBridge: Failed to query active tab', error);
      return null;
    }
  }

  /**
   * 向当前激活的标签页发送消息
   */
  private static async sendMessage(payload: MessagePayload): Promise<MessageResponse> {
    const tabId = await this.getActiveTabId();
    if (!tabId) {
      DebugLogger.warn('ContentBridge: No active tab found');
      return { error: 'No active tab found' };
    }

    try {
      return await chrome.tabs.sendMessage(tabId, payload);
    } catch (error) {
      DebugLogger.warn(`ContentBridge: Failed to send message ${payload.action}`, error);
      return { error: String(error) };
    }
  }

  /**
   * 获取当前选中的文本
   */
  public static async getSelection(): Promise<string> {
    const response = await this.sendMessage({ action: 'GET_SELECTION' });
    if (response.error) {
      throw new Error(response.error);
    }
    return response.text || '';
  }

  /**
   * 替换当前选中的文本（或整段替换输入框内容）。
   * @param replaceEntire 为 true 时用 text 整段替换输入框内容，确保提交时页面发送完整内容
   */
  public static async replaceSelection(text: string, options?: { replaceEntire?: boolean }): Promise<boolean> {
    const response = await this.sendMessage({
      action: 'REPLACE_SELECTION',
      text,
      replaceEntire: options?.replaceEntire
    });
    if (response.error) {
      throw new Error(response.error);
    }
    return response.success || false;
  }
}
