//-----------------------------------------------------------------------
// XP Start menu — the classic two-column green/blue panel.
//-----------------------------------------------------------------------

import type { AppId } from "./useWindowManager";

interface StartMenuProps {
  onLaunch: (id: AppId) => void;
  onClose: () => void;
}

export function StartMenu({ onLaunch, onClose }: StartMenuProps) {
  const launch = (id: AppId) => {
    onLaunch(id);
    onClose();
  };

  return (
    <div className="xp-startmenu" onPointerDown={(e) => e.stopPropagation()}>
      <div className="xp-startmenu-header">
        <div className="xp-startmenu-avatar">🐧</div>
        Fabric User
      </div>

      <div className="xp-startmenu-body">
        <div className="xp-startmenu-left">
          <div className="xp-start-row" onClick={() => launch("paint")}>
            <span className="glyph">🎨</span>
            <div>
              <div>Paint</div>
              <div className="sub">Charts painted from Contoso sales</div>
            </div>
          </div>
          <div className="xp-start-row" onClick={() => launch("messenger")}>
            <span className="glyph">💬</span>
            <div>
              <div>MSN Messenger</div>
              <div className="sub">Chat with your analytics agent</div>
            </div>
          </div>
          <div className="xp-start-row" onClick={() => launch("minesweeper")}>
            <span className="glyph">💣</span>
            <div>
              <div>Minesweeper</div>
              <div className="sub">Don't hit a mine!</div>
            </div>
          </div>
          <div className="xp-start-row" onClick={() => launch("notepad")}>
            <span className="glyph">📝</span>
            <div>
              <div>Notepad</div>
              <div className="sub">readme.txt</div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid #c3d3ea", margin: "6px 4px" }} />
          <div className="xp-start-row">
            <span className="glyph">🌐</span>
            <div>Internet Explorer</div>
          </div>
          <div className="xp-start-row">
            <span className="glyph">📁</span>
            <div>My Documents</div>
          </div>
        </div>

        <div className="xp-startmenu-right">
          <div className="xp-start-row">
            <span className="glyph">💾</span>
            <div>My Computer</div>
          </div>
          <div className="xp-start-row">
            <span className="glyph">🎛️</span>
            <div>Control Panel</div>
          </div>
          <div className="xp-start-row">
            <span className="glyph">🖨️</span>
            <div>Printers</div>
          </div>
          <div className="xp-start-row">
            <span className="glyph">❓</span>
            <div>Help and Support</div>
          </div>
          <div className="xp-start-row">
            <span className="glyph">🔍</span>
            <div>Search</div>
          </div>
        </div>
      </div>

      <div className="xp-startmenu-footer">
        <span className="item" onClick={onClose}>
          🔒 Log Off
        </span>
        <span className="item" onClick={onClose}>
          ⏻ Turn Off Computer
        </span>
      </div>
    </div>
  );
}
