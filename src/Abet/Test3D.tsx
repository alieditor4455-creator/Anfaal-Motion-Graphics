import React from "react";
import { AbsoluteFill } from "remotion";
import { BgDark } from "./theme";
import { Logo3D } from "./Logo3D";
export const Test3D: React.FC<{ rx: number; ry: number; animals: number; sweep: number; z?: number }> = (p) => (
  <AbsoluteFill><BgDark t={0} by={520} /><Logo3D width={1920} height={1080} {...p} /></AbsoluteFill>
);
