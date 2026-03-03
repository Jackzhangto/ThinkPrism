import { DebugLogger } from '../core/DebugLogger';
import { InjectionService } from '../core/InjectionService';

// 监听来自 Popup 或 Background 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  DebugLogger.info('Content Script received message:', request);

  if (request.action === 'GET_SELECTION') {
    const selection = InjectionService.getSelection();
    sendResponse({ text: selection });
    return true;
  }

  if (request.action === 'REPLACE_SELECTION') {
    const success = InjectionService.replaceSelection(request.text);
    sendResponse({ success });
    return true;
  }

  return true; // Keep channel open for async response
});

DebugLogger.info('ThinkPrism Content Script initialized');
