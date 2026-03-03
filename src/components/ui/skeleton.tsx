import * as React from 'react';
import { cn } from '../../lib/utils';
import { cva } from 'class-variance-authority';

const skeletonVariants = cva(
  "animate-pulse rounded-md bg-bg-panel"
);

export type SkeletonProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * 骨架屏组件
 * 用于加载状态占位。
 * 
 * @param className 自定义类名
 */
function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(skeletonVariants(), className)}
      {...props}
    />
  );
}

export { Skeleton };
