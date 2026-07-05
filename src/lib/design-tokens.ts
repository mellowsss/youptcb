export const tokens = {
  colors: {
    background: "#F9F8F4",
    foreground: "#2D3A31",
    sage: "#8C9A84",
    clay: "#DCCFC2",
    clayLight: "#F2F0EB",
    stone: "#E6E2DA",
    terracotta: "#C27B66",
    white: "#FFFFFF",
  },
  shadows: {
    sm: "0 4px 6px -1px rgba(45, 58, 49, 0.05)",
    md: "0 10px 15px -3px rgba(45, 58, 49, 0.05)",
    lg: "0 20px 40px -10px rgba(45, 58, 49, 0.05)",
    xl: "0 25px 50px -12px rgba(45, 58, 49, 0.15)",
  },
  radius: {
    card: "1.5rem",
    pill: "9999px",
    arch: "200px 200px 0 0",
  },
  motion: {
    fast: "300ms",
    standard: "500ms",
    slow: "700ms",
  },
} as const;
