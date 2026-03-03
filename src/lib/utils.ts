import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并 Tailwind CSS 类名。
 * 结合了 clsx 的条件类名和 tailwind-merge 的冲突解决。
 * 
 * @param inputs 类名参数列表
 * @returns 合并后的类名字符串
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
