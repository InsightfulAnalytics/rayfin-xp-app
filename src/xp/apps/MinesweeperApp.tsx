//-----------------------------------------------------------------------
// Minesweeper — a compact, working clone (9x9, 10 mines) with the classic
// beveled look, mine counter, smiley reset button, and a timer.
//-----------------------------------------------------------------------

import { useCallback, useEffect, useRef, useState } from "react";

const SIZE = 9;
const MINES = 10;

interface Cell {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  count: number;
}

type Board = Cell[][];
type Status = "ready" | "playing" | "won" | "lost";

const NUM_COLORS = ["", "#0000ff", "#008000", "#ff0000", "#000080", "#800000", "#008080", "#000000", "#808080"];

function emptyBoard(): Board {
  return Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => ({ mine: false, revealed: false, flagged: false, count: 0 })),
  );
}

/** Place mines avoiding the first-clicked cell, then compute neighbor counts. */
function plant(board: Board, safeR: number, safeC: number): Board {
  const b = board.map((row) => row.map((c) => ({ ...c })));
  let placed = 0;
  while (placed < MINES) {
    const r = Math.floor(Math.random() * SIZE);
    const c = Math.floor(Math.random() * SIZE);
    if (b[r][c].mine || (r === safeR && c === safeC)) continue;
    b[r][c].mine = true;
    placed++;
  }
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (b[r][c].mine) continue;
      let n = 0;
      for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < SIZE && nc >= 0 && nc < SIZE && b[nr][nc].mine) n++;
        }
      b[r][c].count = n;
    }
  }
  return b;
}

function floodReveal(b: Board, r: number, c: number) {
  if (r < 0 || r >= SIZE || c < 0 || c >= SIZE) return;
  const cell = b[r][c];
  if (cell.revealed || cell.flagged) return;
  cell.revealed = true;
  if (cell.count === 0 && !cell.mine) {
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) if (dr || dc) floodReveal(b, r + dr, c + dc);
  }
}

export function MinesweeperApp() {
  const [board, setBoard] = useState<Board>(emptyBoard);
  const [status, setStatus] = useState<Status>("ready");
  const [flags, setFlags] = useState(0);
  const [time, setTime] = useState(0);
  const timer = useRef<number | null>(null);

  const stopTimer = useCallback(() => {
    if (timer.current) window.clearInterval(timer.current);
    timer.current = null;
  }, []);

  useEffect(() => stopTimer, [stopTimer]);

  function reset() {
    stopTimer();
    setBoard(emptyBoard());
    setStatus("ready");
    setFlags(0);
    setTime(0);
  }

  function startTimer() {
    stopTimer();
    timer.current = window.setInterval(() => setTime((t) => Math.min(999, t + 1)), 1000);
  }

  function reveal(r: number, c: number) {
    if (status === "won" || status === "lost") return;
    let b = board;
    if (status === "ready") {
      b = plant(board, r, c);
      setStatus("playing");
      startTimer();
    }
    b = b.map((row) => row.map((cell) => ({ ...cell })));
    if (b[r][c].flagged || b[r][c].revealed) return;

    if (b[r][c].mine) {
      b.forEach((row) => row.forEach((cell) => { if (cell.mine) cell.revealed = true; }));
      setBoard(b);
      setStatus("lost");
      stopTimer();
      return;
    }
    floodReveal(b, r, c);
    setBoard(b);

    const safe = b.flat().filter((cell) => !cell.mine);
    if (safe.every((cell) => cell.revealed)) {
      setStatus("won");
      stopTimer();
    }
  }

  function toggleFlag(e: React.MouseEvent, r: number, c: number) {
    e.preventDefault();
    e.stopPropagation();
    if (status === "won" || status === "lost" || board[r][c].revealed) return;
    const b = board.map((row) => row.map((cell) => ({ ...cell })));
    b[r][c].flagged = !b[r][c].flagged;
    setBoard(b);
    setFlags(b.flat().filter((cell) => cell.flagged).length);
  }

  const face = status === "lost" ? "😵" : status === "won" ? "😎" : "🙂";
  const remaining = String(Math.max(0, MINES - flags)).padStart(3, "0");
  const clock = String(time).padStart(3, "0");

  return (
    <div className="ms-body">
      <div className="ms-frame">
        <div className="ms-hud">
          <div className="ms-lcd">{remaining}</div>
          <button className="ms-face" onClick={reset} title="New game">
            {face}
          </button>
          <div className="ms-lcd">{clock}</div>
        </div>
        <div className="ms-grid">
          {board.map((row, r) => (
            <div className="ms-row" key={r}>
              {row.map((cell, c) => {
                const cls = cell.revealed
                  ? `ms-cell open${cell.mine ? " mine" : ""}`
                  : "ms-cell";
                return (
                  <button
                    key={c}
                    className={cls}
                    onClick={() => reveal(r, c)}
                    onContextMenu={(e) => toggleFlag(e, r, c)}
                    style={cell.revealed && !cell.mine && cell.count ? { color: NUM_COLORS[cell.count] } : undefined}
                  >
                    {cell.revealed
                      ? cell.mine
                        ? "💣"
                        : cell.count || ""
                      : cell.flagged
                        ? "🚩"
                        : ""}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="ms-status">
        {status === "won" ? "You win! 🎉 Click the face to play again." : status === "lost" ? "Boom! 💥 Click the face to retry." : "Left-click to dig · Right-click to flag"}
      </div>
    </div>
  );
}
