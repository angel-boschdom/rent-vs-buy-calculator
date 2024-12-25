// tailwind.config.ts
import { Config } from 'tailwindcss';
import { themeColors } from './src/theme/colors';

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}', // Ensure Tailwind scans your TS/TSX files
  ],
  theme: {
    extend: {
      colors: {
        primary: themeColors.primary,
        secondary: themeColors.secondary,
        tertiary: themeColors.tertiary,
        accent: themeColors.accent,
        background: themeColors.background,
        text: themeColors.text,
        foreground: themeColors.foreground, // Added
        border: themeColors.border,         // Added
        'accent-foreground': themeColors['accent-foreground'], // Added
        // Optional additional colors
        success: themeColors.success,
        error: themeColors.error,
        warning: themeColors.warning,
        info: themeColors.info,
        muted: themeColors.muted,
        highlight: themeColors.highlight,
      },
    },
  },
  plugins: [],
};

export default config;