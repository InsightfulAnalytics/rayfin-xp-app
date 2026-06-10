//-----------------------------------------------------------------------
// Notepad — a plain text editor, pre-loaded with a nostalgic readme.
//-----------------------------------------------------------------------

import { useState } from "react";

const README = `      W I N D O W S   R A Y F I N   X P
      ================================

Welcome to Rayfin Paint XP! :)

This little desktop is a Microsoft Fabric data app wearing
its Sunday best — a Windows XP costume.

  * Paint .......... your sales dashboard, hand-drawn in crayon
  * Data Agent ..... chat with an AI analyst (MSN style!)
  * Minesweeper .... because every XP needs one
  * Notepad ........ you are here

Tip: double-click a window title bar to maximize it.
Tip: nudge the Data Agent if it gets sleepy. ;)

Built with React + Vite on the @microsoft/rayfin template.
Wallpaper: "Bliss" (Microsoft) — homage use.

         -- have fun, and don't forget to save! --
`;

export function NotepadApp() {
  const [text, setText] = useState(README);

  return (
    <div className="np-body">
      <div className="xp-menubar">
        {["File", "Edit", "Format", "View", "Help"].map((m) => (
          <span className="xp-menu-item" key={m}>
            {m}
          </span>
        ))}
      </div>
      <textarea
        className="np-text xp-scroll"
        spellCheck={false}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </div>
  );
}
