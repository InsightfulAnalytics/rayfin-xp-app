import { describe, it, expect } from "vitest";
import { revenueByRegion } from "./revenue-by-region";
import { revenueTrend } from "./revenue-trend";
import { kpis } from "./kpis";

describe("paint query factories — filter injection", () => {
  it("emits no filter predicate when no slice is active", () => {
    const { query } = revenueByRegion();
    expect(query).not.toContain("Region[Region] =");
    expect(query).not.toContain("Product[Category] =");
    // Placeholder must be fully removed.
    expect(query).not.toContain("__FILTERS__");
  });

  it("injects a region predicate", () => {
    const { query } = revenueByRegion({ region: "North" });
    expect(query).toContain('Region[Region] = "North"');
    expect(query).not.toContain("Product[Category] =");
  });

  it("injects a category predicate", () => {
    const { query } = revenueByRegion({ category: "Laptops" });
    expect(query).toContain('Product[Category] = "Laptops"');
  });

  it("injects both predicates together", () => {
    const { query } = revenueTrend({ region: "West", category: "Phones" });
    expect(query).toContain('Region[Region] = "West"');
    expect(query).toContain('Product[Category] = "Phones"');
  });

  it("escapes double quotes in slice values", () => {
    const { query } = kpis({ region: 'A"B' });
    expect(query).toContain('Region[Region] = "A""B"');
  });

  it("targets the contosoSales connection and exposes column metadata", () => {
    const f = revenueByRegion({ region: "East" });
    expect(f.connection).toBe("contosoSales");
    expect(f.columnMetadata["Region[Region]"].name).toBe("RegionRegion");
  });
});
