// JSON format read by AnfaalBuilder.jsx. Times are seconds on the FINAL timeline.
export type Tone = "hue" | "gold" | "red" | "white";
export type Item = {
  type: "image" | "label" | "title" | "text" | "pill" | "button" | "card" | "counter" | "needle" | "rect";
  at?: number; out?: number | null; x?: number; y: number; [k: string]: unknown;
};
export type ReelSpec = {
  name: string; width: number; height: number; fps: number; duration: number;
  palette: Record<string, string>;
  fonts: Record<"head" | "body" | "label" | "mono", string | { family: string; style?: string; ps?: string }>;
  background?: { file: string; from?: number[]; to?: number[]; opacity?: number };
  speaker?: { file: string; anchorY?: number; scale?: number; openZoom?: boolean; segments: { at: number; srcIn: number; srcOut: number; punch?: boolean }[] };
  keywords: { t: number; to: number; lead: string; key: string; tone: Tone | string; y: number; scale?: number }[];
  onCamera: Item[];
  fullscreens: { name: string; from: number; to: number; bgFile?: string; bgOpacity?: number; items: Item[] }[];
  captions: { t0: number; t1: number; y: number; words: { w: string; t0: number; hot?: string }[] }[];
  transitions: number[];
  endFade?: number;
  grain?: boolean;
  audio: { role?: string; file: string; at: number; gain?: number }[];
};
