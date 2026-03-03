/**
 * DebugLogger: 统一的调试日志工具
 * 
 * 只有当 isDebug 为 true 时，才会输出日志到控制台。
 * 用于替代裸写的 console.log，方便统一管理和生产环境屏蔽。
 */
export class DebugLogger {
  private static isDebug: boolean = import.meta.env.MODE === 'development';
  private static prefix: string = '[ThinkPrism]';

  /**
   * 强制开启或关闭调试模式
   * @param status 是否开启
   */
  public static setDebugMode(status: boolean): void {
    this.isDebug = status;
    if (status) {
      console.info(`${this.prefix} Debug mode enabled.`);
    }
  }

  /**
   * 输出普通信息
   * @param message 消息内容
   * @param args 其他参数
   */
  public static info(message: string, ...args: unknown[]): void {
    if (this.isDebug) {
      console.info(`${this.prefix} [INFO] ${message}`, ...args);
    }
  }

  /**
   * 输出警告信息
   * @param message 警告内容
   * @param args 其他参数
   */
  public static warn(message: string, ...args: unknown[]): void {
    if (this.isDebug) {
      console.warn(`${this.prefix} [WARN] ${message}`, ...args);
    }
  }

  /**
   * 输出错误信息
   * (错误信息通常在生产环境也需要保留，但可以通过此方法统一格式)
   * @param message 错误内容
   * @param args 其他参数
   */
  public static error(message: string, ...args: unknown[]): void {
    // Error 通常总是输出，或者根据策略决定
    console.error(`${this.prefix} [ERROR] ${message}`, ...args);
  }

  /**
   * 分组输出日志
   * @param label 分组标签
   * @param fn 在分组内执行的函数
   */
  public static group(label: string, fn: () => void): void {
    if (this.isDebug) {
      // eslint-disable-next-line no-console
      console.group(`${this.prefix} ${label}`);
      try {
        fn();
      } finally {
        // eslint-disable-next-line no-console
        console.groupEnd();
      }
    } else {
      fn();
    }
  }
}
