import type { ColumnMetadataMap } from "@/lib/to-data-table";
import baseQuery from "./top-products.dax?raw";
import { applyFilters, type PaintFilter } from "./_filter";

/** Connection alias from fabric.yaml. */
const connection = "contosoSales";

/** Column metadata keyed by the exact DAX result column names. */
const columnMetadata: ColumnMetadataMap = {
  "Product[Product]": { name: "ProductProduct", displayName: "Product" },
  "Product[Category]": { name: "ProductCategory", displayName: "Category" },
  "[Units]": { name: "Units", displayName: "Units", format: "#,0" },
  "[Revenue]": { name: "Revenue", displayName: "Revenue", format: "$#,0" },
};

/** Top 7 products by revenue, optionally filtered by the active slicers. */
export function topProducts(filter?: PaintFilter) {
  return { connection, query: applyFilters(baseQuery, filter), columnMetadata };
}
