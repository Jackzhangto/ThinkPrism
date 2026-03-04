import { DebugLogger } from './DebugLogger';

/**
 * 注入服务
 * 负责与页面 DOM 交互，执行文本读取和写入操作。
 */
export class InjectionService {
  /**
   * 设置 input/textarea 的 value 并尽量触发 React 等受控组件的状态同步，
   * 使提交时页面发送的与当前 DOM 显示一致。
   */
  private static setInputValueAndSync(
    el: HTMLInputElement | HTMLTextAreaElement,
    newValue: string
  ): void {
    const proto =
      el instanceof HTMLInputElement
        ? window.HTMLInputElement.prototype
        : window.HTMLTextAreaElement.prototype;
    const nativeSetter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
    if (nativeSetter) {
      nativeSetter.call(el, newValue);
    } else {
      el.value = newValue;
    }
    // 避免 React 受控组件因 _valueTracker 认为值未变化而忽略 input 事件
    const tracker = el as unknown as { _valueTracker?: { value: string } };
    if (tracker._valueTracker != null) {
      tracker._valueTracker.value = newValue;
    }
    el.dispatchEvent(new InputEvent('input', { bubbles: true, cancelable: true, inputType: 'insertText', data: null }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  /**
   * 获取当前选中的文本或激活输入框的值。
   */
  public static getSelection(): string {
    const activeElement = document.activeElement as HTMLElement;
    const selection = window.getSelection();

    // 1. 优先获取用户高亮的文本
    if (selection && selection.toString().length > 0) {
      return selection.toString();
    }

    // 2. 如果是输入框/文本域，获取其中的值
    if (
      activeElement &&
      (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement)
    ) {
      return activeElement.value;
    }

    // 3. 尝试获取 contenteditable 元素的内容
    if (activeElement && activeElement.isContentEditable) {
      return activeElement.innerText;
    }

    return '';
  }

  /**
   * 在页面中查找可能的主输入框（聊天框、评论框等），用于 Popup 打开后焦点不在输入框时的回退。
   */
  private static findMainInputElement(): HTMLTextAreaElement | HTMLInputElement | null {
    const textareas = document.querySelectorAll<HTMLTextAreaElement>('textarea');
    let best: HTMLTextAreaElement | null = null;
    let bestScore = 0;
    for (const el of textareas) {
      if (el.disabled || el.readOnly) continue;
      const style = window.getComputedStyle(el);
      if (style.visibility === 'hidden' || style.display === 'none') continue;
      const rect = el.getBoundingClientRect();
      if (rect.width < 50 || rect.height < 20) continue;
      const score = rect.height * rect.width;
      if (score > bestScore) {
        bestScore = score;
        best = el;
      }
    }
    if (best) return best;
    const inputs = document.querySelectorAll<HTMLInputElement>('input[type="text"], input:not([type])');
    for (const el of inputs) {
      if (el.disabled || el.readOnly) continue;
      const style = window.getComputedStyle(el);
      if (style.visibility === 'hidden' || style.display === 'none') continue;
      const rect = el.getBoundingClientRect();
      if (rect.width < 50 || rect.height < 10) continue;
      return el;
    }
    return null;
  }

  /**
   * 查找可能的主 contenteditable 输入区（部分 AI 对话页使用）。
   */
  private static findMainContentEditable(): HTMLElement | null {
    const candidates = document.querySelectorAll<HTMLElement>(
      '[contenteditable="true"][role="textbox"], [contenteditable="true"]'
    );
    let best: HTMLElement | null = null;
    let bestScore = 0;
    for (const el of candidates) {
      const style = window.getComputedStyle(el);
      if (style.visibility === 'hidden' || style.display === 'none') continue;
      const rect = el.getBoundingClientRect();
      if (rect.width < 80 || rect.height < 24) continue;
      const score = rect.height * rect.width;
      if (score > bestScore) {
        bestScore = score;
        best = el;
      }
    }
    return best;
  }

  /**
   * 向 contenteditable 元素写入全文并触发 input 事件。
   */
  private static setContentEditableValue(el: HTMLElement, text: string): void {
    el.focus();
    el.innerText = text;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }

  /**
   * 替换当前选中的文本或设置输入框的值。
   * @param text 要插入的文本
   * @param options.replaceEntire 为 true 时整段替换输入框内容，并尽量同步到 React 等受控组件，保证提交时发送完整内容
   */
  public static replaceSelection(text: string, options?: { replaceEntire?: boolean }): boolean {
    const activeElement = document.activeElement as HTMLElement;
    const selection = window.getSelection();
    const replaceEntire = options?.replaceEntire === true;

    try {
      // 1. 优先处理当前焦点的 Input/Textarea
      if (
        activeElement &&
        (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement)
      ) {
        const currentValue = activeElement.value;
        const newValue = replaceEntire
          ? text
          : (() => {
              const start = activeElement.selectionStart ?? 0;
              const end = activeElement.selectionEnd ?? 0;
              return currentValue.substring(0, start) + text + currentValue.substring(end);
            })();
        const newCursorPos = replaceEntire ? newValue.length : (activeElement.selectionStart ?? 0) + text.length;

        InjectionService.setInputValueAndSync(activeElement as HTMLInputElement | HTMLTextAreaElement, newValue);
        activeElement.setSelectionRange(newCursorPos, newCursorPos);
        activeElement.focus();
        return true;
      }

      // 2. replaceEntire 时若焦点不在输入框（如已切到 Popup），尝试查找页面主输入框或 contenteditable 并写入
      if (replaceEntire) {
        const fallbackInput = InjectionService.findMainInputElement();
        if (fallbackInput) {
          InjectionService.setInputValueAndSync(fallbackInput, text);
          fallbackInput.setSelectionRange(text.length, text.length);
          fallbackInput.focus();
          return true;
        }
        const fallbackEditable = InjectionService.findMainContentEditable();
        if (fallbackEditable) {
          InjectionService.setContentEditableValue(fallbackEditable, text);
          return true;
        }
      }

      // 3. 尝试使用 document.execCommand (作为 ContentEditable 的回退方案)
      if (document.queryCommandSupported('insertText')) {
        document.execCommand('insertText', false, text);
        return true;
      }

      // 4. 处理 ContentEditable (手动操作 DOM)
      if (activeElement && activeElement.isContentEditable && selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(text));
        
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
        activeElement.dispatchEvent(new Event('input', { bubbles: true }));
        return true;
      }

      // 5. 最后尝试：向主输入框或 contenteditable 追加
      const appendInput = InjectionService.findMainInputElement();
      if (appendInput) {
        const newValue = appendInput.value ? appendInput.value + '\n\n' + text : text;
        InjectionService.setInputValueAndSync(appendInput, newValue);
        appendInput.setSelectionRange(newValue.length, newValue.length);
        appendInput.focus();
        return true;
      }
      const appendEditable = InjectionService.findMainContentEditable();
      if (appendEditable) {
        const existing = appendEditable.innerText || '';
        InjectionService.setContentEditableValue(
          appendEditable,
          existing ? existing + '\n\n' + text : text
        );
        return true;
      }

      DebugLogger.warn('InjectionService: No suitable element found to insert text.');
      return false;

    } catch (error) {
      DebugLogger.error('InjectionService: Failed to replace selection', error);
      return false;
    }
  }
}
