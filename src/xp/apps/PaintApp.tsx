//-----------------------------------------------------------------------
// "Untitled - Paint" — a faux MS Paint whose canvas is a data dashboard.
// Charts are hand-drawn rough.js visuals fed by LIVE data from the
// `contosoSales` Power BI semantic model. The slicer strip re-queries the
// model by Region and/or Category.
//-----------------------------------------------------------------------

import { useState } from "react";
import { RoughBarChart, RoughLineChart, RoughPieChart } from "../charts/RoughCharts";
import {
  revenueByRegion,
  salesByCategory,
  revenueTrend,
  topProducts,
  kpis,
  slicerRegions,
  slicerCategories,
  type PaintFilter,
} from "@/queries/paint";
import { useSemanticModelQuery } from "@/hooks/use-semantic-model-query";
import {
  toRegionRows,
  toCategoryRows,
  toTrendRows,
  toProductRows,
  toKpis,
  toStringList,
} from "../data/paint-live";
import { fmtMoney, fmtNum, PAINT_COLORS } from "../data/paint-meta";

const TOOLS = [
  { id: "select", glyph: "⬚", label: "Free-Form Select" },
  { id: "rect-select", glyph: "▢", label: "Select" },
  { id: "eraser", glyph: "🧽", label: "Eraser" },
  { id: "fill", glyph: "🪣", label: "Fill With Color" },
  { id: "pick", glyph: "💧", label: "Pick Color" },
  { id: "magnify", glyph: "🔍", label: "Magnifier" },
  { id: "pencil", glyph: "✏️", label: "Pencil" },
  { id: "brush", glyph: "🖌️", label: "Brush" },
  { id: "airbrush", glyph: "💨", label: "Airbrush" },
  { id: "text", glyph: "A", label: "Text" },
  { id: "line", glyph: "╲", label: "Line" },
  { id: "curve", glyph: "∿", label: "Curve" },
  { id: "rect", glyph: "▭", label: "Rectangle" },
  { id: "poly", glyph: "⬠", label: "Polygon" },
  { id: "ellipse", glyph: "◯", label: "Ellipse" },
  { id: "rrect", glyph: "▢", label: "Rounded Rectangle" },
];

/** Centered status note shown inside a chart canvas while loading / on error / empty. */
function CanvasNote({ children }: { children: React.ReactNode }) {
  return <div className="paint-note">{children}</div>;
}

/**
 * Shared status handling for a single live query. Returns either a `note`
 * node to render (loading / error / empty) or the success `table` to map.
 */
function useLiveTable(factory: { connection: string; query: string }) {
  const { data, isLoading, error } = useSemanticModelQuery(factory);
  if (isLoading) return { note: <CanvasNote>🖌️ painting…</CanvasNote> } as const;
  if (error || data?.status === "error") {
    const msg = data?.status === "error" ? data.error.message : error?.message;
    return { note: <CanvasNote>⚠️ {msg ?? "query failed"}</CanvasNote> } as const;
  }
  if (data?.status !== "success") return { note: <CanvasNote>…</CanvasNote> } as const;
  return { table: data.table } as const;
}

/* ------------------------------ Slicer strip ------------------------------ */
function SlicerBar({
  filter,
  onChange,
}: {
  filter: PaintFilter;
  onChange: (next: PaintFilter) => void;
}) {
  const regions = useSemanticModelQuery(slicerRegions());
  const categories = useSemanticModelQuery(slicerCategories());

  const regionOpts =
    regions.data?.status === "success" ? toStringList(regions.data.table) : [];
  const categoryOpts =
    categories.data?.status === "success" ? toStringList(categories.data.table) : [];

  const active = Boolean(filter.region || filter.category);

  return (
    <div className="paint-slicer" role="region" aria-label="Slicers">
      <span className="paint-slicer-label">🪣 Slice by:</span>

      <label className="paint-slicer-field">
        Region
        <select
          value={filter.region ?? ""}
          onChange={(e) => onChange({ ...filter, region: e.target.value || null })}
          aria-label="Filter by region"
        >
          <option value="">All regions</option>
          {regionOpts.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>

      <label className="paint-slicer-field">
        Category
        <select
          value={filter.category ?? ""}
          onChange={(e) => onChange({ ...filter, category: e.target.value || null })}
          aria-label="Filter by category"
        >
          <option value="">All categories</option>
          {categoryOpts.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      {active && (
        <button
          className="paint-slicer-clear"
          onClick={() => onChange({ region: null, category: null })}
          title="Clear all slicers"
        >
          ✖ Clear
        </button>
      )}
    </div>
  );
}

/* ------------------------------ Live visuals ------------------------------ */
function KpiStrip({ filter }: { filter: PaintFilter }) {
  const { data, isLoading, error } = useSemanticModelQuery(kpis(filter));
  const k = data?.status === "success" ? toKpis(data.table) : null;
  const failed = Boolean(error || data?.status === "error");

  /** Loading → "…", error → "⚠️", otherwise the formatted value. */
  const show = (value: string) => (isLoading ? "…" : failed ? "⚠️" : value);

  return (
    <div className="paint-kpis">
      <div className="paint-kpi">
        <div className="v">{k ? fmtMoney(k.totalRevenue) : show("—")}</div>
        <div className="l">Total Revenue</div>
      </div>
      <div className="paint-kpi">
        <div className="v" style={{ color: "#0000c0" }}>
          {k ? fmtNum(k.totalUnits) : show("—")}
        </div>
        <div className="l">Units Sold</div>
      </div>
      <div className="paint-kpi">
        <div className="v" style={{ color: "#c01818" }}>
          {k ? `$${k.avgOrder}` : show("—")}
        </div>
        <div className="l">Avg Order</div>
      </div>
    </div>
  );
}

function RegionChart({ filter }: { filter: PaintFilter }) {
  const res = useLiveTable(revenueByRegion(filter));
  if ("note" in res) return res.note;
  const rows = toRegionRows(res.table);
  if (!rows.length) return <CanvasNote>no data for this slice</CanvasNote>;
  return <RoughBarChart data={rows} />;
}

function CategoryChart({ filter }: { filter: PaintFilter }) {
  const res = useLiveTable(salesByCategory(filter));
  if ("note" in res) return res.note;
  const rows = toCategoryRows(res.table);
  if (!rows.length) return <CanvasNote>no data for this slice</CanvasNote>;
  return <RoughPieChart data={rows} />;
}

function TrendChart({ filter }: { filter: PaintFilter }) {
  const res = useLiveTable(revenueTrend(filter));
  if ("note" in res) return res.note;
  const rows = toTrendRows(res.table);
  if (rows.length < 2) return <CanvasNote>not enough data to draw a trend</CanvasNote>;
  return <RoughLineChart data={rows} />;
}

function TopProductsTable({ filter }: { filter: PaintFilter }) {
  const res = useLiveTable(topProducts(filter));
  if ("note" in res) return res.note;
  const rows = toProductRows(res.table);
  if (!rows.length) return <CanvasNote>no products for this slice</CanvasNote>;
  return (
    <table className="paint-table">
      <thead>
        <tr>
          <th>Product</th>
          <th>Category</th>
          <th>Units</th>
          <th>Revenue</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((p) => (
          <tr key={p.product}>
            <td>{p.product}</td>
            <td>{p.category}</td>
            <td style={{ textAlign: "right" }}>{p.units.toLocaleString()}</td>
            <td style={{ textAlign: "right" }}>{fmtMoney(p.revenue)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function PaintApp() {
  const [tool, setTool] = useState("brush");
  const [color, setColor] = useState("#ff0000");
  const [filter, setFilter] = useState<PaintFilter>({ region: null, category: null });

  const sliceText =
    [filter.region, filter.category].filter(Boolean).join(" · ") || "everything";

  return (
    <div className="paint-body">
      <div className="xp-menubar">
        {["File", "Edit", "View", "Image", "Colors", "Help"].map((m) => (
          <span className="xp-menu-item" key={m}>
            {m}
          </span>
        ))}
      </div>

      <div className="paint-main">
        <div className="paint-toolbox">
          <div className="paint-tools">
            {TOOLS.map((t) => (
              <button
                key={t.id}
                className={`paint-tool${tool === t.id ? " active" : ""}`}
                title={t.label}
                onClick={() => setTool(t.id)}
              >
                {t.glyph}
              </button>
            ))}
          </div>
        </div>

        <div className="paint-canvas-wrap xp-scroll">
          <div className="paint-canvas xp-scroll">
            <h3 className="paint-canvas-title">★ Contoso Sales — painted! ★</h3>
            <p className="paint-canvas-sub">
              live from semantic model · showing {sliceText} · do not erase :)
            </p>

            <SlicerBar filter={filter} onChange={setFilter} />

            <KpiStrip filter={filter} />

            <div className="paint-chart-grid">
              <div className="paint-chart-card tilt-l">
                <h4>📊 Revenue by Region</h4>
                <div className="paint-chart-canvas">
                  <RegionChart filter={filter} />
                </div>
              </div>

              <div className="paint-chart-card tilt-r">
                <h4>🥧 Sales by Category</h4>
                <div className="paint-chart-canvas">
                  <CategoryChart filter={filter} />
                </div>
              </div>

              <div className="paint-chart-card wide tilt-l">
                <h4>📈 Monthly Revenue Trend</h4>
                <div className="paint-chart-canvas tall">
                  <TrendChart filter={filter} />
                </div>
              </div>

              <div className="paint-chart-card wide tilt-r">
                <h4>🏆 Top Products</h4>
                <div className="paint-grid-wrap xp-scroll">
                  <TopProductsTable filter={filter} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="paint-palette">
        <div className="paint-active-color">
          <span className="fg" style={{ background: color }} />
          <span className="bg" />
        </div>
        <div className="paint-swatches">
          {PAINT_COLORS.map((c) => (
            <button
              key={c}
              className="paint-swatch"
              style={{ background: c }}
              title={c}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
        <div style={{ marginLeft: "auto", fontSize: 11, color: "#333" }}>
          For Help, click Help Topics on the Help Menu.
        </div>
      </div>
    </div>
  );
}
