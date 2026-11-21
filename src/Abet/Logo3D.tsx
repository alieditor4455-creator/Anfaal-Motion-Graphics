import React, { useLayoutEffect, useMemo } from "react";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import S from "./logoShapes.json";

// Extruded 3D ABET logo: glossy white letters with bevels + inlaid crimson-chrome bull & bear.
type Poly = { outer: number[][]; holes: number[][][] };
const toShapes = (list: Poly[]) =>
  list.map((p) => {
    const pt = ([x, y]: number[]) => new THREE.Vector2(x - S.w / 2, -(y - S.h / 2));
    const sh = new THREE.Shape(p.outer.map(pt));
    p.holes.forEach((h) => sh.holes.push(new THREE.Path(h.map(pt))));
    return sh;
  });

const DEPTH = 46;
const BEVEL = 5;

const Env: React.FC = () => {
  const { gl, scene } = useThree();
  useLayoutEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.05;
    const pm = new THREE.PMREMGenerator(gl);
    const tex = pm.fromScene(new RoomEnvironment(), 0.02).texture;
    scene.environment = tex;
    return () => { tex.dispose(); pm.dispose(); };
  }, [gl, scene]);
  return null;
};

export type Logo3DState = {
  rx: number; // degrees
  ry: number;
  rz?: number;
  z?: number; // push toward camera (+)
  scale?: number;
  animals: number; // 0..1 extrude the bull & bear out of the letters
  sweep: number; // 0..1 key light travels left -> right across the bevels
  rim?: number; // crimson rim light strength
  opacity?: number;
  y?: number; // vertical offset in px (scene units)
  reflect?: number; // floor reflection strength
};

const Logo: React.FC<Logo3DState> = ({ rx, ry, rz = 0, z = 0, scale = 1, animals, sweep, rim = 1, y = 0, reflect = 0.16 }) => {
  const letters = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(toShapes(S.letters as Poly[]), { depth: DEPTH, bevelEnabled: true, bevelThickness: BEVEL, bevelSize: 3.2, bevelSegments: 5, curveSegments: 2 });
    g.translate(0, 0, -DEPTH / 2);
    return g;
  }, []);
  const beasts = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(toShapes([...(S.bull as Poly[]), ...(S.bear as Poly[])]), { depth: 10, bevelEnabled: true, bevelThickness: 2.4, bevelSize: 1.2, bevelSegments: 3, curveSegments: 2 });
    return g;
  }, []);
  const white = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#F2F3F6", metalness: 0.05, roughness: 0.08, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 0.9, sheen: 0.4, sheenColor: new THREE.Color("#ffd9dc") }), []);
  const crimson = useMemo(() => new THREE.MeshPhysicalMaterial({ color: "#D0222C", metalness: 1, roughness: 0.2, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 2.2, iridescence: 0.15 }), []);
  const whiteR = useMemo(() => { const m = white.clone(); m.transparent = true; m.depthWrite = false; return m; }, [white]);
  const crimsonR = useMemo(() => { const m = crimson.clone(); m.transparent = true; m.depthWrite = false; return m; }, [crimson]);
  whiteR.opacity = reflect;
  crimsonR.opacity = reflect;
  const d = THREE.MathUtils.degToRad;
  const a = Math.max(0.001, animals);
  const body = (w: THREE.Material, c: THREE.Material) => (
    <>
      <mesh geometry={letters} material={w} />
      {/* animals sit in the letter face and extrude forward */}
      <mesh geometry={beasts} material={c} position={[0, 0, DEPTH / 2 + BEVEL - 9.5 + 9 * a]} scale={[1, 1, a]} />
    </>
  );
  return (
    <group position={[0, y, 0]}>
    {/* polished-floor reflection: mirror about the floor plane y = f (outer at f, flip, inner at -f) */}
    {reflect > 0 && (
      <group position={[0, -S.h / 2 * scale - 22, z]} scale={[1, -1, 1]}>
        <group position={[0, S.h / 2 * scale + 22, 0]} rotation={[d(rx), d(ry), d(rz)]} scale={scale}>{body(whiteR, crimsonR)}</group>
      </group>
    )}
    <group position={[0, 0, z]} rotation={[d(rx), d(ry), d(rz)]} scale={scale}>
      {body(white, crimson)}
      {/* key light that sweeps across the bevels */}
      {/* top key (sculpts the sides darker than the faces) */}
      <directionalLight position={[-300, 900, 500]} intensity={1.6} color="#FFFFFF" />
      {/* moving specular sweep */}
      <spotLight position={[THREE.MathUtils.lerp(-1400, 1400, sweep), 200, 900]} angle={0.5} penumbra={0.9} intensity={6e6} decay={2} distance={0} color="#FFFFFF" />
      {/* crimson rim from behind-right + cool fill */}
      <pointLight position={[700, 150, -260]} intensity={rim * 4.5e5} color="#FF2F3B" distance={0} decay={2} />
      <pointLight position={[-800, -200, 300]} intensity={1.2e5} color="#9FB6FF" distance={0} decay={2} />
    </group>
    </group>
  );
};

export const Logo3D: React.FC<Logo3DState & { width: number; height: number; fov?: number; camZ?: number }> = ({ width, height, fov = 28, camZ = 2150, opacity = 1, ...st }) => (
  <div style={{ position: "absolute", inset: 0, opacity }}>
    <ThreeCanvas width={width} height={height} linear={false} flat={false} camera={{ fov, position: [0, 0, camZ], near: 10, far: 10000 }} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }} style={{ position: "absolute", inset: 0 }}>
      <Env />
      <ambientLight intensity={0.08} />
      <Logo {...st} />
    </ThreeCanvas>
  </div>
);
