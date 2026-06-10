//-----------------------------------------------------------------------
// Right-click desktop context menu (Arrange Icons, Refresh, plus quick
// launchers for the apps and Properties).
//-----------------------------------------------------------------------

import { useEffect } from "react";
import { APP_IDS, APPS, type AppId } from "./apps/registry";

interface DesktopMenuProps {
  x: number;
  y: number;
  onLaunch: (id: AppId) => void;
  onClose: () => void;
}

export function DesktopMenu({ x, y, onLaunch, onClose }: DesktopMenuProps) {
  useEffect(() => {
    const close = () => onClose();
    window.addEventListener("pointerdown", close);
    return () => window.removeEventListener("pointerdown", close);
  }, [onClose]);

  // Keep the menu on-screen.
  const left = Math.min(x, window.innerWidth - 190);
  const top = Math.min(y, window.innerHeight - 250);

  return (
    <div
      className="xp-ctxmenu"
      style={{ left, top }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="xp-ctx-row disabled">Arrange Icons By ▸</div>
      <div className="xp-ctx-row" onClick={() => { onClose(); location.reload(); }}>
        Refresh
      </div>
      <div className="xp-ctx-sep" />
      {APP_IDS.map((id) => (
        <div key={id} className="xp-ctx-row" onClick={() => { onLaunch(id); onClose(); }}>
          <span className="g">{APPS[id].icon}</span> Open {APPS[id].desktopLabel}
        </div>
      ))}
      <div className="xp-ctx-sep" />
      <div className="xp-ctx-row disabled">Properties</div>
    </div>
  );
}
