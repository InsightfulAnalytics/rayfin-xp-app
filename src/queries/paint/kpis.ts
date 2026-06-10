import type { ColumnMetadataMap } from "@/lib/to-data-table";
import baseQuery from "./kpis.dax?raw";
import { applyFilters, type PaintFilter } from "./_filter";

/** Connection alias from fabric.yaml. */
const connection = "contosoSales";

/** Column metadata keyed by the exact DAX result column names. */
const columnMetadata: ColumnMetadataMap = {
  "[totalRevenue]": { name: "totalRevenue", displayName: "Total Revenue", format: "$#,0" },
  "[totalUnits]": { name: "totalUnits", displayName: "Units Sold", format: "#,0" },
  "[avgOrder]": { name: "avgOrder", displayName: "Avg Order", format: "$#,0" },
};

/** Headline KPIs (revenue, units, avg order), filtered by the active slicers. */
export function kpis(filter?: PaintFilter) {
  return { connection, query: applyFilters(baseQuery, filter), columnMetadata };
}
