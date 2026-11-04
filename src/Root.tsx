import { Composition, Still } from "remotion";
import { AN_FRAMES, AnfaalReel } from "./Anfaal/Reel";
import { AnfaalCover } from "./Anfaal/Cover";
import { AnfaalCoverTransform } from "./Anfaal/CoverTransform";
import { AnfaalReel2, R2_FRAMES } from "./Anfaal2/Reel";
import { AnfaalReel2Cover } from "./Anfaal2/Cover";
import { AnfaalReel3, R3_FRAMES } from "./Anfaal3/Reel";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="AnfaalReel" component={AnfaalReel} durationInFrames={AN_FRAMES} fps={30} width={1080} height={1920} />
    <Still id="AnfaalCover" component={AnfaalCover} width={1080} height={1920} />
    <Composition id="AnfaalReel2" component={AnfaalReel2} durationInFrames={R2_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="AnfaalReel3" component={AnfaalReel3} durationInFrames={R3_FRAMES} fps={30} width={1080} height={1920} />
    <Still id="AnfaalReel2Cover" component={AnfaalReel2Cover} width={1080} height={1920} />
    <Still id="AnfaalCoverTransform" component={AnfaalCoverTransform} width={1080} height={1920} />
  </>
);
