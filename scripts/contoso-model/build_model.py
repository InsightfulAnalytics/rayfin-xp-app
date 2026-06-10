import os, base64, json, io

OUT = r"C:\Users\mlehtola\automate-az-sub\rayfin-paint-app\scripts\contoso-model\definition"
os.makedirs(os.path.join(OUT, "tables"), exist_ok=True)
ROOT = os.path.dirname(OUT)

# ---- source proportions (from the Paint demo dataset) ----
months = [("Jan",1,118000),("Feb",2,132500),("Mar",3,121000),("Apr",4,158300),
          ("May",5,174900),("Jun",6,169400),("Jul",7,191200),("Aug",8,205600),
          ("Sep",9,198300),("Oct",10,221700),("Nov",11,248900),("Dec",12,289400)]

# product -> (category, weight, unit price)
products = [
    ("Contoso Ultrabook 14","Laptops",0.20,1099),
    ("Contoso Studio 16","Laptops",0.14,1499),
    ("Contoso Phone X","Phones",0.15,899),
    ("Contoso Phone SE","Phones",0.12,499),
    ("Contoso Tab Air","Tablets",0.16,599),
    ("Contoso Buds Pro","Audio",0.13,129),
    ("Contoso Watch 2","Other",0.10,249),
]

regions_raw = [("West",524300),("North",482000),("South",351500),("East",298750),("Central",203900)]
rtot = sum(w for _,w in regions_raw)
regions = [(r, w/rtot) for r,w in regions_raw]

# ---- outer-product allocation: every marginal breakdown stays coherent ----
fact_rows = []  # (MonthNo, Product, Region, Units, Revenue)
for mname, mno, mtotal in months:
    for pname, cat, pw, price in products:
        for rname, rw in regions:
            rev = mtotal * pw * rw
            rev_i = int(round(rev))
            units = int(round(rev / price))
            if units < 1:
                units = 1
            fact_rows.append((mno, pname, rname, units, rev_i))

def m_str(s):
    return '"' + s.replace('"', '""') + '"'

def table_literal(coltypes, rows):
    cols = ", ".join(f"{n} = {t}" for n, t in coltypes)
    body = ",\n                    ".join(
        "{" + ", ".join(c for c in r) + "}" for r in rows
    )
    return (
        "#table(\n"
        f"                type table [{cols}],\n"
        "                {\n"
        f"                    {body}\n"
        "                }\n"
        "            )"
    )

# ---------- Date ----------
date_rows = [[m_str(n), str(no)] for n, no, _ in months]
date_tbl = f"""table Date

	column Month
		dataType: string
		summarizeBy: none
		sourceColumn: Month
		sortByColumn: MonthNo

	column MonthNo
		dataType: int64
		isHidden
		summarizeBy: none
		sourceColumn: MonthNo

	partition Date = m
		mode: import
		source =
			let
				Loaded = {table_literal([('Month','text'),('MonthNo','Int64.Type')], date_rows)}
			in
				Loaded
"""

# ---------- Region ----------
region_rows = [[m_str(r)] for r, _ in regions]
region_tbl = f"""table Region

	column Region
		dataType: string
		summarizeBy: none
		sourceColumn: Region

	partition Region = m
		mode: import
		source =
			let
				Loaded = {table_literal([('Region','text')], region_rows)}
			in
				Loaded
"""

# ---------- Product ----------
product_rows = [[m_str(p), m_str(c)] for p, c, _, _ in products]
product_tbl = f"""table Product

	column Product
		dataType: string
		summarizeBy: none
		sourceColumn: Product

	column Category
		dataType: string
		summarizeBy: none
		sourceColumn: Category

	partition Product = m
		mode: import
		source =
			let
				Loaded = {table_literal([('Product','text'),('Category','text')], product_rows)}
			in
				Loaded
"""

# ---------- Sales (fact + measures) ----------
sales_data = [[str(mno), m_str(p), m_str(r), str(u), str(rev)] for (mno, p, r, u, rev) in fact_rows]
sales_literal = table_literal(
    [('MonthNo','Int64.Type'),('Product','text'),('Region','text'),('Units','Int64.Type'),('Revenue','Int64.Type')],
    sales_data,
)
sales_tbl = f"""table Sales

	/// Total sales revenue across the current filter context.
	measure 'Total Revenue' = SUM(Sales[Revenue])
		formatString: \\$#,0

	/// Total number of units sold.
	measure 'Total Units' = SUM(Sales[Units])
		formatString: #,0

	/// Average revenue per unit sold (Total Revenue / Total Units).
	measure 'Avg Order Value' = DIVIDE([Total Revenue], [Total Units])
		formatString: \\$#,0

	/// Share of total revenue contributed by the current category.
	measure 'Category Share %' = DIVIDE([Total Revenue], CALCULATE([Total Revenue], REMOVEFILTERS(Product)))
		formatString: 0.0%

	column MonthNo
		dataType: int64
		isHidden
		summarizeBy: none
		sourceColumn: MonthNo

	column Product
		dataType: string
		isHidden
		summarizeBy: none
		sourceColumn: Product

	column Region
		dataType: string
		isHidden
		summarizeBy: none
		sourceColumn: Region

	column Units
		dataType: int64
		summarizeBy: sum
		sourceColumn: Units

	column Revenue
		dataType: int64
		summarizeBy: sum
		sourceColumn: Revenue

	partition Sales = m
		mode: import
		source =
			let
				Loaded = {sales_literal}
			in
				Loaded
"""

# ---------- relationships ----------
rels = """relationship Sales_to_Date
	fromColumn: Sales.MonthNo
	toColumn: Date.MonthNo

relationship Sales_to_Region
	fromColumn: Sales.Region
	toColumn: Region.Region

relationship Sales_to_Product
	fromColumn: Sales.Product
	toColumn: Product.Product
"""

# ---------- model / database / pbism ----------
model_tmdl = """model Model
	culture: en-US
	defaultPowerBIDataSourceVersion: powerBI_V3
	sourceQueryCulture: en-US

ref table Sales
ref table Date
ref table Region
ref table Product
"""

database_tmdl = """database
	compatibilityLevel: 1702
	compatibilityMode: powerBI
"""

pbism = {
    "$schema": "https://developer.microsoft.com/json-schemas/fabric/item/semanticModel/definitionProperties/1.0.0/schema.json",
    "version": "4.2",
    "settings": {"qnaEnabled": True},
}

def w(path, content):
    with io.open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(content)

w(os.path.join(ROOT, "definition.pbism"), json.dumps(pbism, indent=2))
w(os.path.join(OUT, "database.tmdl"), database_tmdl)
w(os.path.join(OUT, "model.tmdl"), model_tmdl)
w(os.path.join(OUT, "relationships.tmdl"), rels)
w(os.path.join(OUT, "tables", "Date.tmdl"), date_tbl)
w(os.path.join(OUT, "tables", "Region.tmdl"), region_tbl)
w(os.path.join(OUT, "tables", "Product.tmdl"), product_tbl)
w(os.path.join(OUT, "tables", "Sales.tmdl"), sales_tbl)

print("fact rows:", len(fact_rows))
print("total revenue:", sum(r[4] for r in fact_rows))
print("total units:", sum(r[3] for r in fact_rows))
print("wrote TMDL to", ROOT)
