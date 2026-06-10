import os, json, base64, subprocess, time, sys

ROOT = r"C:\Users\mlehtola\automate-az-sub\rayfin-paint-app\scripts\contoso-model"
WS = "82d296e2-a0cb-4a4a-b29d-0debe6f44120"
RESOURCE = "https://api.fabric.microsoft.com"
API = "https://api.fabric.microsoft.com/v1"
NAME = "ContosoSales"

parts_files = [
    ("definition.pbism", os.path.join(ROOT, "definition.pbism")),
    ("definition/database.tmdl", os.path.join(ROOT, "definition", "database.tmdl")),
    ("definition/model.tmdl", os.path.join(ROOT, "definition", "model.tmdl")),
    ("definition/relationships.tmdl", os.path.join(ROOT, "definition", "relationships.tmdl")),
    ("definition/tables/Date.tmdl", os.path.join(ROOT, "definition", "tables", "Date.tmdl")),
    ("definition/tables/Region.tmdl", os.path.join(ROOT, "definition", "tables", "Region.tmdl")),
    ("definition/tables/Product.tmdl", os.path.join(ROOT, "definition", "tables", "Product.tmdl")),
    ("definition/tables/Sales.tmdl", os.path.join(ROOT, "definition", "tables", "Sales.tmdl")),
]

parts = []
for path, fp in parts_files:
    with open(fp, "rb") as f:
        b = f.read()
    parts.append({"path": path, "payload": base64.b64encode(b).decode(), "payloadType": "InlineBase64"})

body = {"displayName": NAME, "definition": {"format": "TMDL", "parts": parts}}
body_path = os.path.join(ROOT, "create_body.json")
with open(body_path, "w", encoding="utf-8") as f:
    json.dump(body, f)

def az(args):
    return subprocess.run(["az"] + args, capture_output=True, text=True, shell=True)

# token
tok = az(["account", "get-access-token", "--resource", RESOURCE, "--query", "accessToken", "-o", "tsv"]).stdout.strip()

import urllib.request
req = urllib.request.Request(
    f"{API}/workspaces/{WS}/semanticModels",
    data=json.dumps(body).encode(),
    method="POST",
    headers={"Authorization": f"Bearer {tok}", "Content-Type": "application/json"},
)
def poll(op_loc, retry):
    for i in range(120):
        time.sleep(int(retry) if str(retry).isdigit() else 5)
        tok2 = az(["account", "get-access-token", "--resource", RESOURCE, "--query", "accessToken", "-o", "tsv"]).stdout.strip()
        pr = urllib.request.Request(op_loc, headers={"Authorization": f"Bearer {tok2}"})
        with urllib.request.urlopen(pr) as p:
            pdata = json.loads(p.read().decode())
            st = pdata.get("status")
            print(f"poll {i}: {st}")
            if st in ("Succeeded", "Failed", "Completed"):
                print(json.dumps(pdata, indent=2)[:3000])
                if st in ("Succeeded", "Completed"):
                    rr = urllib.request.Request(op_loc.rstrip("/") + "/result", headers={"Authorization": f"Bearer {tok2}"})
                    try:
                        with urllib.request.urlopen(rr) as r2:
                            print("RESULT:", r2.read().decode()[:1000])
                    except Exception as ex:
                        print("result fetch:", ex)
                return

try:
    resp = urllib.request.urlopen(req)
    print("STATUS", resp.status)
    if resp.status == 202:
        op_loc = resp.headers.get("Location") or resp.headers.get("Operation-Location")
        retry = resp.headers.get("Retry-After", "5")
        print("Location:", op_loc)
        poll(op_loc, retry)
    else:
        print(resp.read().decode())
except urllib.error.HTTPError as e:
    status = e.status
    print("STATUS", status)
    op_loc = e.headers.get("Location") or e.headers.get("Operation-Location")
    retry = e.headers.get("Retry-After", "5")
    print("Location:", op_loc)
    bodytxt = e.read().decode()
    print("BODY:", bodytxt[:2000])
    if status == 202 and op_loc:
        poll(op_loc, retry)
