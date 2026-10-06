"""Deploy the bundled Contoso Sales semantic model (TMDL) to a Fabric workspace.

Portable version of deploy.py: reads the definition files relative to this
script and targets the workspace passed on the command line. Uses an
az-issued Fabric API token (no gateway/credentials needed — the model is
import mode with data baked into the TMDL).

Usage:
    python deploy_to_workspace.py <workspaceId> [displayName]
"""
import os, json, base64, subprocess, time, sys
import urllib.request, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
RESOURCE = "https://api.fabric.microsoft.com"
API = "https://api.fabric.microsoft.com/v1"

WS = sys.argv[1] if len(sys.argv) > 1 else None
NAME = sys.argv[2] if len(sys.argv) > 2 else "ContosoSales"
if not WS:
    print("Usage: python deploy_to_workspace.py <workspaceId> [displayName]")
    sys.exit(1)

parts_files = [
    ("definition.pbism", os.path.join(HERE, "definition.pbism")),
    ("definition/database.tmdl", os.path.join(HERE, "definition", "database.tmdl")),
    ("definition/model.tmdl", os.path.join(HERE, "definition", "model.tmdl")),
    ("definition/relationships.tmdl", os.path.join(HERE, "definition", "relationships.tmdl")),
    ("definition/tables/Date.tmdl", os.path.join(HERE, "definition", "tables", "Date.tmdl")),
    ("definition/tables/Region.tmdl", os.path.join(HERE, "definition", "tables", "Region.tmdl")),
    ("definition/tables/Product.tmdl", os.path.join(HERE, "definition", "tables", "Product.tmdl")),
    ("definition/tables/Sales.tmdl", os.path.join(HERE, "definition", "tables", "Sales.tmdl")),
]

parts = []
for path, fp in parts_files:
    with open(fp, "rb") as f:
        b = f.read()
    parts.append({"path": path, "payload": base64.b64encode(b).decode(), "payloadType": "InlineBase64"})

body = {"displayName": NAME, "definition": {"format": "TMDL", "parts": parts}}

def az(args):
    return subprocess.run(["az"] + args, capture_output=True, text=True, shell=True)

def token():
    return az(["account", "get-access-token", "--resource", RESOURCE, "--query", "accessToken", "-o", "tsv"]).stdout.strip()

def poll(op_loc, retry):
    for i in range(120):
        time.sleep(int(retry) if str(retry).isdigit() else 5)
        pr = urllib.request.Request(op_loc, headers={"Authorization": f"Bearer {token()}"})
        with urllib.request.urlopen(pr) as p:
            pdata = json.loads(p.read().decode())
            st = pdata.get("status")
            print(f"poll {i}: {st}")
            if st in ("Succeeded", "Failed", "Completed"):
                print(json.dumps(pdata, indent=2)[:3000])
                if st in ("Succeeded", "Completed"):
                    rr = urllib.request.Request(op_loc.rstrip("/") + "/result", headers={"Authorization": f"Bearer {token()}"})
                    try:
                        with urllib.request.urlopen(rr) as r2:
                            print("RESULT:", r2.read().decode()[:1500])
                    except Exception as ex:
                        print("result fetch:", ex)
                return

req = urllib.request.Request(
    f"{API}/workspaces/{WS}/semanticModels",
    data=json.dumps(body).encode(),
    method="POST",
    headers={"Authorization": f"Bearer {token()}", "Content-Type": "application/json"},
)
try:
    resp = urllib.request.urlopen(req)
    print("STATUS", resp.status)
    if resp.status == 202:
        op_loc = resp.headers.get("Location") or resp.headers.get("Operation-Location")
        poll(op_loc, resp.headers.get("Retry-After", "5"))
    else:
        print(resp.read().decode())
except urllib.error.HTTPError as e:
    print("STATUS", e.status)
    op_loc = e.headers.get("Location") or e.headers.get("Operation-Location")
    bodytxt = e.read().decode()
    print("BODY:", bodytxt[:2000])
    if e.status == 202 and op_loc:
        poll(op_loc, e.headers.get("Retry-After", "5"))
