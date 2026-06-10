import type { ColumnMetadataMap } from "@/lib/to-data-table";
import regionsQuery from "./slicer-regions.dax?raw";
import categoriesQuery from "./slicer-categories.dax?raw";

/** Connection alias from fabric.yaml. */
const connection = "contosoSales";

const regionMetadata: ColumnMetadataMap = {
  "Region[Region]": { name: "RegionRegion", displayName: "Region" },
};

const categoryMetadata: ColumnMetadataMap = {
  "Product[Category]": { name: "ProductCategory", displayName: "Category" },
};

/** Distinct region values for the Region slicer dropdown. */
export function slicerRegions() {
  return { connection, query: regionsQuery, columnMetadata: regionMetadata };
}

/** Distinct category values for the Category slicer dropdown. */
export function slicerCategories() {
  return { connection, query: categoriesQuery, columnMetadata: categoryMetadata };
}
