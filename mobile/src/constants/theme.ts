export const Colors = {
  text: "#1c1b1b",
  textSecondary: "#414849",
  textTertiary: "#717879",
  background: "#fcf9f8",
  tint: "#3e646a",
  icon: "#717879",
  tabIconDefault: "#717879",
  tabIconSelected: "#3e646a",
  primary: "#3e646a",
  primaryLight: "#bde6ec",
  primaryContainer: "#bde6ec",
  onPrimaryContainer: "#41686d",
  secondary: "#506444",
  secondaryContainer: "#cfe7be",
  onSecondaryContainer: "#546848",
  tertiary: "#64601e",
  tertiaryContainer: "#e8e291",
  onTertiaryContainer: "#686422",
  success: "#506444",
  successLight: "#cfe7be",
  warning: "#64601e",
  warningLight: "#e8e291",
  danger: "#ba1a1a",
  dangerLight: "#ffdad6",
  dangerDark: "#93000a",
  cardBg: "#ffffff",
  border: "#eae7e7",
  inputBg: "#f6f3f2",
  surfaceContainerLow: "#f6f3f2",
  surfaceContainerLowest: "#ffffff",
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
