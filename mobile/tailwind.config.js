/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#3e646a",
          light: "#bde6ec",
          container: "#bde6ec",
          "on-container": "#41686d",
        },
        secondary: {
          DEFAULT: "#506444",
          light: "#cfe7be",
          container: "#cfe7be",
          "on-container": "#546848",
        },
        tertiary: {
          DEFAULT: "#64601e",
          light: "#e8e291",
          container: "#e8e291",
          "on-container": "#686422",
        },
        background: "#fcf9f8",
        surface: {
          DEFAULT: "#fcf9f8",
          dim: "#dcd9d9",
          bright: "#fcf9f8",
          lowest: "#ffffff",
          low: "#f6f3f2",
          container: "#f0eded",
          high: "#eae7e7",
          highest: "#e5e2e1",
        },
        "on-surface": "#1c1b1b",
        "on-surface-variant": "#414849",
        outline: {
          DEFAULT: "#717879",
          variant: "#c0c8c9",
        },
        danger: {
          DEFAULT: "#ba1a1a",
          light: "#ffdad6",
          dark: "#93000a",
        },
      },
      borderRadius: {
        sm: "0.5rem",
        DEFAULT: "1rem",
        md: "1.5rem",
        lg: "2rem",
        xl: "3rem",
        full: "9999px",
      },
      spacing: {
        unit: "4px",
        "container-padding": "24px",
        "card-gap": "16px",
        "section-margin": "32px",
        "pill-padding-x": "20px",
        "pill-padding-y": "12px",
      },
    },
  },
  plugins: [],
};
