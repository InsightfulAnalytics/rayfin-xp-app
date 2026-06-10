//-----------------------------------------------------------------------
// Hand-drawn, crayon-style charts powered by rough.js.
//
// These deliberately look like a kid scribbled them in MS Paint: wobbly
// axes, hachure / cross-hatch fills, jittery strokes and Comic Sans labels.
// They render plain SVG (not Vega-Lite) because sketchy aesthetics are
// exactly what charting libraries are built to avoid.
//-----------------------------------------------------------------------

import { useEffect, useRef } from "react";
import rough from "roughjs";
import type { RegionRow, TrendRow, CategoryRow } from "../data/demo-data";

const SVG_NS = "http://www.w3.org/2000/svg";

/** Bright crayon / MS Paint palette for the kid aesthetic. */
export const CRAYON = [
  "#ed1c24", // red
  "#0066ff", // blue
  "#22b14c", // green
  "#ff7f27", // orange
  "#a349a4", // purple
  "#00a2e8", // sky
  "#fff200", // yellow
  "#b5e61d", // lime
];

const FONT = '"Comic Sans MS", "Comic Sans", "Trebuchet MS", cursive';

/** Shared "scribbled by hand" rough.js options. */
const sketchy = (extra: Record<string, unknown> = {}) => ({
  roughness: 2.4,
  bowing: 1.8,
  strokeWidth: 2.2,
  ...extra,
});

function text(
  parent: SVGElement,
  x: number,
  y: number,
  s: string,
  opts: { size?: number; fill?: string; anchor?: string; rotate?: number; weight?: string } = {},
) {
  const t = document.createElementNS(SVG_NS, "text");
  t.setAttribute("x", String(x));
  t.setAttribute("y", String(y));
  t.setAttribute("font-family", FONT);
  t.setAttribute("font-size", String(opts.size ?? 12));
  t.setAttribute("fill", opts.fill ?? "#000");
  t.setAttribute("text-anchor", opts.anchor ?? "middle");
  if (opts.weight) t.setAttribute("font-weight", opts.weight);
  if (opts.rotate) t.setAttribute("transform", `rotate(${opts.rotate} ${x} ${y})`);
  t.textContent = s;
  parent.appendChild(t);
}

function freshSvg(host: SVGSVGElement, w: number, h: number) {
  while (host.firstChild) host.removeChild(host.firstChild);
  host.setAttribute("viewBox", `0 0 ${w} ${h}`);
  host.setAttribute("preserveAspectRatio", "xMidYMid meet");
  host.style.width = "100%";
  host.style.height = "100%";
  return rough.svg(host);
}

const niceMoney = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${Math.round(n / 1000)}k`;

/* ----------------------------- Bar chart ----------------------------- */
export function RoughBarChart({ data }: { data: RegionRow[] }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const W = 440, H = 260, L = 46, R = 18, T = 22, B = 54;
    const rc = freshSvg(svg, W, H);
    const max = Math.max(...data.map((d) => d.revenue)) * 1.1;
    const plotW = W - L - R, plotH = H - T - B;
    const baseY = T + plotH;

    // wobbly axes
    svg.appendChild(rc.line(L, T, L, baseY, sketchy({ stroke: "#000" })));
    svg.appendChild(rc.line(L, baseY, W - R, baseY, sketchy({ stroke: "#000" })));

    // y ticks + faint pencil gridlines
    for (let i = 1; i <= 3; i++) {
      const v = (max / 3) * i;
      const y = baseY - (v / max) * plotH;
      svg.appendChild(rc.line(L, y, W - R, y, sketchy({ stroke: "#bbb", strokeWidth: 1, roughness: 1.5 })));
      text(svg, L - 6, y + 4, niceMoney(v), { size: 10, anchor: "end", fill: "#444" });
    }

    const bw = plotW / data.length;
    data.forEach((d, i) => {
      const bh = (d.revenue / max) * plotH;
      const x = L + i * bw + bw * 0.18;
      const w = bw * 0.64;
      const color = CRAYON[i % CRAYON.length];
      svg.appendChild(
        rc.rectangle(x, baseY - bh, w, bh, sketchy({
          fill: color,
          fillStyle: "cross-hatch",
          fillWeight: 1.4,
          hachureGap: 5,
          hachureAngle: 41,
          stroke: "#000",
          strokeWidth: 2.4,
          seed: i + 1,
        })),
      );
      text(svg, x + w / 2, baseY + 18, d.region, { size: 12, weight: "bold" });
      text(svg, x + w / 2, baseY - bh - 6, niceMoney(d.revenue), { size: 10, fill: color, weight: "bold" });
    });
  }, [data]);
  return <svg ref={ref} role="img" aria-label="Revenue by region" />;
}

/* ----------------------------- Line chart ---------------------------- */
export function RoughLineChart({ data }: { data: TrendRow[] }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const W = 760, H = 250, L = 50, R = 18, T = 20, B = 46;
    const rc = freshSvg(svg, W, H);
    const max = Math.max(...data.map((d) => d.revenue)) * 1.12;
    const plotW = W - L - R, plotH = H - T - B, baseY = T + plotH;

    svg.appendChild(rc.line(L, T, L, baseY, sketchy({ stroke: "#000" })));
    svg.appendChild(rc.line(L, baseY, W - R, baseY, sketchy({ stroke: "#000" })));
    for (let i = 1; i <= 3; i++) {
      const v = (max / 3) * i, y = baseY - (v / max) * plotH;
      svg.appendChild(rc.line(L, y, W - R, y, sketchy({ stroke: "#cfcfcf", strokeWidth: 1, roughness: 1.4 })));
      text(svg, L - 6, y + 4, niceMoney(v), { size: 10, anchor: "end", fill: "#444" });
    }

    const step = plotW / (data.length - 1);
    const pts: [number, number][] = data.map((d, i) => [
      L + i * step,
      baseY - (d.revenue / max) * plotH,
    ]);

    // crayon line (drawn twice for a waxy double-stroke feel)
    svg.appendChild(rc.linearPath(pts, sketchy({ stroke: "#0066ff", strokeWidth: 3.4, roughness: 2 })));
    svg.appendChild(rc.linearPath(pts, sketchy({ stroke: "#3399ff", strokeWidth: 1.4, roughness: 2.6 })));

    pts.forEach(([x, y], i) => {
      svg.appendChild(rc.circle(x, y, 13, sketchy({
        fill: "#ed1c24", fillStyle: "solid", stroke: "#000", strokeWidth: 2, seed: i + 5,
      })));
      text(svg, x, baseY + 17, data[i].month, { size: 11, weight: "bold" });
    });
  }, [data]);
  return <svg ref={ref} role="img" aria-label="Monthly revenue trend" />;
}

/* ------------------------------ Pie chart ---------------------------- */
export function RoughPieChart({ data }: { data: CategoryRow[] }) {
  const ref = useRef<SVGSVGElement>(null);
  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const W = 300, H = 250, cx = 130, cy = 120, r = 92;
    const rc = freshSvg(svg, W, H);
    const total = data.reduce((s, d) => s + d.share, 0);
    let a0 = -Math.PI / 2;
    data.forEach((d, i) => {
      const a1 = a0 + (d.share / total) * Math.PI * 2;
      const color = CRAYON[i % CRAYON.length];
      svg.appendChild(rc.arc(cx, cy, r * 2, r * 2, a0, a1, true, sketchy({
        fill: color, fillStyle: "hachure", fillWeight: 1.6, hachureGap: 5,
        hachureAngle: 30 + i * 25, stroke: "#000", strokeWidth: 2.2, seed: i + 9,
      })));
      a0 = a1; // advance to the end of this slice so wedges tile around the circle
      // label dot + percent in legend column
      const ly = 38 + i * 30;
      svg.appendChild(rc.rectangle(232, ly - 9, 14, 14, sketchy({
        fill: color, fillStyle: "cross-hatch", fillWeight: 1.2, hachureGap: 4,
        stroke: "#000", strokeWidth: 1.6, roughness: 1.8, seed: i + 20,
      })));
      text(svg, 250, ly + 2, `${d.category} ${d.share}%`, { size: 11, anchor: "start", weight: "bold" });
    });
  }, [data]);
  return <svg ref={ref} role="img" aria-label="Sales by category" />;
}
