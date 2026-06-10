//-----------------------------------------------------------------------
// The XP desktop: wallpaper, double-clickable icons, the live windows,
// the Start menu, a right-click context menu, and the taskbar.
//-----------------------------------------------------------------------

import { useEffect, useState } from "react";
import { Window } from "./Window";
import { Taskbar } from "./Taskbar";
import { StartMenu } from "./StartMenu";
import { DesktopMenu } from "./DesktopMenu";
import { useWindowManager } from "./useWindowManager";
import { APPS, APP_IDS, type AppId } from "./apps/registry";
import { playStartupChime } from "./sound";

// Non-launching shell icons that round out the desktop.
const SHELL_ICONS = [
  { id: "computer", label: "My Computer", glyph: "💻" },
  { id: "recycle", label: "Recycle Bin", glyph: "🗑️" },
] as const;

export function Desktop() {
  const wm = useWindowManager();
  const [startOpen, setStartOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);

  // The nostalgic startup chime, once, when the desktop appears.
  useEffect(() => {
    playStartupChime();
  }, []);

  const dismissOverlays = () => {
    setStartOpen(false);
    setSelected(null);
    setMenu(null);
  };

  return (
    <div
      className="xp-desktop"
      onPointerDown={dismissOverlays}
      onContextMenu={(e) => {
        e.preventDefault();
        setStartOpen(false);
        setMenu({ x: e.clientX, y: e.clientY });
      }}
    >
      <div className="xp-icons" onPointerDown={(e) => e.stopPropagation()}>
        {APP_IDS.map((id) => {
          const app = APPS[id];
          return (
            <div
              key={id}
              className={`xp-icon${selected === id ? " selected" : ""}`}
              onClick={() => setSelected(id)}
              onDoubleClick={() => wm.open(id)}
            >
              <span className="xp-icon-glyph">{app.icon}</span>
              <span className="xp-icon-label">{app.desktopLabel}</span>
            </div>
          );
        })}
        {SHELL_ICONS.map((icon) => (
          <div
            key={icon.id}
            className={`xp-icon${selected === icon.id ? " selected" : ""}`}
            onClick={() => setSelected(icon.id)}
          >
            <span className="xp-icon-glyph">{icon.glyph}</span>
            <span className="xp-icon-label">{icon.label}</span>
          </div>
        ))}
      </div>

      {/* Open windows (registry-driven) */}
      {APP_IDS.map((id) => {
        const win = wm.windows[id];
        if (!win.open || win.minimized) return null;
        const app = APPS[id];
        return (
          <Window
            key={id}
            title={app.title}
            icon={app.icon}
            active={wm.activeId === id}
            z={win.z}
            initial={app.initial}
            onFocus={() => wm.focus(id)}
            onClose={() => wm.close(id)}
            onMinimize={() => wm.minimize(id)}
          >
            {app.render()}
          </Window>
        );
      })}

      {menu && (
        <DesktopMenu
          x={menu.x}
          y={menu.y}
          onClose={() => setMenu(null)}
          onLaunch={(id: AppId) => wm.open(id)}
        />
      )}

      {startOpen && <StartMenu onLaunch={(id) => wm.open(id)} onClose={() => setStartOpen(false)} />}

      <Taskbar
        windows={wm.windows}
        activeId={wm.activeId}
        startOpen={startOpen}
        onStartToggle={() => setStartOpen((s) => !s)}
        onTaskClick={(id) => wm.toggleFromTaskbar(id)}
      />
    </div>
  );
}
