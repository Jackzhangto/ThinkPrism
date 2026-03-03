import { create } from 'zustand';

export type ToastType = 'info' | 'success' | 'error' | 'warning';

interface ToastState {
  message: string;
  type: ToastType;
  visible: boolean;
  duration: number;
  
  // Actions
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: () => void;
}

export const useUIStore = create<ToastState>((set) => ({
  message: '',
  type: 'info',
  visible: false,
  duration: 3000,

  showToast: (message, type = 'info', duration = 3000) => {
    set({ message, type, visible: true, duration });
  },

  hideToast: () => {
    set({ visible: false });
  }
}));
