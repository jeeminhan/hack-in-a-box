// src/theme.js — single source of truth for Indigitous-brand visuals.
export const color = {
  accent: "#EF4E25",      // Indigitous orange — the ONLY decorative color
  accentSoft: "#EF4E2510",
  ink: "#131313",         // headings (never #000)
  body: "#3A3833",
  muted: "#6A665D",
  faint: "#9A968C",
  bg: "#F4F2EC",          // app background (warm stone)
  rail: "#FAF8F3",        // sidebar / panels
  surface: "#FFFFFF",     // cards
  panel: "#ECE8DE",       // secondary panel
  line: "#E7E3D9",        // hairline dividers
  lineSoft: "#EEEAE0",
};

export const font = {
  sans: "'Noto Sans', system-ui, sans-serif",
};

export const radius = { sm: 6, md: 10, lg: 14, pill: 40 };

// Standard pill button style (primary = orange, secondary = ghost).
export const pill = (variant = "primary") => ({
  display: "inline-flex", alignItems: "center", gap: 8,
  fontFamily: font.sans, fontWeight: 600, fontSize: 15,
  padding: "13px 26px", borderRadius: radius.pill, cursor: "pointer",
  border: variant === "secondary" ? `1px solid ${color.line}` : "none",
  background: variant === "secondary" ? "transparent" : color.accent,
  color: variant === "secondary" ? color.ink : "#fff",
});
