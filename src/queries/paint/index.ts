//-----------------------------------------------------------------------
// Barrel for the Paint dashboard queries (contosoSales semantic model).
// Every factory accepts an optional PaintFilter ({ region, category }) so
// the slicer can re-query the model with the active selection.
//-----------------------------------------------------------------------

export type { PaintFilter } from "./_filter";
export { revenueByRegion } from "./revenue-by-region";
export { salesByCategory } from "./sales-by-category";
export { revenueTrend } from "./revenue-trend";
export { topProducts } from "./top-products";
export { kpis } from "./kpis";
export { slicerRegions, slicerCategories } from "./slicer-options";
