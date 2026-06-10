import type { ColumnMetadataMap } from "@/lib/to-data-table";
import baseQuery from "./revenue-trend.dax?raw";
import { applyFilters, type PaintFilter } from "./_filter";

/** Connection alias from fabric.yaml. */
const connection = "contosoSales";

/** Column metadata keyed by the exact DAX result column names. */
const columnMetadata: ColumnMetadataMap = {
  "Date[MonthNo]": { name: "DateMonthNo", displayName: "Month No" },
  "Date[Month]": { name: "DateMonth", displayName: "Month" },
  "[Revenue]": { name: "Revenue", displayName: "Revenue", format: "$#,0" },
  "[Units]": { name: "Units", displayName: "Units", format: "#,0" },
};

/** Monthly revenue + units trend, optionally filtered by the active slicers. */
export function revenueTrend(filter?: PaintFilter) {
  return { connection, query: applyFilters(baseQuery, filter), columnMetadata };
}
