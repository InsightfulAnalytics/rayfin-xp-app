//-----------------------------------------------------------------------
// Window manager: tracks which app windows are open, focused, minimized,
// and their z-order. Driven by the app registry so adding an app is just
// a registry entry.
//-----------------------------------------------------------------------

import { useCallback, useState } from "react";
import { APP_IDS, type AppId } from "./apps/registry";

export type { AppId };

export interface WindowState {
  id: AppId;
  open: boolean;
  minimized: boolean;
  z: number;
}

const INITIAL: Record<AppId, WindowState> = Object.fromEntries(
  APP_IDS.map((id) => [id, { id, open: false, minimized: false, z: 1 }]),
) as Record<AppId, WindowState>;

export function useWindowManager() {
  const [windows, setWindows] = useState<Record<AppId, WindowState>>(INITIAL);
  const [, setTopZ] = useState(10);
  const [activeId, setActiveId] = useState<AppId | null>(null);

  const focus = useCallback((id: AppId) => {
    setTopZ((z) => {
      const next = z + 1;
      setWindows((w) => ({ ...w, [id]: { ...w[id], z: next, minimized: false } }));
      return next;
    });
    setActiveId(id);
  }, []);

  const open = useCallback(
    (id: AppId) => {
      setWindows((w) => ({ ...w, [id]: { ...w[id], open: true, minimized: false } }));
      focus(id);
    },
    [focus],
  );

  const close = useCallback((id: AppId) => {
    setWindows((w) => ({ ...w, [id]: { ...INITIAL[id] } }));
    setActiveId((cur) => (cur === id ? null : cur));
  }, []);

  const minimize = useCallback((id: AppId) => {
    setWindows((w) => ({ ...w, [id]: { ...w[id], minimized: true } }));
    setActiveId((cur) => (cur === id ? null : cur));
  }, []);

  /** Toggle from a taskbar click: minimize if active, else focus/restore. */
  const toggleFromTaskbar = useCallback(
    (id: AppId) => {
      const win = windows[id];
      if (!win.minimized && activeId === id) {
        minimize(id);
      } else {
        focus(id);
      }
    },
    [activeId, focus, minimize, windows],
  );

  return { windows, activeId, open, close, minimize, focus, toggleFromTaskbar };
}
