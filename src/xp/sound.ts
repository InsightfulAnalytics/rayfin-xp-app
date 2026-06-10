//-----------------------------------------------------------------------
// A short, original "startup chime" synthesized with the Web Audio API.
// (Not the real Windows XP sound — that's copyrighted — just a nostalgic
// shimmering arpeggio in the same spirit.)
//-----------------------------------------------------------------------

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  try {
    if (!ctx) ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    return ctx;
  } catch {
    return null;
  }
}

/** Play a gentle bell tone at a frequency, start time, and duration. */
function bell(ac: AudioContext, freq: number, start: number, dur: number, gain = 0.18) {
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  const osc2 = ac.createOscillator();

  osc.type = "sine";
  osc2.type = "triangle";
  osc.frequency.value = freq;
  osc2.frequency.value = freq * 2.01; // slightly detuned shimmer

  amp.gain.setValueAtTime(0, start);
  amp.gain.linearRampToValueAtTime(gain, start + 0.02);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + dur);

  osc.connect(amp);
  osc2.connect(amp);
  amp.connect(ac.destination);
  osc.start(start);
  osc2.start(start);
  osc.stop(start + dur);
  osc2.stop(start + dur);
}

/** The XP-flavored "ta-da" — a quick rising shimmer that resolves up. */
export function playStartupChime() {
  const ac = getCtx();
  if (!ac) return;
  if (ac.state === "suspended") ac.resume().catch(() => {});
  const t = ac.currentTime + 0.04;
  // A major-ish flourish: A4, C#5, E5, A5
  bell(ac, 440.0, t, 1.6, 0.12);
  bell(ac, 554.37, t + 0.12, 1.5, 0.12);
  bell(ac, 659.25, t + 0.24, 1.5, 0.13);
  bell(ac, 880.0, t + 0.36, 1.9, 0.15);
}
