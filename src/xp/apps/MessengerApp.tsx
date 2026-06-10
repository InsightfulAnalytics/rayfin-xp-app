//-----------------------------------------------------------------------
// "Data Agent - Conversation" — an MSN Messenger style chat.
//
// Answers come from premade DAX queries against the `contosoSales`
// semantic model (see agent-responses.ts). No LLM / Foundry.
//-----------------------------------------------------------------------

import { useEffect, useRef, useState } from "react";
import { TYPING_LINES, getAgentReply } from "../data/agent-responses";

interface Line {
  who: "me" | "them";
  name: string;
  text: string;
}

const GREETING: Line = {
  who: "them",
  name: "Data Agent",
  text: "Hi there! 😃 I'm your Data Agent. Ask me anything about the Contoso sales data — try \"total revenue\" or \"best region\".",
};

const QUICK = [
  "total revenue",
  "best region",
  "show the trend",
  "top product",
  "category mix",
];

const emoticons = ["🙂", "😃", "😉", "😎", "📊", "💰", "🏆", "✨"];

export function MessengerApp() {
  const [lines, setLines] = useState<Line[]>([GREETING]);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState<string | null>(null);
  const [nudge, setNudge] = useState(false);
  const convoRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    convoRef.current?.scrollTo({ top: convoRef.current.scrollHeight, behavior: "smooth" });
  }, [lines, typing]);

  async function send(text: string) {
    const msg = text.trim();
    if (!msg || typing) return;
    setDraft("");

    const userLine: Line = { who: "me", name: "You", text: msg };
    setLines([...lines, userLine]);

    setTyping(TYPING_LINES[Math.floor(Math.random() * TYPING_LINES.length)]);

    // Keep a minimum "typing" beat so it feels like MSN even on a fast reply.
    const [reply] = await Promise.all([
      getAgentReply(msg),
      new Promise((r) => window.setTimeout(r, 650)),
    ]);

    setTyping(null);
    setLines((l) => [...l, { who: "them", name: "Data Agent", text: reply.text }]);
  }

  function buzz() {
    setNudge(true);
    setLines((l) => [...l, { who: "me", name: "You", text: "⚡ You have just sent a Nudge!" }]);
    window.setTimeout(() => setNudge(false), 600);
    setTyping(TYPING_LINES[1]);
    window.setTimeout(() => {
      setTyping(null);
      setLines((l) => [...l, { who: "them", name: "Data Agent", text: "Aaack! 😵 Okay okay, I'm awake. What do you need?" }]);
    }, 900);
  }

  return (
    <div className={`msn-body${nudge ? " msn-shake" : ""}`} ref={bodyRef}>
      <div className="msn-header">
        <div className="msn-contact-avatar">
          🤖<span className="msn-status-dot" />
        </div>
        <div>
          <div className="msn-contact-name">Data Agent &lt;datagent@contoso.live.com&gt;</div>
          <div className="msn-contact-status">Online — Ready to analyze 📊</div>
        </div>
      </div>

      <div className="msn-toolbar">
        <span className="tb">✉️ Invite</span>
        <span className="tb">📁 Send Files</span>
        <span className="tb">🎮 Games</span>
        <span className="tb">📹 Webcam</span>
        <span className="tb" onClick={buzz} title="Send a Nudge">
          ⚡ Nudge
        </span>
      </div>

      <div className="msn-convo xp-scroll" ref={convoRef}>
        {lines.map((l, i) => (
          <div key={i} className={`msn-line ${l.who}`}>
            {l.text.startsWith("⚡") ? (
              <div className="msn-nudge">{l.text}</div>
            ) : (
              <>
                <span className="who">{l.name} says:</span>{" "}
                <span className="text">{l.text}</span>
              </>
            )}
          </div>
        ))}
        {typing ? <div className="msn-typing">{typing}</div> : null}
      </div>

      <div className="msn-quick">
        {QUICK.map((q) => (
          <button key={q} onClick={() => send(q)}>
            {q}
          </button>
        ))}
      </div>

      <div className="msn-input-area">
        <div className="msn-input-tools">
          {emoticons.map((e) => (
            <span key={e} onClick={() => setDraft((d) => d + e)} title="Insert emoticon">
              {e}
            </span>
          ))}
        </div>
        <div className="msn-input-row">
          <textarea
            className="msn-input"
            value={draft}
            placeholder="Type a message..."
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(draft);
              }
            }}
          />
          <button className="msn-send" onClick={() => send(draft)}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
