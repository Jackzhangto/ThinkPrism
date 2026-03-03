import type { Config } from 'tailwindcss';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '12px',
        lg: '20px',
        xl: '32px',
        page: '16px',   // Popup 页面内边距
        section: '24px', // 区块间距
        card: '12px',    // 卡片内边距
        stack: '8px',    // 元素堆叠间距
      },
      colors: {
        bg: {
          page: '#0F172A',   // Slate-900
          panel: '#1E293B',  // Slate-800
          hover: '#334155',  // Slate-700
          active: '#475569', // Slate-600
        },
        text: {
          primary: '#F8FAFC',   // Slate-50
          secondary: '#94A3B8', // Slate-400
          hint: '#64748B',      // Slate-500
          inverse: '#0F172A',   // Slate-900
        },
        brand: {
          primary: '#3B82F6',   // Blue-500
          hover: '#2563EB',     // Blue-600
          active: '#1D4ED8',    // Blue-700
        },
        status: {
          success: '#22C55E',   // Green-500
          warning: '#EAB308',   // Yellow-500
          error: '#EF4444',     // Red-500
        },
        border: {
          DEFAULT: '#334155',   // Slate-700
          light: '#475569',     // Slate-600
        }
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        pill: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        highlight: '0 0 0 2px rgba(59, 130, 246, 0.5)', // Focus ring
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
} satisfies Config;