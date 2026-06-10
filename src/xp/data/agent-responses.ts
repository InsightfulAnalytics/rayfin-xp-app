//-----------------------------------------------------------------------
// "Data Agent" brain — answers MSN chat messages with LIVE data from the
// `contosoSales` Power BI semantic model.
//
// It keyword-matches the user's message to an intent, runs a premade DAX
// query (reusing the factories in `src/queries/paint`), and formats the
// result in an MSN-flavored reply. No LLM / Foundry — just the model.
//-----------------------------------------------------------------------

import {
  revenueByRegion,
  salesByCategory,
  revenueTrend,
  topProducts,
  kpis,
} from "@/queries/paint";
import { getFabricClient } from "@/lib/fabric-client";
import { fmtMoney } from "./demo-data";
import {
  toRegionRows,
  toCategoryRows,
  toTrendRows,
  toProductRows,
  toKpis,
} from "./paint-live";

export interface AgentReply {
  text: string;
  /** When true, the UI renders a "nudge" buzz before the message. */
  nudge?: boolean;
}

const pct = (a: number, b: number) => `${(((a - b) / b) * 100).toFixed(1)}%`;

/** Run a premade query factory and return its result table (throws on failure). */
async function fetchTable(factory: { connection: string; query: string }) {
  const res = await getFabricClient().semanticModel(factory.connection).query(factory.query);
  if (res.status !== "success") {
    throw new Error(res.status === "error" ? res.error.message : "no data returned");
  }
  return res.table;
}

/** Friendly message shown when the model can't be reached (e.g. running outside the Fabric embed). */
const OFFLINE =
  "Hmm, I couldn't reach the Contoso model just now 😬 — I can only pull live data when running inside the Fabric portal. Try again from there!";

/**
 * Answer a chat message using premade semantic-model queries.
 * Static intents (greeting, help, etc.) reply instantly; data intents query
 * the model and gracefully degrade to {@link OFFLINE} if it's unavailable.
 */
export async function getAgentReply(raw: string): Promise<AgentReply> {
  const q = raw.toLowerCase().trim();

  if (!q) return { text: "Type something and I'll dig into the Contoso data for you! 🙂" };

  if (/\b(hi|hello|hey|yo|sup|hallo|moi)\b/.test(q)) {
    return { text: "Hey! 😃 I'm your Data Agent. Ask me about revenue, regions, trends, top products, or categories." };
  }

  if (/\b(nudge|buzz|wake)\b/.test(q)) {
    return { nudge: true, text: "Hey hey, I'm right here! 😅 What do you need?" };
  }

  if (/\b(help|what can you|commands|menu)\b/.test(q)) {
    return {
      text:
        "I run live queries against the Contoso model. Try:\n" +
        "• \"total revenue\"\n" +
        "• \"best region\" / \"worst region\"\n" +
        "• \"trend\" or \"growth\"\n" +
        "• \"top product\"\n" +
        "• \"category mix\"\nGo on, try one! ✨",
    };
  }

  if (/\b(thanks|thank you|ty|cheers|kiitos)\b/.test(q)) {
    return { text: "Anytime! 😄 Ping me whenever you need more numbers." };
  }

  if (/\b(bye|goodbye|cya|later)\b/.test(q)) {
    return { text: "Catch you later! 👋 *Data Agent has signed off... jk, still here.*" };
  }

  try {
    if (
      /\b(total|overall|sum).*(rev|sales|money)|total revenue|how much.*(made|sell|sold)/.test(q) ||
      (/\brevenue\b/.test(q) && /\btotal\b/.test(q)) ||
      /\b(kpi|summary|overview)\b/.test(q)
    ) {
      const k = toKpis(await fetchTable(kpis()));
      if (!k) return { text: OFFLINE };
      return {
        text: `Total revenue is ${fmtMoney(k.totalRevenue)} across ${k.totalUnits.toLocaleString()} units sold. Average order value sits at $${k.avgOrder}. 💰`,
      };
    }

    if (/\b(best|top|highest|leading|winner).*(region|area|territory)|which region/.test(q)) {
      const rows = toRegionRows(await fetchTable(revenueByRegion()));
      const best = rows[0];
      return { text: `🏆 ${best.region} is your strongest region at ${fmtMoney(best.revenue)}. It's carrying the team this year!` };
    }

    if (/\b(worst|lowest|weakest|bottom).*(region|area)/.test(q)) {
      const rows = toRegionRows(await fetchTable(revenueByRegion()));
      const worst = rows[rows.length - 1];
      return { text: `${worst.region} is lagging at ${fmtMoney(worst.revenue)}. Might be worth a closer look. 🔎` };
    }

    if (/\bregion|area|territor/.test(q)) {
      const rows = toRegionRows(await fetchTable(revenueByRegion()));
      return {
        text:
          "Revenue by region:\n" +
          rows.map((r, i) => `${i + 1}. ${r.region} — ${fmtMoney(r.revenue)}`).join("\n"),
      };
    }

    if (/\b(trend|growth|over time|monthly|month|grow|trajectory)\b/.test(q)) {
      const rows = toTrendRows(await fetchTable(revenueTrend()));
      const first = rows[0];
      const last = rows[rows.length - 1];
      const peak = [...rows].sort((a, b) => b.revenue - a.revenue)[0];
      return {
        text: `📈 Revenue went from ${fmtMoney(first.revenue)} in ${first.month} to ${fmtMoney(last.revenue)} in ${last.month} — that's ${pct(last.revenue, first.revenue)} change! Best month was ${peak.month} (${fmtMoney(peak.revenue)}).`,
      };
    }

    if (/\b(top|best|hot).*(product|item|sku)|what.*sell|bestseller/.test(q)) {
      const rows = toProductRows(await fetchTable(topProducts()));
      const byRev = rows[0];
      const byUnits = [...rows].sort((a, b) => b.units - a.units)[0];
      return {
        text: `🥇 Top product by revenue: ${byRev.product} (${fmtMoney(byRev.revenue)}).\nBy units sold it's ${byUnits.product} (${byUnits.units.toLocaleString()} units). Nice movers!`,
      };
    }

    if (/\bcategor|mix|breakdown|segment|split\b/.test(q)) {
      const rows = toCategoryRows(await fetchTable(salesByCategory()));
      return {
        text:
          "Category mix (% of sales):\n" +
          rows.map((c) => `• ${c.category}: ${c.share}%`).join("\n") +
          `\n${rows[0].category} leads the pack. 🥧`,
      };
    }
  } catch {
    return { text: OFFLINE };
  }

  return {
    text:
      "Hmm, I'm not sure about that one 🤔 — but I can query: total revenue, regions, trends, top products, and category mix. Try one of those!",
  };
}

/** Fun rotating "is typing" flavor lines. */
export const TYPING_LINES = [
  "Data Agent is writing a message...",
  "Data Agent is querying the model...",
  "Data Agent is crunching numbers...",
];
