//-----------------------------------------------------------------------
// Shared filter injection for the Paint dashboard queries.
//
// Each `.dax` base query contains a `/*__FILTERS__*/` placeholder sitting
// inside a CALCULATETABLE(...) argument list. `applyFilters` replaces it
// with the active slicer predicates (Region and/or Category), or removes it
// when nothing is selected.
//-----------------------------------------------------------------------

/** Active slicer selection. `null`/`undefined` means "All". */
export interface PaintFilter {
  region?: string | null;
  category?: string | null;
}

/** Escape a value for safe inclusion inside a DAX string literal. */
const escapeDax = (value: string): string => value.replace(/"/g, '""');

/**
 * Replace the filter placeholder in a base DAX query with the active
 * Region/Category predicates. Returns the base query with the placeholder
 * removed when no filters are active.
 */
export function applyFilters(baseQuery: string, filter?: PaintFilter): string {
  const parts: string[] = [];
  if (filter?.region) parts.push(`Region[Region] = "${escapeDax(filter.region)}"`);
  if (filter?.category) parts.push(`Product[Category] = "${escapeDax(filter.category)}"`);
  const injection = parts.length ? `, ${parts.join(", ")}` : "";
  return baseQuery.replace("/*__FILTERS__*/", injection);
}
