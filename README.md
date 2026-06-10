# 🪟 Rayfin Paint — a Windows XP themed Fabric data app

A *fun* take on a Microsoft Fabric data app, built on the
[`@microsoft/rayfin` Data App template](https://learn.microsoft.com/fabric/apps/data-apps-template).
Instead of a plain dashboard, your analytics live inside a tiny **Windows XP**
desktop:

1. **XP boot loader** — the black logo screen with the sliding loading bar, then
   the blue *welcome* splash.
2. **XP desktop** — Bliss wallpaper, desktop icons, a working Start menu, and a
   taskbar with a live clock.
3. **🎨 MS Paint** — the classic Paint chrome (tool palette + 28-color box) whose
   canvas is a **painted data dashboard**: KPI tiles and hand-drawn `rough.js`
   charts (bar, pie, line, table) fed by a **live Power BI semantic model**, with
   **Region / Category slicers** that re-query the model. All styled with the MS
   Paint palette, thick black outlines, and Comic Sans.
4. **💬 MSN Messenger** — an MSN-style chat window for the **Data Agent**: ask it
   about revenue, regions, trends, top products, or the category mix (Nudge
   included 😄).

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
```

The XP desktop, Data Agent (scripted fallback), Minesweeper and Notepad run
**standalone** at `localhost` — no sign-in needed. The **Paint** dashboard reads
a live *Contoso* Power BI semantic model, so its charts populate only when the
app runs **inside the Fabric portal embed** (see *Running with live Fabric data*
below); standalone, the Paint tiles show a friendly "query failed" note.

Double-click **Sales Visuals (Paint)** or **Data Agent (MSN)** on the desktop
(or use the Start menu) to open the windows.

## Project layout

```
src/
├── App.tsx                 # renders <XPExperience/>
├── xp/
│   ├── XPExperience.tsx     # boot → desktop state machine
│   ├── BootLoader.tsx       # XP boot + welcome screens
│   ├── Desktop.tsx          # wallpaper, icons, windows, Start menu, taskbar
│   ├── Window.tsx           # draggable Luna window chrome
│   ├── Taskbar.tsx / StartMenu.tsx
│   ├── useWindowManager.ts  # open/focus/minimize/z-order
│   ├── xp.css               # all the XP / Paint / MSN styling
│   ├── apps/
│   │   ├── PaintApp.tsx      # MS Paint shell + chart canvas
│   │   └── MessengerApp.tsx  # MSN Messenger chat UI
│   ├── charts/
│   │   └── RoughCharts.tsx   # hand-drawn rough.js bar / pie / line charts
│   └── data/
│       ├── demo-data.ts      # shared types + number formatters (Contoso)
│       ├── paint-live.ts     # maps semantic-model rows → chart shapes
│       ├── paint-meta.ts     # the 28-color Paint palette
│       └── agent-responses.ts# the query-backed Data Agent brain
├── queries/paint/           # .dax queries + factory fns (Region/Category filters)
└── (rayfin/fabric scaffolding: hooks/, lib/, services/ …)
```

## The Data Agent (MSN) — answered by the semantic model

The MSN chat is a small **keyword-intent agent**: it matches your message
(total revenue, best/worst region, trend, top product, category mix) to a
**premade DAX query** and runs it live against the `contosoSales` semantic
model via the same `src/queries/paint` factories the dashboard uses. The reply
is formatted MSN-style (emoji and all 😄, Nudge included).

There is **no LLM and no API key** — answers come straight from the model. Like
the Paint dashboard, live answers require running inside the Fabric portal embed
(`npm run test:fabric`); outside it, the agent replies with a friendly "couldn't
reach the model" note.

## Desktop apps

Double-click an icon, use the Start menu, or right-click the desktop:

| App | What it is |
|---|---|
| 🎨 Paint | The hand-drawn sales dashboard |
| 💬 Data Agent | MSN-style chat answered by live semantic-model queries |
| 💣 Minesweeper | A working 9×9 / 10-mine clone |
| 📝 Notepad | readme.txt |

## Running with live Fabric data

The Paint dashboard is **already wired** to a live Power BI semantic model
(`contosoSales`, registered in `fabric.yaml`). Each visual calls a query factory
in `src/queries/paint/` (a `.dax` query + a `.ts` factory) through the
`useSemanticModelQuery` hook, and the **Region / Category slicers** inject DAX
filters so the whole canvas re-queries on selection.

Because Fabric auth can't be mocked, the live charts only render inside the
Fabric portal embed:

```bash
npm run dev          # serves the app on http://localhost:5173
npm run test:fabric  # opens the Fabric portal embed; sign in once
```

To point it at **your own** model instead:

1. Register it: `npx fabric-app-data add <alias> --from-url "<model URL>"`
   then `npx fabric-app-data generate -o src/fabric.generated.ts`.
2. Add query factories under `src/queries/` (`.dax` + `.ts`) per `AGENTS.md`.
3. Update the column mappings in `src/xp/data/paint-live.ts` and the factories
   the Paint components consume.
4. Deploy: `npx rayfin login` → `npx rayfin up`.

See `AGENTS.md` and the skills in `.agents/skills/` for the full data workflow.

---

## Disclaimer

This is a personal hobby project by **Markus Lehtola**. It is **not affiliated
with, endorsed by, or sponsored by Microsoft.** "Microsoft", "Power BI",
"Fabric", "Windows XP", "MS Paint", and "MSN Messenger" are trademarks of
Microsoft Corporation, used here only for nostalgic/parody purposes.
