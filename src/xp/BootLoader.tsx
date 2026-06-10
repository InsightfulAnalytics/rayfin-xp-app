//-----------------------------------------------------------------------
// Windows XP boot sequence: black logo screen with the sliding loading
// bar, then a blue "Welcome" splash, then it hands off to the desktop.
//-----------------------------------------------------------------------

import { useEffect, useState } from "react";

type Phase = "boot" | "welcome";

export function BootLoader({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>("boot");

  useEffect(() => {
    const t1 = window.setTimeout(() => setPhase("welcome"), 3200);
    const t2 = window.setTimeout(onDone, 5000);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [onDone]);

  if (phase === "boot") {
    return (
      <div className="xp-boot" onClick={() => setPhase("welcome")}>
        <div className="xp-boot-logo">
          <div className="xp-boot-flag">
            <span className="r" />
            <span className="g" />
            <span className="b" />
            <span className="y" />
          </div>
          <div className="xp-boot-title">
            <div className="small">Microsoft</div>
            <div className="big">
              Windows<em> Rayfin</em>
            </div>
          </div>
        </div>

        <div className="xp-boot-bar">
          <div className="xp-boot-bar-track">
            <div className="xp-boot-blocks">
              <span className="xp-boot-block" />
              <span className="xp-boot-block" />
              <span className="xp-boot-block" />
            </div>
          </div>
        </div>

        <div className="xp-boot-copyright">
          <div className="ms">Microsoft</div>
          <div>Copyright © Fabric Corporation</div>
        </div>
      </div>
    );
  }

  return (
    <div className="xp-welcome" onClick={onDone}>
      <div className="xp-welcome-bar" />
      <div className="xp-welcome-split">
        <div className="xp-welcome-left">
          <div className="xp-welcome-logo">
            <div className="xp-boot-flag" style={{ width: 34, height: 30 }}>
              <span className="r" />
              <span className="g" />
              <span className="b" />
              <span className="y" />
            </div>
            <span>
              Windows <strong>Rayfin</strong><em>xp</em>
            </span>
          </div>
        </div>
        <div className="xp-welcome-divider" />
        <div className="xp-welcome-right">
          <div className="xp-welcome-user">
            <div className="xp-welcome-tile">🐧</div>
            <div>
              <div className="xp-welcome-name">Fabric User</div>
              <div className="xp-welcome-loading">
                <span className="xp-welcome-spinner" /> logging on…
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="xp-welcome-footer">
        <div className="xp-welcome-bar" />
        <div className="xp-welcome-hint">After logging on, you can use Paint, MSN, Minesweeper &amp; more.</div>
      </div>
    </div>
  );
}
