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
        background: themeColors.background,
        text: themeColors.text,
      },
    },
  },
  plugins: [],
};

export default config;