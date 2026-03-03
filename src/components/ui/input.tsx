import * as React from 'react';
import { cn } from '../../lib/utils';
import { cva } from 'class-variance-authority';

const inputVariants = cva(
  "flex h-9 w-full rounded-md border border-border-default bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-hint focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-primary disabled:cursor-not-allowed disabled:opacity-50"
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode;
  }

/**
 * 基础输入框组件
 * 支持自定义图标 (icon)。
 * 
 * @param className 自定义类名
 * @param icon 左侧图标 (ReactNode)
 * @param props HTML Input 属性
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-2 top-2.5 h-4 w-4 text-text-hint">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(inputVariants(), icon && "pl-8", className)}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
