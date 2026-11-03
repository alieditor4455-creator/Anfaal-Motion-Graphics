import { Composition, Still } from "remotion";
import { AN_FRAMES, AnfaalReel } from "./Anfaal/Reel";
import { AnfaalCover } from "./Anfaal/Cover";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="AnfaalReel" component={AnfaalReel} durationInFrames={AN_FRAMES} fps={30} width={1080} height={1920} />
    <Still id="AnfaalCover" component={AnfaalCover} width={1080} height={1920} />
  </>
);
