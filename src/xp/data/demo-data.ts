//-----------------------------------------------------------------------
// Demo analytics dataset (fictional "Contoso" sales).
//
// This stands in for a live Power BI semantic model so the app renders
// standalone without Fabric auth. To wire real data, replace these
// constants with `useSemanticModelQuery(...)` calls against query factory
// functions in `src/queries/` (see AGENTS.md "Query & Spec Organization").
//-----------------------------------------------------------------------

export interface RegionRow {
  region: string;
  revenue: number;
}
export interface TrendRow {
  month: string;
  revenue: number;
  units: number;
}
export interface CategoryRow {
  category: string;
  share: number;
}
export interface ProductRow {
  product: string;
  category: string;
  units: number;
  revenue: number;
}

export const revenueByRegion: RegionRow[] = [
  { region: "North", revenue: 482_000 },
  { region: "South", revenue: 351_500 },
  { region: "East", revenue: 298_750 },
  { region: "West", revenue: 524_300 },
  { region: "Central", revenue: 203_900 },
];

export const revenueTrend: TrendRow[] = [
  { month: "Jan", revenue: 118_000, units: 1240 },
  { month: "Feb", revenue: 132_500, units: 1390 },
  { month: "Mar", revenue: 121_000, units: 1280 },
  { month: "Apr", revenue: 158_300, units: 1610 },
  { month: "May", revenue: 174_900, units: 1755 },
  { month: "Jun", revenue: 169_400, units: 1702 },
  { month: "Jul", revenue: 191_200, units: 1980 },
  { month: "Aug", revenue: 205_600, units: 2110 },
  { month: "Sep", revenue: 198_300, units: 2005 },
  { month: "Oct", revenue: 221_700, units: 2240 },
  { month: "Nov", revenue: 248_900, units: 2510 },
  { month: "Dec", revenue: 289_400, units: 2890 },
];

export const salesByCategory: CategoryRow[] = [
  { category: "Laptops", share: 34 },
  { category: "Phones", share: 27 },
  { category: "Tablets", share: 16 },
  { category: "Audio", share: 13 },
  { category: "Other", share: 10 },
];

export const topProducts: ProductRow[] = [
  { product: "Contoso Ultrabook 14", category: "Laptops", units: 3120, revenue: 412_400 },
  { product: "Contoso Phone X", category: "Phones", units: 4880, revenue: 388_900 },
  { product: "Contoso Tab Air", category: "Tablets", units: 2240, revenue: 201_600 },
  { product: "Contoso Buds Pro", category: "Audio", units: 6310, revenue: 158_750 },
  { product: "Contoso Studio 16", category: "Laptops", units: 1180, revenue: 287_300 },
  { product: "Contoso Phone SE", category: "Phones", units: 5210, revenue: 197_900 },
  { product: "Contoso Watch 2", category: "Other", units: 2960, revenue: 133_200 },
];

export const kpis = {
  totalRevenue: revenueTrend.reduce((s, r) => s + r.revenue, 0),
  totalUnits: revenueTrend.reduce((s, r) => s + r.units, 0),
  avgOrder: Math.round(
    revenueTrend.reduce((s, r) => s + r.revenue, 0) /
      revenueTrend.reduce((s, r) => s + r.units, 0),
  ),
};

export const fmtMoney = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
      ? `$${(n / 1_000).toFixed(0)}K`
      : `$${n}`;

export const fmtNum = (n: number) =>
  n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : `${n}`;
