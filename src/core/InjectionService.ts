import { DebugLogger } from './DebugLogger';

/**
 * 注入服务
 * 负责与页面 DOM 交互，执行文本读取和写入操作。
 */
export class InjectionService {
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
   * 替换当前选中的文本或设置输入框的值。
   * @param text 要插入的文本
   */
  public static replaceSelection(text: string): boolean {
    const activeElement = document.activeElement as HTMLElement;
    const selection = window.getSelection();

    try {
      // 1. 优先处理 Input/Textarea (兼容 React/Vue 等框架)
      if (
        activeElement &&
        (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement)
      ) {
        const start = activeElement.selectionStart || 0;
        const end = activeElement.selectionEnd || 0;
        const currentValue = activeElement.value;
        const newValue = currentValue.substring(0, start) + text + currentValue.substring(end);
        
        // 尝试使用原生 Setter 以触发 React 的状态更新
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          Object.getPrototypeOf(activeElement),
          'value'
        )?.set;

        if (nativeInputValueSetter) {
          nativeInputValueSetter.call(activeElement, newValue);
        } else {
          activeElement.value = newValue;
        }
        
        // 恢复光标位置
        const newCursorPos = start + text.length;
        activeElement.setSelectionRange(newCursorPos, newCursorPos);
        
        // 触发 input 事件以通知框架
        activeElement.dispatchEvent(new Event('input', { bubbles: true }));
        
        // 确保元素重新获得焦点，防止输入法失效
        activeElement.focus();
        return true;
      }

      // 2. 尝试使用 document.execCommand (作为 ContentEditable 的回退方案)
      if (document.queryCommandSupported('insertText')) {
        document.execCommand('insertText', false, text);
        return true;
      }

      // 3. 处理 ContentEditable (手动操作 DOM)
      if (activeElement && activeElement.isContentEditable && selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(text));
        
        // 移动光标到末尾
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
        
        // 触发 input 事件
        activeElement.dispatchEvent(new Event('input', { bubbles: true }));
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
