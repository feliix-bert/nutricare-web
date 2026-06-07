import { Platform } from 'react-native';

const primaryColor = '#0a7ea4';

export const Colors = {
  light: {
    // Core
    text: '#11181C',
    background: '#F5F7FA',
    tint: primaryColor,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: primaryColor,
    // Brand
    primary: primaryColor,
    primaryLight: '#E0F3FA',
    // Status
    success: '#16A34A',
    successLight: '#DCFCE7',
    warning: '#D97706',
    warningLight: '#FEF3C7',
    danger: '#DC2626',
    dangerLight: '#FEE2E2',
    dangerDark: '#991B1B',
    // Surface
    cardBg: '#FFFFFF',
    border: '#E5E7EB',
    inputBg: '#F9FAFB',
  },
  dark: {
    // Core
    text: '#ECEDEE',
    background: '#0F1117',
    tint: '#5BC0E0',
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#5BC0E0',
    // Brand
    primary: '#5BC0E0',
    primaryLight: '#0A2A35',
    // Status
    success: '#4ADE80',
    successLight: '#052E16',
    warning: '#FBBF24',
    warningLight: '#1C1400',
    danger: '#F87171',
    dangerLight: '#1A0000',
    dangerDark: '#FCA5A5',
    // Surface
    cardBg: '#1C1F26',
    border: '#2D3139',
    inputBg: '#22262E',
  },
} as const;

export type ThemeColors = typeof Colors.light;
export type ThemeColorKey = keyof ThemeColors;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;
