import type { ColumnMetadataMap } from "@/lib/to-data-table";
import baseQuery from "./revenue-by-region.dax?raw";
import { applyFilters, type PaintFilter } from "./_filter";

/** Connection alias from fabric.yaml. */
const connection = "contosoSales";

/** Column metadata keyed by the exact DAX result column names. */
const columnMetadata: ColumnMetadataMap = {
  "Region[Region]": { name: "RegionRegion", displayName: "Region" },
  "[Revenue]": { name: "Revenue", displayName: "Revenue", format: "$#,0" },
};

/** Revenue grouped by region, optionally filtered by the active slicers. */
export function revenueByRegion(filter?: PaintFilter) {
  return { connection, query: applyFilters(baseQuery, filter), columnMetadata };
}
