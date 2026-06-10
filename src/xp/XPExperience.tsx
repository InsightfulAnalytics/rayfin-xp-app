//-----------------------------------------------------------------------
// Top-level Windows XP experience: boot sequence → desktop.
//-----------------------------------------------------------------------

import { useState } from "react";
import { BootLoader } from "./BootLoader";
import { Desktop } from "./Desktop";
import "./xp.css";

export function XPExperience() {
  const [booted, setBooted] = useState(false);

  return (
    <div className="xp-root">
      {booted ? <Desktop /> : <BootLoader onDone={() => setBooted(true)} />}
    </div>
  );
}
