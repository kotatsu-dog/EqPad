export interface ButtonDef {
  label: string;
  icon: string;
  latex: string;
  shortcut?: string;
  /** "text" renders icon as plain text/Unicode, "latex" (default) renders via MathLive */
  iconType?: 'text' | 'latex';
}

export interface ButtonCategory {
  name: string;
  buttons: ButtonDef[];
}

export interface ButtonPack {
  label: string;
  categories: ButtonCategory[];
}

export interface HistoryEntry {
  id: string;
  latex: string;
  timestamp: number;
}

export interface PngOptions {
  scale: number;
  padding: 'small' | 'medium' | 'large';
  background: 'transparent' | 'white';
}
