//-----------------------------------------------------------------------
// Draggable Windows XP "Luna" window chrome (title bar + min/max/close).
//-----------------------------------------------------------------------

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

interface WindowProps {
  title: string;
  icon?: ReactNode;
  active: boolean;
  z: number;
  initial: { x: number; y: number; width: number; height: number };
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  children: ReactNode;
}

export function Window({
  title,
  icon,
  active,
  z,
  initial,
  onFocus,
  onClose,
  onMinimize,
  children,
}: WindowProps) {
  const [pos, setPos] = useState({ x: initial.x, y: initial.y });
  const [maximized, setMaximized] = useState(false);
  const drag = useRef<{ dx: number; dy: number } | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (maximized) return;
      onFocus();
      drag.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    [maximized, onFocus, pos.x, pos.y],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!drag.current) return;
    const x = Math.max(-40, e.clientX - drag.current.dx);
    const y = Math.max(0, Math.min(window.innerHeight - 60, e.clientY - drag.current.dy));
    setPos({ x, y });
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    drag.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }, []);

  // Keep maximized windows clear of the 30px taskbar.
  const style: CSSProperties = maximized
    ? { left: 0, top: 0, width: "100vw", height: "calc(100vh - 30px)", borderRadius: 0, zIndex: z }
    : { left: pos.x, top: pos.y, width: initial.width, height: initial.height, zIndex: z };

  useEffect(() => {
    // Clamp into view if the viewport is smaller than the initial offset.
    setPos((p) => ({
      x: Math.min(p.x, Math.max(0, window.innerWidth - 260)),
      y: Math.min(p.y, Math.max(0, window.innerHeight - 120)),
    }));
  }, []);

  return (
    <div
      className={`xp-window${active ? "" : " inactive"}`}
      style={style}
      onPointerDown={onFocus}
    >
      <div
        className="xp-titlebar"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onDoubleClick={() => setMaximized((m) => !m)}
      >
        {icon ? <span className="xp-title-icon">{icon}</span> : null}
        <span className="xp-title-text">{title}</span>
        <div className="xp-title-btns">
          <button
            className="xp-title-btn"
            title="Minimize"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }}
          >
            _
          </button>
          <button
            className="xp-title-btn"
            title="Maximize"
            onClick={(e) => {
              e.stopPropagation();
              setMaximized((m) => !m);
            }}
          >
            ▢
          </button>
          <button
            className="xp-title-btn close"
            title="Close"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            ✕
          </button>
        </div>
      </div>
      <div className="xp-window-body">{children}</div>
    </div>
  );
}
