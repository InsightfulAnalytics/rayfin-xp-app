import type { ColumnMetadataMap } from "@/lib/to-data-table";
import baseQuery from "./sales-by-category.dax?raw";
import { applyFilters, type PaintFilter } from "./_filter";

/** Connection alias from fabric.yaml. */
const connection = "contosoSales";

/** Column metadata keyed by the exact DAX result column names. */
const columnMetadata: ColumnMetadataMap = {
  "Product[Category]": { name: "ProductCategory", displayName: "Category" },
  "[Revenue]": { name: "Revenue", displayName: "Revenue", format: "$#,0" },
};

/** Revenue grouped by category, optionally filtered by the active slicers. */
export function salesByCategory(filter?: PaintFilter) {
  return { connection, query: applyFilters(baseQuery, filter), columnMetadata };
}
