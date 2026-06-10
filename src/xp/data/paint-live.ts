//-----------------------------------------------------------------------
// Maps raw SDK QueryTable results from the contosoSales semantic model
// into the simple typed row shapes the hand-drawn RoughCharts expect.
// Columns are resolved by their exact DAX result name so ordering changes
// never break the mapping.
//-----------------------------------------------------------------------

import type { QueryTable } from "@microsoft/fabric-app-data";
import type { RegionRow, TrendRow, CategoryRow, ProductRow } from "./demo-data";

const idx = (t: QueryTable, name: string): number =>
  t.columns.findIndex((c) => c.name === name);

/** Revenue-by-region rows for the bar chart. */
export function toRegionRows(t: QueryTable): RegionRow[] {
  const r = idx(t, "Region[Region]");
  const v = idx(t, "[Revenue]");
  return t.rows.map((row) => ({ region: String(row[r]), revenue: Number(row[v]) }));
}

/** Sales-by-category rows for the pie chart (share computed client-side). */
export function toCategoryRows(t: QueryTable): CategoryRow[] {
  const c = idx(t, "Product[Category]");
  const v = idx(t, "[Revenue]");
  const total = t.rows.reduce((s, row) => s + Number(row[v]), 0) || 1;
  return t.rows.map((row) => ({
    category: String(row[c]),
    share: Math.round((Number(row[v]) / total) * 100),
  }));
}

/** Monthly revenue/units rows for the line chart. */
export function toTrendRows(t: QueryTable): TrendRow[] {
  const m = idx(t, "Date[Month]");
  const rev = idx(t, "[Revenue]");
  const u = idx(t, "[Units]");
  return t.rows.map((row) => ({
    month: String(row[m]),
    revenue: Number(row[rev]),
    units: Number(row[u]),
  }));
}

/** Top-products rows for the table. */
export function toProductRows(t: QueryTable): ProductRow[] {
  const p = idx(t, "Product[Product]");
  const c = idx(t, "Product[Category]");
  const u = idx(t, "[Units]");
  const v = idx(t, "[Revenue]");
  return t.rows.map((row) => ({
    product: String(row[p]),
    category: String(row[c]),
    units: Number(row[u]),
    revenue: Number(row[v]),
  }));
}

export interface KpiRow {
  totalRevenue: number;
  totalUnits: number;
  avgOrder: number;
}

/** Single headline-KPI row, or null when the result is empty. */
export function toKpis(t: QueryTable): KpiRow | null {
  const row = t.rows[0];
  if (!row) return null;
  return {
    totalRevenue: Number(row[idx(t, "[totalRevenue]")]),
    totalUnits: Number(row[idx(t, "[totalUnits]")]),
    avgOrder: Math.round(Number(row[idx(t, "[avgOrder]")])),
  };
}

/** First-column string values (slicer option lists). */
export function toStringList(t: QueryTable): string[] {
  return t.rows.map((row) => String(row[0]));
}
