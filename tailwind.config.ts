import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── New palette ──────────────────────────────────────────
        "roome-core":     "#38b6ff", // Core Blue   – buttons, active states, links
        "roome-glow":     "#5BB8FF", // Glow Blue   – gradients, hover, animations
        "roome-deep":     "#0A4FA3", // Deep Blue   – hover on primary, gradients
        "roome-pale":     "#D6ECFF", // Pale Blue   – tags, pills, badges, chat bubbles
        "roome-black":    "#0A0A0A", // Rich Black  – headings, primary text
        "roome-offwhite": "#F9F8F6", // Off White   – app bg, inputs, nav bar
        // ── Accent / semantic ────────────────────────────────────
        "roome-match":    "#FF6B6B", // Like / match
        "roome-friend":   "#4ECDC4", // Friend badge
        "roome-msg":      "#C3A6FF", // Message badge
        "roome-verify":   "#A8E6CF", // Verified badge
        // ── Legacy aliases (kept so existing className refs still compile) ─
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "system-ui", "sans-serif"],
        body:    ["var(--font-body)", "system-ui", "sans-serif"],
        sans:    ["var(--font-body)", "system-ui", "sans-serif"],
      },
      fontSize: {
        display: ["60px", { lineHeight: "1.1", fontWeight: "900" }],
        h1:      ["38px", { lineHeight: "1.2", fontWeight: "700" }],
        h2:      ["26px", { lineHeight: "1.3", fontWeight: "700" }],
        body:    ["16px", { lineHeight: "1.6" }],
        caption: ["12px", { lineHeight: "1.4" }],
      },
    },
  },
  plugins: [],
};
export default config;
