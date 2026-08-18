/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // GitHub color palette
        canvas: {
          default: 'rgb(255, 255, 255)',
          subtle: 'rgb(246, 248, 250)',
          inset: 'rgb(255, 255, 255)',
        },
        border: {
          default: 'rgb(208, 215, 222)',
          muted: 'rgb(216, 222, 228)',
        },
        fg: {
          default: 'rgb(31, 35, 40)',
          muted: 'rgb(87, 96, 106)',
          subtle: 'rgb(110, 118, 129)',
        },
        accent: {
          fg: 'rgb(9, 105, 218)',
          emphasis: 'rgb(31, 111, 235)',
          muted: 'rgba(84, 174, 255, 0.4)',
          subtle: 'rgb(221, 244, 255)',
        },
        success: {
          fg: 'rgb(26, 127, 55)',
          emphasis: 'rgb(31, 136, 61)',
          muted: 'rgba(74, 194, 107, 0.4)',
          subtle: 'rgb(218, 251, 225)',
        },
        attention: {
          fg: 'rgb(154, 103, 0)',
          emphasis: 'rgb(191, 135, 0)',
          muted: 'rgba(212, 167, 44, 0.4)',
          subtle: 'rgb(255, 245, 232)',
        },
        danger: {
          fg: 'rgb(207, 34, 46)',
          emphasis: 'rgb(218, 54, 51)',
          muted: 'rgba(255, 129, 130, 0.4)',
          subtle: 'rgb(255, 235, 233)',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Noto Sans',
          'Helvetica',
          'Arial',
          'sans-serif',
          'Apple Color Emoji',
          'Segoe UI Emoji',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'SF Mono',
          'Menlo',
          'Consolas',
          'Liberation Mono',
          'monospace',
        ],
      },
      borderRadius: {
        'github': '6px',
      },
      boxShadow: {
        'github': '0 0 transparent, 0 0 transparent, 0 1px 3px rgba(31, 35, 40, 0.12), 0 8px 24px rgba(66, 74, 83, 0.12)',
        'github-sm': '0 1px 0 rgba(31, 35, 40, 0.04)',
      },
    },
  },
  plugins: [],
}
