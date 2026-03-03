import * as React from 'react';
import { cn } from '../../lib/utils';
import { cva } from 'class-variance-authority';

const switchVariants = cva(
  "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-brand-primary data-[state=unchecked]:bg-bg-active"
);

const switchThumbVariants = cva(
  "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
);

export interface SwitchProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

/**
 * 开关组件 (Switch)
 * 用于二选一的状态切换。
 * 
 * @param checked 是否选中
 * @param onCheckedChange 状态变更回调
 */
const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, checked, onCheckedChange, disabled, ...props }, ref) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      data-state={checked ? "checked" : "unchecked"}
      disabled={disabled}
      className={cn(switchVariants(), className)}
      ref={ref}
      onClick={(e) => {
        onCheckedChange?.(!checked);
        props.onClick?.(e);
      }}
      {...props}
    >
      <span className={cn(switchThumbVariants())} data-state={checked ? "checked" : "unchecked"} />
    </button>
  )
);
Switch.displayName = "Switch";

export { Switch };
