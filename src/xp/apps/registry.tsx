//-----------------------------------------------------------------------
// Registry of desktop applications. Each entry knows its window title,
// icon, default geometry, and which component to render. The desktop,
// taskbar, start menu, and window manager are all driven by this list.
//-----------------------------------------------------------------------

import type { ReactNode } from "react";
import { PaintApp } from "./PaintApp";
import { MessengerApp } from "./MessengerApp";
import { NotepadApp } from "./NotepadApp";
import { MinesweeperApp } from "./MinesweeperApp";

export type AppId = "paint" | "messenger" | "notepad" | "minesweeper";

export interface AppDef {
  id: AppId;
  /** Title-bar / taskbar caption. */
  title: string;
  /** Emoji icon used across the desktop, taskbar, and start menu. */
  icon: string;
  /** Label shown under the desktop icon (may differ from title). */
  desktopLabel: string;
  initial: { x: number; y: number; width: number; height: number };
  render: () => ReactNode;
}

export const APPS: Record<AppId, AppDef> = {
  paint: {
    id: "paint",
    title: "untitled - Paint",
    icon: "🎨",
    desktopLabel: "Paint",
    initial: { x: 70, y: 30, width: 720, height: 560 },
    render: () => <PaintApp />,
  },
  messenger: {
    id: "messenger",
    title: "Data Agent - Conversation",
    icon: "💬",
    desktopLabel: "MSN Messenger",
    initial: { x: 540, y: 90, width: 380, height: 500 },
    render: () => <MessengerApp />,
  },
  notepad: {
    id: "notepad",
    title: "readme.txt - Notepad",
    icon: "📝",
    desktopLabel: "readme.txt",
    initial: { x: 210, y: 110, width: 460, height: 360 },
    render: () => <NotepadApp />,
  },
  minesweeper: {
    id: "minesweeper",
    title: "Minesweeper",
    icon: "💣",
    desktopLabel: "Minesweeper",
    initial: { x: 320, y: 70, width: 280, height: 360 },
    render: () => <MinesweeperApp />,
  },
};

export const APP_IDS = Object.keys(APPS) as AppId[];
