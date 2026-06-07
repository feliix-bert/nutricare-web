export const Colors = {
  text: "#1A1A2E",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",
  background: "#FAFAFA",
  tint: "#0A7E6E",
  icon: "#6B7280",
  tabIconDefault: "#9CA3AF",
  tabIconSelected: "#0A7E6E",
  primary: "#0A7E6E",
  primaryLight: "#E0F5F1",
  success: "#059669",
  successLight: "#D1FAE5",
  warning: "#D97706",
  warningLight: "#FEF3C7",
  danger: "#DC2626",
  dangerLight: "#FEE2E2",
  dangerDark: "#991B1B",
  cardBg: "#FFFFFF",
  border: "#F0F0F0",
  inputBg: "#F9FAFB",
} as const;

export type ThemeColors = typeof Colors;
export type ThemeColorKey = keyof typeof Colors;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;
