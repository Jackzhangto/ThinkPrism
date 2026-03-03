import * as React from 'react';
import { cn } from '../../lib/utils';
import { cva } from 'class-variance-authority';
import { X } from 'lucide-react';

const toastVariants = cva(
  "fixed z-50 flex items-center justify-between w-full max-w-sm rounded-lg p-4 shadow-lg ring-1 ring-black/5 transition-all",
  {
    variants: {
      type: {
        info: "bg-bg-panel text-text-primary border border-border-default",
        success: "bg-status-success text-white border-transparent",
        error: "bg-status-error text-white border-transparent",
        warning: "bg-status-warning text-white border-transparent",
      },
    },
    defaultVariants: {
      type: "info",
    },
  }
);

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  message: string;
  type?: 'info' | 'success' | 'error' | 'warning';
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

/**
 * 全局 Toast 组件
 * 
 * @param message 消息内容
 * @param type 类型 (info, success, error, warning)
 * @param visible 是否可见
 * @param onClose 关闭回调
 * @param duration 自动关闭时间 (ms)
 */
function Toast({ message, type = 'info', visible, onClose, duration = 3000, className, ...props }: ToastProps) {
  React.useEffect(() => {
    if (visible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  if (!visible) return null;

  return (
    <div
      className={cn(toastVariants({ type }), "bottom-4 right-4 animate-in slide-in-from-bottom-5 fade-in", className)}
      {...props}
    >
      <div className="flex-1 text-sm font-medium">{message}</div>
      <button
        onClick={onClose}
        className="ml-4 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-current opacity-80 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export { Toast };
