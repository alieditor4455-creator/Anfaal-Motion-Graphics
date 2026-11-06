import { Composition, Still } from "remotion";
import { AN_FRAMES, AnfaalReel } from "./Anfaal/Reel";
import { AnfaalCover } from "./Anfaal/Cover";
import { AnfaalCoverTransform } from "./Anfaal/CoverTransform";
import { AnfaalReel2, R2_FRAMES } from "./Anfaal2/Reel";
import { AnfaalReel2Cover } from "./Anfaal2/Cover";
import { AnfaalReel3, R3_FRAMES } from "./Anfaal3/Reel";
import { AnfaalReel3Cover } from "./Anfaal3/Cover";
import { AnfaalReel4, R4_FRAMES } from "./Anfaal4/Reel";
import { AnfaalReel4Cover } from "./Anfaal4/Cover";
import { AnfaalReel5, R5_FRAMES } from "./Anfaal5/Reel";
import { AnfaalReel5Cover } from "./Anfaal5/Cover";
import { JunoDark, JunoNoDave, JUNO_FRAMES, JUNO_FPS } from "./Juno/Motion";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="AnfaalReel" component={AnfaalReel} durationInFrames={AN_FRAMES} fps={30} width={1080} height={1920} />
    <Still id="AnfaalCover" component={AnfaalCover} width={1080} height={1920} />
    <Composition id="AnfaalReel2" component={AnfaalReel2} durationInFrames={R2_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="AnfaalReel3" component={AnfaalReel3} durationInFrames={R3_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="AnfaalReel4" component={AnfaalReel4} durationInFrames={R4_FRAMES} fps={30} width={1080} height={1920} />
    <Composition id="AnfaalReel5" component={AnfaalReel5} durationInFrames={R5_FRAMES} fps={30} width={1080} height={1920} />
    <Still id="AnfaalReel5Cover" component={AnfaalReel5Cover} width={1080} height={1920} />
    <Still id="AnfaalReel4Cover" component={AnfaalReel4Cover} width={1080} height={1920} />
    <Still id="AnfaalReel3Cover" component={AnfaalReel3Cover} width={1080} height={1920} />
    <Still id="AnfaalReel2Cover" component={AnfaalReel2Cover} width={1080} height={1920} />
    <Still id="AnfaalCoverTransform" component={AnfaalCoverTransform} width={1080} height={1920} />
    <Composition id="JunoNoDave" component={JunoNoDave} durationInFrames={JUNO_FRAMES} fps={JUNO_FPS} width={1080} height={1920} />
    <Composition id="JunoDark" component={JunoDark} durationInFrames={JUNO_FRAMES} fps={JUNO_FPS} width={1080} height={1920} />
  </>
);
