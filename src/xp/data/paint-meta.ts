//-----------------------------------------------------------------------
// Re-exports + the full MS Paint 28-color palette for the swatch strip.
//-----------------------------------------------------------------------

export { kpis, topProducts, fmtMoney, fmtNum } from "./demo-data";

/** The classic two-row MS Paint color box (28 swatches). */
export const PAINT_COLORS = [
  // top row
  "#000000", "#808080", "#800000", "#808000", "#008000", "#008080",
  "#000080", "#800080", "#808040", "#004040", "#0080ff", "#004080",
  "#8000ff", "#804000",
  // bottom row
  "#ffffff", "#c0c0c0", "#ff0000", "#ffff00", "#00ff00", "#00ffff",
  "#0000ff", "#ff00ff", "#ffff80", "#00ff80", "#80ffff", "#8080ff",
  "#ff0080", "#ff8040",
];
