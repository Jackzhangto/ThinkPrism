import * as React from 'react';
import { cn } from '../../lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-brand-primary text-text-inverse hover:bg-brand-hover shadow-sm",
        secondary:
          "border-transparent bg-bg-panel text-text-secondary hover:bg-bg-hover shadow-sm",
        destructive:
          "border-transparent bg-status-error text-white hover:bg-red-600 shadow-sm",
        outline: "text-text-primary border-border-default",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

/**
 * 徽章组件 (Badge)
 * 用于显示状态、标签或计数。
 * 
 * @param className 自定义类名
 * @param variant 变体样式 (default, secondary, destructive, outline)
 * @param children 内容
 */
function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge };
