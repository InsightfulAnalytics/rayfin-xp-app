//-----------------------------------------------------------------------
// XP taskbar: Start button, running-app buttons, system tray + clock.
//-----------------------------------------------------------------------

import { useEffect, useState } from "react";
import type { AppId, WindowState } from "./useWindowManager";
import { APPS } from "./apps/registry";

interface TaskbarProps {
  windows: Record<AppId, WindowState>;
  activeId: AppId | null;
  startOpen: boolean;
  onStartToggle: () => void;
  onTaskClick: (id: AppId) => void;
}

function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000 * 15);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

export function Taskbar({
  windows,
  activeId,
  startOpen,
  onStartToggle,
  onTaskClick,
}: TaskbarProps) {
  const now = useClock();
  const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  const running = (Object.values(windows) as WindowState[]).filter((w) => w.open);

  return (
    <div className="xp-taskbar">
      <button className={`xp-start-btn${startOpen ? " open" : ""}`} onClick={onStartToggle}>
        <span className="xp-start-orb">🪟</span>
        start
      </button>

      <div className="xp-tasks">
        {running.map((w) => (
          <button
            key={w.id}
            className={`xp-task${activeId === w.id && !w.minimized ? " active" : ""}`}
            onClick={() => onTaskClick(w.id)}
          >
            <span>{APPS[w.id].icon}</span>
            <span className="label">{APPS[w.id].title}</span>
          </button>
        ))}
      </div>

      <div className="xp-tray">
        <span title="Volume">🔊</span>
        <span title="Network">🖧</span>
        <div className="xp-clock">{time}</div>
      </div>
    </div>
  );
}
