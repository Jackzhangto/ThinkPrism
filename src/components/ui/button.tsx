import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-bg-page",
  {
    variants: {
      variant: {
        default: "bg-brand-primary text-white hover:bg-brand-hover active:bg-brand-active shadow-sm",
        destructive: "bg-status-error text-white hover:bg-red-600 shadow-sm",
        outline: "border border-border-default bg-transparent hover:bg-bg-hover text-text-primary",
        secondary: "bg-bg-panel text-text-primary hover:bg-bg-hover border border-border-light",
        ghost: "hover:bg-bg-hover text-text-primary",
        link: "text-brand-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

/**
 * 基础按钮组件
 * 支持多种变体 (variant) 和尺寸 (size)。
 * 
 * @param className 自定义类名
 * @param variant 变体样式 (default, destructive, outline, secondary, ghost, link)
 * @param size 尺寸 (default, sm, lg, icon)
 * @param loading 是否显示加载状态
 * @param children 子元素
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={props.disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
