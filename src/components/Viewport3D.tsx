import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { FurnitureProject, Generated3DBoard } from '../types/furniture';
import { FINISH_PRESETS } from '../utils/raskroyEngine';

export type CameraViewPreset = 'isometric' | 'front' | 'side' | 'top';

interface Viewport3DProps {
  project: FurnitureProject;
  boards: Generated3DBoard[];
  selectedModuleId: string | null;
  selectedBoardId: string | null;
  onSelectPart: (boardId: string | null, moduleId: string | null) => void;
  explodeFactor: number; // 0 to 1
  doorsOpen: boolean;
  doorOverrides?: Record<string, boolean>;
  onToggleDoor?: (toggleKey: string) => void;
  wireframeMode: boolean;
  showDimensions: boolean;
  cameraPreset: CameraViewPreset;
  cameraTriggerCount: number;
}

interface TweenState {
  current: number;
  from: number;
  to: number;
  startTime: number;
  duration: number;
}

interface CameraTweenState {
  active: boolean;
  startTime: number;
  duration: number;
  fromPos: THREE.Vector3;
  toPos: THREE.Vector3;
  fromTarget: THREE.Vector3;
  toTarget: THREE.Vector3;
}

interface AnimatedBoardEntry {
  mesh: THREE.Mesh;
  baseX: number;
  baseY: number;
  baseZ: number;
  sx: number;
  sy: number;
  sz: number;
  explodeVec: [number, number, number];
  isDoor: boolean;
  isDrawer: boolean;
  doorHingeSide?: 'left' | 'right' | 'top';
  rotationY: 0 | 90 | 180 | 270;
  toggleKey: string | null;
}

interface AnimatedFixtureEntry {
  group: THREE.Group;
  baseY: number;
  baseZ: number;
  explodeDeltaY: number;
  explodeDeltaZ: number;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function stepTween(tw: TweenState, now: number): boolean {
  if (tw.duration <= 0 || tw.current === tw.to) {
    tw.current = tw.to;
    tw.duration = 0;
    return false;
  }
  const elapsed = now - tw.startTime;
  if (elapsed >= tw.duration) {
    tw.current = tw.to;
    tw.duration = 0;
    return false;
  }
  const progress = Math.max(0, Math.min(1, elapsed / tw.duration));
  tw.current = tw.from + (tw.to - tw.from) * easeOutCubic(progress);
  return true;
}

function getBoardToggleKey(b: Generated3DBoard): string | null {
  if (b.isDoor) return b.id;
  if (b.isDrawer) {
    if (b.id.endsWith(':oven_drawer_front')) {
      return `${b.moduleId}:oven_drawer`;
    }
    const match = b.id.match(/^(.+):drawer_(?:front|side_l|side_r|back|bottom)_(\d+)$/);
    if (match) {
      return `${match[1]}:drawer_${match[2]}`;
    }
    return b.id;
  }
  return null;
}

const isSoftwareGl = (() => {
  if (typeof document === 'undefined') return false;
  const gl = document.createElement('canvas').getContext('webgl2');
  if (!gl) return true;
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
  const gpu = String(gl.getParameter(param));
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
})();

function createParquetTextures(maxAnisotropy: number): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 512;
  bumpCanvas.height = 512;
  const bCtx = bumpCanvas.getContext('2d')!;

  ctx.fillStyle = '#C49A66';
  ctx.fillRect(0, 0, 512, 512);
  bCtx.fillStyle = '#888888';
  bCtx.fillRect(0, 0, 512, 512);

  const rows = 8;
  const cols = 4;
  const plankH = 512 / rows;
  const plankW = 512 / cols;

  const shades = ['#C79F6C', '#BD925E', '#CCA674', '#B58955', '#C29864', '#BA8E5A'];

  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * (plankW / 2) + ((r % 3) * plankW) / 4;
    for (let c = -1; c <= cols + 1; c++) {
      const x = c * plankW + offset;
      const y = r * plankH;
      const shade = shades[(r * 5 + c * 3 + 17) % shades.length];
      ctx.fillStyle = shade;
      ctx.fillRect(x, y, plankW, plankH);

      bCtx.fillStyle = '#8d8d8d';
      bCtx.fillRect(x + 1, y + 1, plankW - 2, plankH - 2);

      // Organic oak grain waves
      for (let g = 0; g < 8; g++) {
        const gy = y + 4 + (g / 8) * (plankH - 8);
        const wave = ((r + c + g) % 3 - 1) * 2.5;
        ctx.strokeStyle = g % 2 === 0 ? 'rgba(92, 60, 30, 0.11)' : 'rgba(235, 200, 150, 0.08)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 2, gy);
        ctx.bezierCurveTo(x + plankW * 0.33, gy + wave, x + plankW * 0.66, gy - wave, x + plankW - 2, gy);
        ctx.stroke();

        bCtx.strokeStyle = 'rgba(115, 115, 115, 0.35)';
        bCtx.lineWidth = 1;
        bCtx.beginPath();
        bCtx.moveTo(x + 2, gy);
        bCtx.bezierCurveTo(x + plankW * 0.33, gy + wave, x + plankW * 0.66, gy - wave, x + plankW - 2, gy);
        bCtx.stroke();
      }

      // Subtle bevel highlight & dark plank seam
      ctx.strokeStyle = 'rgba(245, 215, 175, 0.14)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 1.5, y + 1.5, plankW - 3, plankH - 3);

      ctx.strokeStyle = 'rgba(68, 44, 22, 0.42)';
      ctx.lineWidth = 1.6;
      ctx.strokeRect(x, y, plankW, plankH);

      bCtx.strokeStyle = '#383838';
      bCtx.lineWidth = 2;
      bCtx.strokeRect(x, y, plankW, plankH);
    }
  }

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(3.2, 3.2);
  map.anisotropy = maxAnisotropy;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(3.2, 3.2);
  bumpMap.anisotropy = maxAnisotropy;

  return { map, bumpMap };
}

function createWoodGrainBumpTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = '#949494';
  ctx.lineWidth = 1;
  for (let i = 0; i < 64; i++) {
    const y = (i / 64) * 256;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(85, y + ((i % 3) - 1) * 3, 170, y - ((i % 3) - 1) * 3, 256, y);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createMelamineBumpTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(128, 128);
  let seed = 1337;
  for (let i = 0; i < img.data.length; i += 4) {
    seed = (seed * 16807) % 2147483647;
    const v = 122 + (seed % 13); // super subtle matte melamine pebble
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6, 6);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createStoneTextures(maxAnisotropy: number): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = 256;
  bumpCanvas.height = 256;
  const bCtx = bumpCanvas.getContext('2d')!;

  ctx.fillStyle = '#F2F0EC';
  ctx.fillRect(0, 0, 256, 256);
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, 256, 256);

  let seed = 4242;
  const nextRand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  // Subtle quartz / granite mineral flecks
  for (let i = 0; i < 1600; i++) {
    const x = nextRand() * 256;
    const y = nextRand() * 256;
    const r = 0.6 + nextRand() * 1.4;
    const tone = nextRand();
    if (tone < 0.45) {
      ctx.fillStyle = 'rgba(130, 124, 114, 0.22)';
      bCtx.fillStyle = '#707070';
    } else if (tone < 0.8) {
      ctx.fillStyle = 'rgba(255, 253, 248, 0.32)';
      bCtx.fillStyle = '#8e8e8e';
    } else {
      ctx.fillStyle = 'rgba(95, 90, 82, 0.16)';
      bCtx.fillStyle = '#686868';
    }
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    bCtx.beginPath();
    bCtx.arc(x, y, r, 0, Math.PI * 2);
    bCtx.fill();
  }

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(2.5, 1.5);
  map.anisotropy = maxAnisotropy;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(2.5, 1.5);
  bumpMap.anisotropy = maxAnisotropy;

  return { map, bumpMap };
}

function createWallTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(256, 256);
  let seed = 9182;
  for (let i = 0; i < img.data.length; i += 4) {
    seed = (seed * 16807) % 2147483647;
    const v = 244 + (seed % 10);
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(4, 3);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createAoGradientTexture(direction: 'horizontal' | 'vertical'): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = direction === 'horizontal' ? 128 : 16;
  canvas.height = direction === 'vertical' ? 128 : 16;
  const ctx = canvas.getContext('2d')!;
  const grad =
    direction === 'horizontal'
      ? ctx.createLinearGradient(0, 0, 128, 0)
      : ctx.createLinearGradient(0, 128, 0, 0);
  grad.addColorStop(0, 'rgba(30, 34, 42, 0.22)');
  grad.addColorStop(0.35, 'rgba(30, 34, 42, 0.08)');
  grad.addColorStop(1, 'rgba(30, 34, 42, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const tex = new THREE.CanvasTexture(canvas);
  return tex;
}

export const Viewport3D: React.FC<Viewport3DProps> = ({
  project,
  boards,
  selectedModuleId,
  selectedBoardId,
  onSelectPart,
  explodeFactor,
  doorsOpen,
  doorOverrides = {},
  onToggleDoor,
  wireframeMode,
  showDimensions,
  cameraPreset,
  cameraTriggerCount,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const onSelectPartRef = useRef(onSelectPart);
  onSelectPartRef.current = onSelectPart;
  const onToggleDoorRef = useRef(onToggleDoor);
  onToggleDoorRef.current = onToggleDoor;
  const doorsOpenRef = useRef(doorsOpen);
  doorsOpenRef.current = doorsOpen;
  const prevProjectIdRef = useRef<string>(project.id);
  const prevTriggerCountRef = useRef<number>(cameraTriggerCount);

  const animStateRef = useRef<{
    explodeTween: TweenState;
    doorTweens: Map<string, TweenState>;
    cameraTween: CameraTweenState;
    animatedBoards: AnimatedBoardEntry[];
    animatedFixtures: AnimatedFixtureEntry[];
  }>({
    explodeTween: {
      current: explodeFactor,
      from: explodeFactor,
      to: explodeFactor,
      startTime: 0,
      duration: 0,
    },
    doorTweens: new Map(),
    cameraTween: {
      active: false,
      startTime: 0,
      duration: 460,
      fromPos: new THREE.Vector3(),
      toPos: new THREE.Vector3(),
      fromTarget: new THREE.Vector3(),
      toTarget: new THREE.Vector3(),
    },
    animatedBoards: [],
    animatedFixtures: [],
  });

  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    furnitureGroup: THREE.Group;
    roomGroup: THREE.Group;
    interactableMeshes: THREE.Mesh[];
    sharedMaterials: {
      chromeMat: THREE.MeshStandardMaterial;
      legBlackMat: THREE.MeshStandardMaterial;
      castIronMat: THREE.MeshStandardMaterial;
      darkGlassMat: THREE.MeshStandardMaterial;
      sinkSteelMat: THREE.MeshStandardMaterial;
      sinkBasinMat: THREE.MeshStandardMaterial;
      vitrineGlassMat: THREE.MeshStandardMaterial;
      dimLineMat: THREE.LineBasicMaterial;
      highlightLineMat: THREE.LineBasicMaterial;
      defaultLineMat: THREE.LineBasicMaterial;
    };
    requestRender: () => void;
    applyAnimatedTransforms: () => void;
    setCameraView: (preset: CameraViewPreset, centerXMm: number, animate?: boolean) => void;
    woodBumpTex: THREE.CanvasTexture;
    melamineBumpTex: THREE.CanvasTexture;
    stoneTex: THREE.CanvasTexture;
    stoneBumpTex: THREE.CanvasTexture;
  } | null>(null);

  // Initialize Three.js WebGLRenderer & Scene once
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 960;
    const height = container.clientHeight || 640;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcfd6df);
    scene.fog = new THREE.Fog(0xcfd6df, 9.5, 22);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.05, 35);
    camera.position.set(3.4, 2.35, 3.85);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.94;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.34;
    pmremGenerator.dispose();

    const hemiLight = new THREE.HemisphereLight(0xf1f5f9, 0x9b8267, 0.48);
    hemiLight.position.set(0, 4, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff4e4, 1.05);
    keyLight.position.set(3.4, 4.6, 3.8);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = isSoftwareGl ? 1024 : 2048;
    keyLight.shadow.mapSize.height = isSoftwareGl ? 1024 : 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 12;
    const d = 3.0;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0004;
    keyLight.shadow.normalBias = 0.015;
    keyLight.shadow.radius = 2.5;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xd5dfe9, 0.28);
    fillLight.position.set(-2.8, 2.4, 2.2);
    scene.add(fillLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 - 0.01;
    controls.minDistance = 0.7;
    controls.maxDistance = 12;
    controls.target.set(1.4, 0.95, 0.35);
    controls.update();

    const roomGroup = new THREE.Group();
    const furnitureGroup = new THREE.Group();
    scene.add(roomGroup);
    scene.add(furnitureGroup);

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const parquetTextures = createParquetTextures(maxAniso);
    const woodBumpTex = createWoodGrainBumpTexture(maxAniso);
    const melamineBumpTex = createMelamineBumpTexture(maxAniso);
    const stoneTextures = createStoneTextures(maxAniso);
    const wallTex = createWallTexture(maxAniso);
    const aoHorizTex = createAoGradientTexture('horizontal');
    const aoVertTex = createAoGradientTexture('vertical');

    // Architectural Corner Room
    const floorGeo = new THREE.PlaneGeometry(5.8, 4.6);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: parquetTextures.map,
      bumpMap: parquetTextures.bumpMap,
      bumpScale: 0.0018,
      roughness: 0.56,
      metalness: 0.03,
      envMapIntensity: 0.24,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(1.8, 0, 1.6);
    floorMesh.receiveShadow = true;
    roomGroup.add(floorMesh);

    const contactGeo = new THREE.PlaneGeometry(3.6, 0.95);
    const contactMat = new THREE.MeshBasicMaterial({
      color: 0x1e160d,
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
    });
    const contactPlane = new THREE.Mesh(contactGeo, contactMat);
    contactPlane.rotation.x = -Math.PI / 2;
    contactPlane.position.set(1.4, 0.002, 0.34);
    roomGroup.add(contactPlane);

    const backWallGeo = new THREE.BoxGeometry(4.8, 2.8, 0.08);
    const backWallMat = new THREE.MeshStandardMaterial({
      color: 0xe0e3e7,
      map: wallTex,
      roughness: 0.94,
      metalness: 0.0,
      envMapIntensity: 0.12,
    });
    const backWall = new THREE.Mesh(backWallGeo, backWallMat);
    backWall.position.set(2.2, 1.4, -0.04);
    backWall.receiveShadow = true;
    roomGroup.add(backWall);

    const leftWallGeo = new THREE.BoxGeometry(0.08, 2.8, 4.0);
    const leftWallMat = new THREE.MeshStandardMaterial({
      color: 0xc3c8cf,
      map: wallTex,
      roughness: 0.94,
      metalness: 0.0,
      envMapIntensity: 0.12,
    });
    const leftWall = new THREE.Mesh(leftWallGeo, leftWallMat);
    leftWall.position.set(-0.12, 1.4, 1.92);
    leftWall.receiveShadow = true;
    roomGroup.add(leftWall);

    // Soft ambient-occlusion corner & floor seam shadows
    const cornerAoMat = new THREE.MeshBasicMaterial({
      map: aoHorizTex,
      transparent: true,
      depthWrite: false,
    });
    const cornerAoPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 2.75), cornerAoMat);
    cornerAoPlane.position.set(0.04, 1.4, 0.003);
    roomGroup.add(cornerAoPlane);

    const floorAoMat = new THREE.MeshBasicMaterial({
      map: aoVertTex,
      transparent: true,
      depthWrite: false,
    });
    const backFloorAo = new THREE.Mesh(new THREE.PlaneGeometry(4.65, 0.24), floorAoMat);
    backFloorAo.rotation.x = -Math.PI / 2;
    backFloorAo.position.set(2.2, 0.003, 0.12);
    roomGroup.add(backFloorAo);

    const baseboardMat = new THREE.MeshStandardMaterial({
      color: 0xa88052,
      roughness: 0.52,
      metalness: 0.04,
      envMapIntensity: 0.25,
    });
    const backBaseboard = new THREE.Mesh(new THREE.BoxGeometry(4.7, 0.05, 0.016), baseboardMat);
    backBaseboard.position.set(2.2, 0.025, 0.008);
    backBaseboard.receiveShadow = true;
    roomGroup.add(backBaseboard);

    const leftBaseboard = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.05, 3.9), baseboardMat);
    leftBaseboard.position.set(-0.072, 0.025, 1.95);
    leftBaseboard.receiveShadow = true;
    roomGroup.add(leftBaseboard);

    // Shared hardware materials (reused across all boards/fixtures)
    const sharedMaterials = {
      chromeMat: new THREE.MeshStandardMaterial({
        color: 0xd8dce2,
        roughness: 0.2,
        metalness: 0.88,
        envMapIntensity: 0.95,
      }),
      legBlackMat: new THREE.MeshStandardMaterial({
        color: 0x1a1d24,
        roughness: 0.48,
        metalness: 0.18,
        envMapIntensity: 0.35,
      }),
      castIronMat: new THREE.MeshStandardMaterial({
        color: 0x20232a,
        roughness: 0.72,
        metalness: 0.32,
        envMapIntensity: 0.3,
      }),
      darkGlassMat: new THREE.MeshStandardMaterial({
        color: 0x12151b,
        roughness: 0.12,
        metalness: 0.22,
        envMapIntensity: 0.85,
      }),
      sinkSteelMat: new THREE.MeshStandardMaterial({
        color: 0xb6bdc7,
        roughness: 0.26,
        metalness: 0.82,
        envMapIntensity: 0.9,
      }),
      sinkBasinMat: new THREE.MeshStandardMaterial({
        color: 0x5c6470,
        roughness: 0.34,
        metalness: 0.75,
        envMapIntensity: 0.65,
      }),
      vitrineGlassMat: new THREE.MeshStandardMaterial({
        color: 0x93c5fd,
        roughness: 0.1,
        metalness: 0.15,
        transparent: true,
        opacity: 0.35,
      }),
      dimLineMat: new THREE.LineBasicMaterial({ color: 0xf59e0b }),
      highlightLineMat: new THREE.LineBasicMaterial({
        color: 0x1d6ff2,
        transparent: true,
        opacity: 1.0,
      }),
      defaultLineMat: new THREE.LineBasicMaterial({
        color: 0x4f5661,
        transparent: true,
        opacity: 0.16,
      }),
    };

    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let lastW = width;
    let lastH = height;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 50);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      let polls = 0;
      const poll = () => {
        polls++;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED && polls < 12) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 50);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    const tempAxis = new THREE.Vector3();
    const tempQuat = new THREE.Quaternion();
    const tempVec = new THREE.Vector3();
    let isTweeningCamera = false;

    const applyAnimatedTransforms = () => {
      const { explodeTween, doorTweens, animatedBoards, animatedFixtures } = animStateRef.current;
      const expDist = explodeTween.current * 0.24;
      const defaultOpenVal = doorsOpenRef.current ? 1 : 0;

      for (const entry of animatedBoards) {
        let px = entry.baseX + entry.explodeVec[0] * expDist;
        let py = entry.baseY + entry.explodeVec[1] * expDist;
        let pz = entry.baseZ + entry.explodeVec[2] * expDist;

        const openVal = entry.toggleKey
          ? (doorTweens.get(entry.toggleKey)?.current ?? defaultOpenVal)
          : 0;

        if (entry.isDrawer && openVal > 0.0001) {
          const rotRad = (entry.rotationY * Math.PI) / 180;
          const pushDist = 0.26 * openVal;
          px += Math.sin(rotRad) * pushDist;
          pz += Math.cos(rotRad) * pushDist;
        }

        if (entry.isDoor && openVal > 0.0001) {
          const rotRad = (entry.rotationY * Math.PI) / 180;
          if (entry.doorHingeSide === 'top') {
            const theta = -Math.PI * 0.32 * openVal;
            tempAxis.set(Math.cos(rotRad), 0, -Math.sin(rotRad));
            tempQuat.setFromAxisAngle(tempAxis, theta);
            entry.mesh.quaternion.copy(tempQuat);
            tempVec.set(0, -entry.sy / 2, 0).applyQuaternion(tempQuat);
            px += tempVec.x;
            py += entry.sy / 2 + tempVec.y;
            pz += tempVec.z;
          } else {
            const dir = entry.doorHingeSide === 'right' ? 1 : -1;
            const angle = dir * Math.PI * 0.38 * openVal;
            entry.mesh.rotation.set(0, angle, 0);
            const faceW = entry.rotationY === 90 || entry.rotationY === 270 ? entry.sz : entry.sx;
            const hingeWorldX = dir * (faceW / 2) * Math.cos(rotRad);
            const hingeWorldZ = -dir * (faceW / 2) * Math.sin(rotRad);
            const cosA = Math.cos(angle);
            const sinA = Math.sin(angle);
            const relX = -hingeWorldX * cosA - hingeWorldZ * sinA;
            const relZ = hingeWorldX * sinA - hingeWorldZ * cosA;
            px += hingeWorldX + relX;
            pz += hingeWorldZ + relZ;
          }
        } else {
          entry.mesh.rotation.set(0, 0, 0);
        }

        entry.mesh.position.set(px, py, pz);
      }

      for (const fix of animatedFixtures) {
        fix.group.position.y = fix.baseY + explodeTween.current * fix.explodeDeltaY;
        fix.group.position.z = fix.baseZ + explodeTween.current * fix.explodeDeltaZ;
      }
    };

    const stepAnimations = (now: number): boolean => {
      const state = animStateRef.current;
      let anyActive = false;

      if (stepTween(state.explodeTween, now)) {
        anyActive = true;
      }

      for (const tw of state.doorTweens.values()) {
        if (stepTween(tw, now)) {
          anyActive = true;
        }
      }

      applyAnimatedTransforms();

      const camTw = state.cameraTween;
      if (camTw.active) {
        const elapsed = now - camTw.startTime;
        isTweeningCamera = true;
        if (elapsed >= camTw.duration) {
          camera.position.copy(camTw.toPos);
          controls.target.copy(camTw.toTarget);
          controls.update();
          camTw.active = false;
        } else {
          const p = easeOutCubic(Math.max(0, Math.min(1, elapsed / camTw.duration)));
          camera.position.lerpVectors(camTw.fromPos, camTw.toPos, p);
          controls.target.lerpVectors(camTw.fromTarget, camTw.toTarget, p);
          controls.update();
          anyActive = true;
        }
        isTweeningCamera = false;
      }

      return anyActive;
    };

    const updateWallVisibility = () => {
      const showBackWall = camera.position.z > 0.02;
      const showLeftWall = camera.position.x > -0.05;
      backWall.visible = showBackWall;
      backBaseboard.visible = showBackWall;
      backFloorAo.visible = showBackWall;
      leftWall.visible = showLeftWall;
      leftBaseboard.visible = showLeftWall;
      cornerAoPlane.visible = showBackWall && showLeftWall;
    };

    function requestRender() {
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame(() => {
        renderDirty = false;
        const moreAnim = stepAnimations(performance.now());
        updateWallVisibility();
        renderer.render(scene, camera);
        const done = () => {
          renderBusy = false;
          if (renderDirty || moreAnim) requestRender();
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    }

    controls.addEventListener('change', () => {
      if (!isTweeningCamera) requestRender();
    });
    controls.addEventListener('start', () => {
      animStateRef.current.cameraTween.active = false;
    });

    const setCameraView = (preset: CameraViewPreset, centerXMm: number, animate = false) => {
      const cx = (centerXMm || 1400) / 1000;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      const isMobilePortrait = w < 768 && w < h;
      const isDesktop = w >= 1024;
      const distMult = isMobilePortrait ? 1.45 : 1.0;
      const targetOffsetX = isDesktop ? 0.1 : 0.0;
      const targetY = isMobilePortrait ? 0.85 : 0.98;

      const toPos = new THREE.Vector3();
      const toTarget = new THREE.Vector3();

      if (preset === 'isometric') {
        toPos.set(
          cx + 1.85 * distMult,
          2.38 * (isMobilePortrait ? 1.15 : 1.0),
          3.85 * distMult,
        );
        toTarget.set(cx + targetOffsetX, targetY, 0.25);
      } else if (preset === 'front') {
        toPos.set(cx + targetOffsetX, 1.15, 3.9 * distMult);
        toTarget.set(cx + targetOffsetX, 1.0, 0.25);
      } else if (preset === 'side') {
        toPos.set(cx + 3.4 * distMult, 1.15, 0.85);
        toTarget.set(cx, 1.0, 0.28);
      } else if (preset === 'top') {
        toPos.set(cx + targetOffsetX, 4.4 * distMult, 1.2);
        toTarget.set(cx + targetOffsetX, 0.5, 0.35);
      }

      if (animate) {
        const camTw = animStateRef.current.cameraTween;
        camTw.fromPos.copy(camera.position);
        camTw.toPos.copy(toPos);
        camTw.fromTarget.copy(controls.target);
        camTw.toTarget.copy(toTarget);
        camTw.startTime = performance.now();
        camTw.duration = 460;
        camTw.active = true;
        requestRender();
      } else {
        animStateRef.current.cameraTween.active = false;
        camera.position.copy(toPos);
        controls.target.copy(toTarget);
        controls.update();
        requestRender();
      }
    };

    const interactableMeshes: THREE.Mesh[] = [];
    const raycaster = new THREE.Raycaster();
    const pointerDownPos = new THREE.Vector2();
    const mouseNdc = new THREE.Vector2();

    const handlePointerDown = (e: PointerEvent) => {
      pointerDownPos.set(e.clientX, e.clientY);
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.buttons !== 0) {
        if (renderer.domElement.style.cursor !== '') {
          renderer.domElement.style.cursor = '';
        }
        return;
      }
      const rect = renderer.domElement.getBoundingClientRect();
      mouseNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseNdc, camera);
      const hits = raycaster.intersectObjects(interactableMeshes, false);
      const isOverDoor = hits.length > 0 && Boolean(hits[0].object.userData?.toggleKey);
      const nextCursor = isOverDoor ? 'pointer' : '';
      if (renderer.domElement.style.cursor !== nextCursor) {
        renderer.domElement.style.cursor = nextCursor;
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (dist > 7) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouseNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseNdc, camera);
      const hits = raycaster.intersectObjects(interactableMeshes, false);

      if (hits.length > 0) {
        const hitMesh = hits[0].object as THREE.Mesh;
        const { boardId, moduleId, toggleKey } = hitMesh.userData;
        onSelectPartRef.current(boardId || null, moduleId || null);
        if (toggleKey && onToggleDoorRef.current) {
          onToggleDoorRef.current(toggleKey);
        }
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 600;
      if (w === lastW && h === lastH) return;
      lastW = w;
      lastH = h;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    sceneRef.current = {
      scene,
      camera,
      renderer,
      controls,
      furnitureGroup,
      roomGroup,
      interactableMeshes,
      sharedMaterials,
      requestRender,
      applyAnimatedTransforms,
      setCameraView,
      woodBumpTex,
      melamineBumpTex,
      stoneTex: stoneTextures.map,
      stoneBumpTex: stoneTextures.bumpMap,
    };

    requestRender();

    return () => {
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      controls.dispose();
      roomGroup.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const m = obj as THREE.Mesh;
          m.geometry?.dispose();
          if (Array.isArray(m.material)) m.material.forEach((mat) => mat.dispose());
          else m.material?.dispose();
        }
      });
      parquetTextures.map.dispose();
      parquetTextures.bumpMap.dispose();
      woodBumpTex.dispose();
      melamineBumpTex.dispose();
      stoneTextures.map.dispose();
      stoneTextures.bumpMap.dispose();
      wallTex.dispose();
      aoHorizTex.dispose();
      aoVertTex.dispose();
      Object.values(sharedMaterials).forEach((m) => m.dispose());
      renderer.dispose();
    };
  }, []);

  // Handle camera preset switches & project switches
  useEffect(() => {
    if (!sceneRef.current) return;
    const totalW =
      project.modules.reduce((max, m) => Math.max(max, m.x + m.width), 0) || 1600;
    const isSameProject = prevProjectIdRef.current === project.id;
    const triggeredByUser = cameraTriggerCount > prevTriggerCountRef.current;
    prevProjectIdRef.current = project.id;
    prevTriggerCountRef.current = cameraTriggerCount;
    sceneRef.current.setCameraView(cameraPreset, totalW / 2, isSameProject && triggeredByUser);
  }, [cameraPreset, cameraTriggerCount, project.id]);

  // Rebuild 3D furniture geometry using memoized `boards`
  useEffect(() => {
    const ctx = sceneRef.current;
    if (!ctx) return;

    const {
      furnitureGroup,
      interactableMeshes,
      sharedMaterials,
      requestRender,
      applyAnimatedTransforms,
      woodBumpTex,
      melamineBumpTex,
      stoneTex,
      stoneBumpTex,
    } = ctx;
    const sharedMatSet = new Set<THREE.Material>(Object.values(sharedMaterials));

    // Dispose only non-shared geometries and cached board materials
    furnitureGroup.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh || (obj as THREE.LineSegments).isLineSegments) {
        const m = obj as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        if (Array.isArray(m.material)) {
          m.material.forEach((mat) => {
            if (!sharedMatSet.has(mat)) mat.dispose();
          });
        } else if (m.material && !sharedMatSet.has(m.material)) {
          m.material.dispose();
        }
      }
    });
    furnitureGroup.clear();
    interactableMeshes.length = 0;

    const nextAnimatedBoards: AnimatedBoardEntry[] = [];
    const nextAnimatedFixtures: AnimatedFixtureEntry[] = [];

    const scale = 0.001; // mm to meters
    const matCache = new Map<string, THREE.MeshStandardMaterial>();

    const getBoardMaterial = (
      hexColor: string,
      isFacade: boolean,
      isCountertop: boolean,
      isBoardSelected: boolean,
      isVitrine: boolean,
    ): THREE.MeshStandardMaterial => {
      const key = `${hexColor.toLowerCase()}|${isFacade ? 1 : 0}|${isCountertop ? 1 : 0}|${isBoardSelected ? 1 : 0}|${isVitrine ? 1 : 0}|${wireframeMode ? 1 : 0}`;
      const cached = matCache.get(key);
      if (cached) return cached;

      const preset = FINISH_PRESETS.find(
        (p) => p.hex.toLowerCase() === hexColor.toLowerCase(),
      );

      let map: THREE.Texture | null = null;
      let bumpMap: THREE.Texture | null = melamineBumpTex;
      let bumpScale = 0.00045;
      let roughness = preset?.roughness ?? (isFacade ? 0.5 : 0.62);
      let metalness = preset?.metalness ?? 0.03;
      let envMapIntensity = isFacade ? 0.34 : 0.22;

      if (isCountertop) {
        map = stoneTex;
        bumpMap = stoneBumpTex;
        bumpScale = 0.0009;
        roughness = 0.38;
        metalness = 0.04;
        envMapIntensity = 0.45;
      } else if (preset?.woodGrain) {
        bumpMap = woodBumpTex;
        bumpScale = 0.0022;
        envMapIntensity = 0.28;
      }

      const mat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(hexColor || '#E2DDD2'),
        map,
        roughness,
        metalness,
        envMapIntensity,
        wireframe: wireframeMode,
        bumpMap,
        bumpScale,
        transparent: isVitrine,
        opacity: isVitrine ? 0.65 : 1.0,
      });

      if (isBoardSelected) {
        mat.emissive = new THREE.Color(0x1d4ed8);
        mat.emissiveIntensity = 0.16;
      }

      matCache.set(key, mat);
      return mat;
    };

    // 1. Render all individual boards
    for (const b of boards) {
      const isBoardSelected = selectedBoardId === b.id;
      const isModSelected = !selectedBoardId && selectedModuleId === b.moduleId;
      const isHighlighted = isBoardSelected || isModSelected;
      const isFacade = b.role === 'fasad_eshik' || b.role === 'tortma_fasad';
      const isCountertop = b.role === 'stoleshnitsa';
      const isVitrine = b.facadeStyle === 'vitrine' && b.role === 'fasad_eshik';

      const boardMat = getBoardMaterial(b.color, isFacade, isCountertop, isBoardSelected, isVitrine);

      const sx = b.sizeX * scale;
      const sy = b.sizeY * scale;
      const sz = b.sizeZ * scale;

      const minDim = Math.min(sx, sy, sz);
      const useBevel = !wireframeMode && minDim >= 0.008;
      const bevelRadius = useBevel
        ? Math.min(isCountertop ? 0.0028 : 0.0016, minDim * 0.16)
        : 0;

      const geo: THREE.BufferGeometry = useBevel
        ? new RoundedBoxGeometry(sx, sy, sz, 2, bevelRadius)
        : new THREE.BoxGeometry(sx, sy, sz);
      const mesh = new THREE.Mesh(geo, boardMat);

      const baseX = b.centerX * scale;
      const baseY = b.centerY * scale;
      const baseZ = b.centerZ * scale;
      const toggleKey = getBoardToggleKey(b);

      mesh.position.set(baseX, baseY, baseZ);
      mesh.castShadow = !isSoftwareGl;
      mesh.receiveShadow = !isSoftwareGl;
      const boardUserData = {
        boardId: b.id,
        moduleId: b.moduleId,
        toggleKey,
      };
      mesh.userData = boardUserData;

      const boxOutlineRef = new THREE.BoxGeometry(sx, sy, sz);
      const edgesGeo = new THREE.EdgesGeometry(boxOutlineRef);
      boxOutlineRef.dispose();
      const lineSegs = new THREE.LineSegments(
        edgesGeo,
        isHighlighted ? sharedMaterials.highlightLineMat : sharedMaterials.defaultLineMat,
      );
      mesh.add(lineSegs);

      // Vitrine glass insert
      if (isVitrine && sx > 0.1 && sy > 0.1) {
        const glassW = Math.max(0.05, (b.rotationY === 90 || b.rotationY === 270 ? sz : sx) - 0.08);
        const glassH = Math.max(0.05, sy - 0.08);
        const glassGeo = new THREE.BoxGeometry(
          b.rotationY === 90 || b.rotationY === 270 ? sz + 0.002 : glassW,
          glassH,
          b.rotationY === 90 || b.rotationY === 270 ? glassW : sz + 0.002,
        );
        const glassMesh = new THREE.Mesh(glassGeo, sharedMaterials.vitrineGlassMat);
        glassMesh.userData = boardUserData;
        mesh.add(glassMesh);
        interactableMeshes.push(glassMesh);
      }

      // Metallic / Profile / Knob Handles for Doors & Drawers
      const hStyle = b.handleStyle ?? 'bar';
      if (isFacade && hStyle !== 'none') {
        const handleGroup = new THREE.Group();
        const isHorizHandle =
          b.role === 'tortma_fasad' || b.handleOrientation === 'horizontal';
        const faceWidth = b.rotationY === 90 || b.rotationY === 270 ? sz : sx;
        const faceThick = b.rotationY === 90 || b.rotationY === 270 ? sx : sz;

        if (hStyle === 'knob') {
          const collarGeo = new THREE.CylinderGeometry(0.0075, 0.0085, 0.005, 14);
          collarGeo.rotateX(Math.PI / 2);
          const knobGeo = new THREE.CylinderGeometry(0.012, 0.0075, 0.018, 16);
          knobGeo.rotateX(Math.PI / 2);
          const collarMesh = new THREE.Mesh(collarGeo, sharedMaterials.chromeMat);
          collarMesh.position.z = -0.007;
          const knobMesh = new THREE.Mesh(knobGeo, sharedMaterials.chromeMat);
          knobMesh.position.z = 0.004;
          knobMesh.castShadow = !isSoftwareGl;
          collarMesh.userData = boardUserData;
          knobMesh.userData = boardUserData;
          interactableMeshes.push(collarMesh, knobMesh);
          if (b.role === 'tortma_fasad') {
            handleGroup.position.set(0, 0, faceThick / 2 + 0.01);
          } else {
            const isUpper = b.centerY > 1000;
            const hx = b.doorHingeSide === 'right' ? -faceWidth / 2 + 0.038 : faceWidth / 2 - 0.038;
            const hy = isUpper ? -sy / 2 + 0.045 : sy / 2 - 0.045;
            handleGroup.position.set(hx, hy, faceThick / 2 + 0.01);
          }
          handleGroup.add(collarMesh, knobMesh);
        } else if (hStyle === 'profile') {
          const profLen = Math.min(faceWidth - 0.02, 0.24);
          const profGeo = new RoundedBoxGeometry(
            isHorizHandle ? profLen : 0.015,
            isHorizHandle ? 0.012 : profLen,
            0.017,
            2,
            0.002,
          );
          const profMesh = new THREE.Mesh(profGeo, sharedMaterials.legBlackMat);
          profMesh.castShadow = !isSoftwareGl;
          profMesh.userData = boardUserData;
          interactableMeshes.push(profMesh);
          if (isHorizHandle) {
            handleGroup.position.set(0, sy / 2 - 0.008, faceThick / 2 + 0.008);
          } else {
            const hx = b.doorHingeSide === 'right' ? -faceWidth / 2 + 0.012 : faceWidth / 2 - 0.012;
            handleGroup.position.set(hx, 0, faceThick / 2 + 0.008);
          }
          handleGroup.add(profMesh);
        } else {
          // Realistic brushed 'bar' handle with mounting rosettes & rounded end-caps
          const handleLen = Math.min(0.145, Math.max(0.075, (isHorizHandle ? faceWidth : sy) * 0.45));
          const barGeo = new THREE.CylinderGeometry(0.0055, 0.0055, handleLen, 12);
          const capGeo = new THREE.SphereGeometry(0.0055, 10, 8);
          const postGeo = new THREE.CylinderGeometry(0.0044, 0.0048, 0.022, 10);
          postGeo.rotateX(Math.PI / 2);
          const rosetteGeo = new THREE.CylinderGeometry(0.0072, 0.0075, 0.003, 12);
          rosetteGeo.rotateX(Math.PI / 2);

          const barMesh = new THREE.Mesh(barGeo, sharedMaterials.chromeMat);
          const cap1 = new THREE.Mesh(capGeo, sharedMaterials.chromeMat);
          const cap2 = new THREE.Mesh(capGeo, sharedMaterials.chromeMat);
          const post1 = new THREE.Mesh(postGeo, sharedMaterials.chromeMat);
          const post2 = new THREE.Mesh(postGeo, sharedMaterials.chromeMat);
          const ros1 = new THREE.Mesh(rosetteGeo, sharedMaterials.chromeMat);
          const ros2 = new THREE.Mesh(rosetteGeo, sharedMaterials.chromeMat);

          barMesh.castShadow = !isSoftwareGl;
          post1.castShadow = !isSoftwareGl;
          post2.castShadow = !isSoftwareGl;

          for (const m of [barMesh, cap1, cap2, post1, post2, ros1, ros2]) {
            m.userData = boardUserData;
            interactableMeshes.push(m);
          }

          if (isHorizHandle) {
            barMesh.rotation.z = Math.PI / 2;
            cap1.position.set(-handleLen / 2, 0, 0);
            cap2.position.set(handleLen / 2, 0, 0);
            post1.position.set(-handleLen * 0.36, 0, -0.011);
            post2.position.set(handleLen * 0.36, 0, -0.011);
            ros1.position.set(-handleLen * 0.36, 0, -0.018);
            ros2.position.set(handleLen * 0.36, 0, -0.018);
            const hy = b.role === 'fasad_eshik' ? sy / 2 - 0.045 : sy * 0.16;
            handleGroup.position.set(0, hy, faceThick / 2 + 0.019);
          } else {
            cap1.position.set(0, handleLen / 2, 0);
            cap2.position.set(0, -handleLen / 2, 0);
            post1.position.set(0, handleLen * 0.36, -0.011);
            post2.position.set(0, -handleLen * 0.36, -0.011);
            ros1.position.set(0, handleLen * 0.36, -0.018);
            ros2.position.set(0, -handleLen * 0.36, -0.018);
            const isUpperCab = b.centerY > 1000;
            const hx = b.doorHingeSide === 'right' ? -faceWidth / 2 + 0.038 : faceWidth / 2 - 0.038;
            const hy = isUpperCab ? -sy / 2 + 0.095 : sy / 2 - 0.095;
            handleGroup.position.set(hx, hy, faceThick / 2 + 0.019);
          }
          handleGroup.add(barMesh, cap1, cap2, post1, post2, ros1, ros2);
        }

        // Rotate handle group to match module rotationY
        if (b.rotationY === 90) {
          handleGroup.rotation.y = Math.PI / 2;
          const origZ = handleGroup.position.z;
          const origX = handleGroup.position.x;
          handleGroup.position.x = origZ;
          handleGroup.position.z = -origX;
        } else if (b.rotationY === 180) {
          handleGroup.rotation.y = Math.PI;
          handleGroup.position.x = -handleGroup.position.x;
          handleGroup.position.z = -handleGroup.position.z;
        } else if (b.rotationY === 270) {
          handleGroup.rotation.y = -Math.PI / 2;
          const origZ = handleGroup.position.z;
          const origX = handleGroup.position.x;
          handleGroup.position.x = -origZ;
          handleGroup.position.z = origX;
        }

        mesh.add(handleGroup);
      }

      furnitureGroup.add(mesh);
      interactableMeshes.push(mesh);
      nextAnimatedBoards.push({
        mesh,
        baseX,
        baseY,
        baseZ,
        sx,
        sy,
        sz,
        explodeVec: b.explodeVec,
        isDoor: Boolean(b.isDoor),
        isDrawer: Boolean(b.isDrawer),
        doorHingeSide: b.doorHingeSide,
        rotationY: b.rotationY ?? 0,
        toggleKey,
      });
    }

    // 2. Render composite multi-part module fixtures (Legs, Countertop Plinth, Sink, Cooktop, Oven, Clothes Rod)
    for (const mod of project.modules) {
      const mx = mod.x * scale;
      const my = mod.y * scale;
      const mz = mod.z * scale;
      const mw = mod.width * scale;
      const mh = mod.height * scale;
      const md = mod.depth * scale;
      const legH = mod.legHeight * scale;
      const ctH = (mod.hasCountertop ? mod.countertopThickness : 0) * scale;
      const rot = mod.rotationY ?? 0;

      // Local group anchored at module's rotated bounding box center
      const fixGroup = new THREE.Group();
      const footW = rot === 90 || rot === 270 ? md : mw;
      const footD = rot === 90 || rot === 270 ? mw : md;
      fixGroup.position.set(mx + footW / 2, my, mz + footD / 2);
      fixGroup.rotation.y = (rot * Math.PI) / 180;

      // A. Adjustable Legs (with top flange + leveling foot pad)
      if (mod.legHeight > 0) {
        const legPositions = [
          [-mw / 2 + 0.045, -md / 2 + 0.055],
          [mw / 2 - 0.045, -md / 2 + 0.055],
          [-mw / 2 + 0.045, md / 2 - 0.045],
          [mw / 2 - 0.045, md / 2 - 0.045],
        ];
        const flangeGeo = new THREE.CylinderGeometry(0.023, 0.021, 0.008, 12);
        const shaftGeo = new THREE.CylinderGeometry(0.015, 0.015, legH, 12);
        const footGeo = new THREE.CylinderGeometry(0.023, 0.026, 0.012, 12);
        for (const [lx, lz] of legPositions) {
          const legSub = new THREE.Group();
          const flange = new THREE.Mesh(flangeGeo.clone(), sharedMaterials.legBlackMat);
          flange.position.y = legH - 0.004;
          const shaft = new THREE.Mesh(shaftGeo.clone(), sharedMaterials.legBlackMat);
          shaft.position.y = legH / 2;
          shaft.castShadow = !isSoftwareGl;
          const footPad = new THREE.Mesh(footGeo.clone(), sharedMaterials.legBlackMat);
          footPad.position.y = 0.006;
          legSub.add(flange, shaft, footPad);
          legSub.position.set(lx, 0, lz);
          fixGroup.add(legSub);
        }
        flangeGeo.dispose();
        shaftGeo.dispose();
        footGeo.dispose();
      }

      const topSurfaceBaseY = legH + mh + ctH;

      // A2. Countertop Wall Backsplash Plinth (Stoleshnitsa devor plintusi)
      if (mod.hasCountertop) {
        const plinthMat = getBoardMaterial(
          mod.countertopColor || '#BDB7AA',
          false,
          true,
          false,
          false,
        );
        const plinthGroup = new THREE.Group();
        const plinthMesh = new THREE.Mesh(
          new RoundedBoxGeometry(mw, 0.032, 0.016, 2, 0.003),
          plinthMat,
        );
        plinthMesh.castShadow = !isSoftwareGl;
        plinthMesh.receiveShadow = !isSoftwareGl;
        plinthGroup.add(plinthMesh);
        plinthGroup.position.set(0, topSurfaceBaseY + 0.016, -md / 2 + 0.008);
        fixGroup.add(plinthGroup);
        nextAnimatedFixtures.push({
          group: plinthGroup,
          baseY: topSurfaceBaseY + 0.016,
          baseZ: -md / 2 + 0.008,
          explodeDeltaY: 0.31,
          explodeDeltaZ: 0,
        });
      }

      // B. Realistic Recessed Stainless Steel Sink & Gooseneck Faucet (`pastki_moyka`)
      if (mod.kind === 'pastki_moyka') {
        const sinkGroup = new THREE.Group();
        const sinkW = Math.min(mw * 0.72, 0.56);
        const sinkD = Math.min(md * 0.72, 0.42);
        const rimBorder = 0.032;
        const innerW = sinkW - rimBorder * 2;
        const innerD = sinkD - rimBorder * 2;
        const sinkZ = 0.025;

        // 4 outer rim strips framing the recessed bowl
        const topRim = new THREE.Mesh(
          new RoundedBoxGeometry(sinkW, 0.005, rimBorder, 2, 0.0015),
          sharedMaterials.sinkSteelMat,
        );
        topRim.position.set(0, 0.0025, sinkZ - sinkD / 2 + rimBorder / 2);

        const botRim = new THREE.Mesh(
          new RoundedBoxGeometry(sinkW, 0.005, rimBorder, 2, 0.0015),
          sharedMaterials.sinkSteelMat,
        );
        botRim.position.set(0, 0.0025, sinkZ + sinkD / 2 - rimBorder / 2);

        const leftRim = new THREE.Mesh(
          new RoundedBoxGeometry(rimBorder, 0.005, innerD, 2, 0.0015),
          sharedMaterials.sinkSteelMat,
        );
        leftRim.position.set(-sinkW / 2 + rimBorder / 2, 0.0025, sinkZ);

        const rightRim = new THREE.Mesh(
          new RoundedBoxGeometry(rimBorder, 0.005, innerD, 2, 0.0015),
          sharedMaterials.sinkSteelMat,
        );
        rightRim.position.set(sinkW / 2 - rimBorder / 2, 0.0025, sinkZ);

        // Recessed inner basin floor & stepped walls
        const basinFloor = new THREE.Mesh(
          new THREE.BoxGeometry(innerW, 0.003, innerD),
          sharedMaterials.sinkBasinMat,
        );
        basinFloor.position.set(0, 0.0015, sinkZ);
        basinFloor.receiveShadow = !isSoftwareGl;

        const wallBack = new THREE.Mesh(
          new THREE.BoxGeometry(innerW, 0.005, 0.004),
          sharedMaterials.sinkBasinMat,
        );
        wallBack.position.set(0, 0.0025, sinkZ - innerD / 2 + 0.002);

        const wallFront = new THREE.Mesh(
          new THREE.BoxGeometry(innerW, 0.005, 0.004),
          sharedMaterials.sinkBasinMat,
        );
        wallFront.position.set(0, 0.0025, sinkZ + innerD / 2 - 0.002);

        // Chrome drain basket + inner dark strainer ring
        const drainOuter = new THREE.Mesh(
          new THREE.CylinderGeometry(0.032, 0.032, 0.003, 18),
          sharedMaterials.chromeMat,
        );
        drainOuter.position.set(0, 0.0032, sinkZ - 0.015);

        const drainInner = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.02, 0.0035, 16),
          sharedMaterials.legBlackMat,
        );
        drainInner.position.set(0, 0.0035, sinkZ - 0.015);

        const drainCross = new THREE.Mesh(
          new THREE.CylinderGeometry(0.006, 0.006, 0.004, 12),
          sharedMaterials.chromeMat,
        );
        drainCross.position.set(0, 0.0038, sinkZ - 0.015);

        // Modern curved gooseneck mixer faucet
        const faucetX = 0.065;
        const faucetZ = sinkZ - sinkD / 2 + 0.016;

        const faucetCollar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.021, 0.024, 0.012, 16),
          sharedMaterials.chromeMat,
        );
        faucetCollar.position.set(faucetX, 0.011, faucetZ);

        const faucetBody = new THREE.Mesh(
          new THREE.CylinderGeometry(0.015, 0.017, 0.095, 16),
          sharedMaterials.chromeMat,
        );
        faucetBody.position.set(faucetX, 0.058, faucetZ);
        faucetBody.castShadow = !isSoftwareGl;

        const curve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(faucetX, 0.1, faucetZ),
          new THREE.Vector3(faucetX, 0.25, faucetZ),
          new THREE.Vector3(faucetX - 0.02, 0.31, faucetZ + 0.055),
          new THREE.Vector3(faucetX - 0.045, 0.285, faucetZ + 0.125),
          new THREE.Vector3(faucetX - 0.055, 0.23, faucetZ + 0.14),
        ]);
        const spoutGeo = new THREE.TubeGeometry(curve, 22, 0.0095, 12, false);
        const spoutMesh = new THREE.Mesh(spoutGeo, sharedMaterials.chromeMat);
        spoutMesh.castShadow = !isSoftwareGl;

        const aeratorMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.011, 0.0105, 0.014, 12),
          sharedMaterials.chromeMat,
        );
        aeratorMesh.position.set(faucetX - 0.055, 0.224, faucetZ + 0.14);

        const leverStem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.008, 0.008, 0.018, 10),
          sharedMaterials.chromeMat,
        );
        leverStem.rotation.z = Math.PI / 2;
        leverStem.position.set(faucetX + 0.02, 0.068, faucetZ);

        const mixerLever = new THREE.Mesh(
          new THREE.CylinderGeometry(0.004, 0.005, 0.072, 10),
          sharedMaterials.chromeMat,
        );
        mixerLever.rotation.x = -Math.PI / 6;
        mixerLever.position.set(faucetX + 0.03, 0.09, faucetZ + 0.015);

        sinkGroup.add(
          topRim,
          botRim,
          leftRim,
          rightRim,
          basinFloor,
          wallBack,
          wallFront,
          drainOuter,
          drainInner,
          drainCross,
          faucetCollar,
          faucetBody,
          spoutMesh,
          aeratorMesh,
          leverStem,
          mixerLever,
        );
        sinkGroup.position.set(0, topSurfaceBaseY, 0);
        fixGroup.add(sinkGroup);
        nextAnimatedFixtures.push({
          group: sinkGroup,
          baseY: topSurfaceBaseY,
          baseZ: 0,
          explodeDeltaY: 0.31,
          explodeDeltaZ: 0,
        });
      }

      // C. Realistic 4-Burner Glass-Gas Cooktop with Cast-Iron Grates & Knobs (`pastki_plita`)
      if (mod.kind === 'pastki_plita') {
        const hobGroup = new THREE.Group();
        const hobW = Math.min(mw * 0.76, 0.58);
        const hobD = Math.min(md * 0.78, 0.48);
        const hobZ = 0.02;

        const framePlate = new THREE.Mesh(
          new RoundedBoxGeometry(hobW + 0.008, 0.008, hobD + 0.008, 2, 0.002),
          sharedMaterials.sinkSteelMat,
        );
        framePlate.position.set(0, 0.004, hobZ);
        hobGroup.add(framePlate);

        const glassPlate = new THREE.Mesh(
          new RoundedBoxGeometry(hobW, 0.012, hobD, 2, 0.003),
          sharedMaterials.darkGlassMat,
        );
        glassPlate.position.set(0, 0.009, hobZ);
        glassPlate.castShadow = !isSoftwareGl;
        glassPlate.receiveShadow = !isSoftwareGl;
        hobGroup.add(glassPlate);

        const burnerCoords: [number, number, number][] = [
          [-hobW * 0.25, -hobD * 0.18, 0.044],
          [hobW * 0.24, -hobD * 0.18, 0.036],
          [-hobW * 0.25, hobD * 0.16, 0.038],
          [hobW * 0.24, hobD * 0.16, 0.048],
        ];

        for (const [bx, bz, radius] of burnerCoords) {
          const baseRing = new THREE.Mesh(
            new THREE.CylinderGeometry(radius * 0.92, radius * 1.06, 0.01, 18),
            sharedMaterials.sinkSteelMat,
          );
          baseRing.position.set(bx, 0.018, bz + hobZ);

          const crown = new THREE.Mesh(
            new THREE.CylinderGeometry(radius * 0.76, radius * 0.8, 0.008, 18),
            sharedMaterials.chromeMat,
          );
          crown.position.set(bx, 0.023, bz + hobZ);

          const cap = new THREE.Mesh(
            new THREE.CylinderGeometry(radius * 0.66, radius * 0.68, 0.006, 18),
            sharedMaterials.castIronMat,
          );
          cap.position.set(bx, 0.028, bz + hobZ);

          hobGroup.add(baseRing, crown, cap);
        }

        // Dual Cast-Iron Pan Support Grates (Reshetka)
        for (const gx of [-hobW * 0.25, hobW * 0.24]) {
          const grateW = hobW * 0.42;
          const grateD = hobD * 0.68;
          const grateY = 0.031;
          const grateZ = hobZ - 0.01;
          const barThick = 0.007;

          const fBar = new THREE.Mesh(
            new RoundedBoxGeometry(grateW, barThick, barThick, 1, 0.002),
            sharedMaterials.castIronMat,
          );
          fBar.position.set(gx, grateY, grateZ + grateD / 2);

          const bBar = new THREE.Mesh(
            new RoundedBoxGeometry(grateW, barThick, barThick, 1, 0.002),
            sharedMaterials.castIronMat,
          );
          bBar.position.set(gx, grateY, grateZ - grateD / 2);

          const lBar = new THREE.Mesh(
            new RoundedBoxGeometry(barThick, barThick, grateD, 1, 0.002),
            sharedMaterials.castIronMat,
          );
          lBar.position.set(gx - grateW / 2, grateY, grateZ);

          const rBar = new THREE.Mesh(
            new RoundedBoxGeometry(barThick, barThick, grateD, 1, 0.002),
            sharedMaterials.castIronMat,
          );
          rBar.position.set(gx + grateW / 2, grateY, grateZ);

          const midCross = new THREE.Mesh(
            new RoundedBoxGeometry(grateW, barThick, barThick * 0.85, 1, 0.0015),
            sharedMaterials.castIronMat,
          );
          midCross.position.set(gx, grateY, grateZ);

          const vertCross = new THREE.Mesh(
            new RoundedBoxGeometry(barThick * 0.85, barThick, grateD, 1, 0.0015),
            sharedMaterials.castIronMat,
          );
          vertCross.position.set(gx, grateY, grateZ);

          hobGroup.add(fBar, bBar, lBar, rBar, midCross, vertCross);
        }

        // 4 Front Rotary Control Knobs
        for (let k = 0; k < 4; k++) {
          const kx = -hobW * 0.26 + k * (hobW * 0.17);
          const kz = hobZ + hobD * 0.41;
          const knobBase = new THREE.Mesh(
            new THREE.CylinderGeometry(0.015, 0.016, 0.005, 14),
            sharedMaterials.chromeMat,
          );
          knobBase.position.set(kx, 0.016, kz);
          const knobCap = new THREE.Mesh(
            new THREE.CylinderGeometry(0.012, 0.013, 0.012, 14),
            sharedMaterials.legBlackMat,
          );
          knobCap.position.set(kx, 0.022, kz);
          hobGroup.add(knobBase, knobCap);
        }

        hobGroup.position.set(0, topSurfaceBaseY, 0);
        fixGroup.add(hobGroup);
        nextAnimatedFixtures.push({
          group: hobGroup,
          baseY: topSurfaceBaseY,
          baseZ: 0,
          explodeDeltaY: 0.31,
          explodeDeltaZ: 0,
        });
      }

      // D. Realistic Built-in Oven Front (`pastki_duxovka`)
      if (mod.kind === 'pastki_duxovka') {
        const ovenGroup = new THREE.Group();
        const ovenW = Math.max(0.28, mw - 0.012);
        const ovenH = Math.min(0.585, mh * 0.78);
        const bottomDrawerH = Math.max(0.1, mh - 0.6);

        const ovenFrame = new THREE.Mesh(
          new RoundedBoxGeometry(ovenW + 0.004, ovenH + 0.004, 0.018, 2, 0.002),
          sharedMaterials.sinkSteelMat,
        );
        ovenFrame.position.set(0, 0, -0.002);

        const ovenGlass = new THREE.Mesh(
          new RoundedBoxGeometry(ovenW - 0.006, ovenH - 0.006, 0.022, 2, 0.002),
          sharedMaterials.darkGlassMat,
        );
        ovenGlass.castShadow = !isSoftwareGl;

        const ctrlStrip = new THREE.Mesh(
          new RoundedBoxGeometry(ovenW - 0.008, 0.088, 0.025, 2, 0.002),
          sharedMaterials.sinkSteelMat,
        );
        ctrlStrip.position.set(0, ovenH / 2 - 0.048, 0.002);

        const timerDisplay = new THREE.Mesh(
          new THREE.BoxGeometry(ovenW * 0.24, 0.036, 0.004),
          sharedMaterials.legBlackMat,
        );
        timerDisplay.position.set(0, ovenH / 2 - 0.048, 0.014);

        const windowMesh = new THREE.Mesh(
          new RoundedBoxGeometry(ovenW * 0.76, ovenH * 0.56, 0.025, 2, 0.002),
          sharedMaterials.legBlackMat,
        );
        windowMesh.position.set(0, -0.042, 0.001);

        // Chrome inner oven wire rack silhouette inside window
        for (const ry of [-0.09, -0.01]) {
          const rackBar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.0022, 0.0022, ovenW * 0.64, 8),
            sharedMaterials.sinkSteelMat,
          );
          rackBar.rotation.z = Math.PI / 2;
          rackBar.position.set(0, ry, 0.014);
          ovenGroup.add(rackBar);
        }

        const ovenBar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.0075, 0.0075, ovenW * 0.8, 12),
          sharedMaterials.chromeMat,
        );
        ovenBar.rotation.z = Math.PI / 2;
        ovenBar.position.set(0, ovenH / 2 - 0.125, 0.032);
        ovenBar.castShadow = !isSoftwareGl;

        for (const sxOff of [-ovenW * 0.34, ovenW * 0.34]) {
          const standoff = new THREE.Mesh(
            new THREE.CylinderGeometry(0.005, 0.005, 0.022, 8),
            sharedMaterials.chromeMat,
          );
          standoff.rotation.x = Math.PI / 2;
          standoff.position.set(sxOff, ovenH / 2 - 0.125, 0.02);
          ovenGroup.add(standoff);
        }

        for (const dx of [-ovenW * 0.28, ovenW * 0.28]) {
          const dialBase = new THREE.Mesh(
            new THREE.CylinderGeometry(0.018, 0.019, 0.006, 16),
            sharedMaterials.chromeMat,
          );
          dialBase.rotation.x = Math.PI / 2;
          dialBase.position.set(dx, ovenH / 2 - 0.048, 0.015);

          const dial = new THREE.Mesh(
            new THREE.CylinderGeometry(0.014, 0.015, 0.018, 16),
            sharedMaterials.legBlackMat,
          );
          dial.rotation.x = Math.PI / 2;
          dial.position.set(dx, ovenH / 2 - 0.048, 0.022);
          ovenGroup.add(dialBase, dial);
        }

        const ovenBaseY = legH + bottomDrawerH + ovenH / 2 + 0.01;
        const ovenBaseZ = md / 2 + 0.012;
        ovenGroup.add(ovenFrame, ovenGlass, ctrlStrip, timerDisplay, windowMesh, ovenBar);
        ovenGroup.position.set(0, ovenBaseY, ovenBaseZ);
        fixGroup.add(ovenGroup);
        nextAnimatedFixtures.push({
          group: ovenGroup,
          baseY: ovenBaseY,
          baseZ: ovenBaseZ,
          explodeDeltaY: 0,
          explodeDeltaZ: 0.22,
        });
      }

      // E. Chrome Clothes Hanging Rod (`hasClothesRod`)
      if (mod.hasClothesRod) {
        const rodLen = Math.max(0.1, mw - 0.036);
        const rodGeo = new THREE.CylinderGeometry(0.012, 0.012, rodLen, 12);
        rodGeo.rotateZ(Math.PI / 2);
        const rodMesh = new THREE.Mesh(rodGeo, sharedMaterials.chromeMat);
        rodMesh.position.set(0, legH + mh - 0.26, 0.02);
        fixGroup.add(rodMesh);
      }

      furnitureGroup.add(fixGroup);
    }

    // 3. Optional Overall Dimension Ruler Callouts in 3D
    if (showDimensions && project.modules.length > 0) {
      const minX = Math.min(...project.modules.map((m) => m.x)) * scale;
      const maxX =
        Math.max(
          ...project.modules.map((m) =>
            m.x + (m.rotationY === 90 || m.rotationY === 270 ? m.depth : m.width),
          ),
        ) * scale;
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(minX, 0.015, 0.72),
        new THREE.Vector3(maxX, 0.015, 0.72),
      ]);
      const dimLine = new THREE.Line(lineGeo, sharedMaterials.dimLineMat);
      furnitureGroup.add(dimLine);
    }

    animStateRef.current.animatedBoards = nextAnimatedBoards;
    animStateRef.current.animatedFixtures = nextAnimatedFixtures;
    applyAnimatedTransforms();
    requestRender();
  }, [
    project,
    boards,
    selectedModuleId,
    selectedBoardId,
    wireframeMode,
    showDimensions,
  ]);

  // Trigger smooth time-based animations for explodeFactor, doorsOpen, and per-door clicks
  useEffect(() => {
    const ctx = sceneRef.current;
    if (!ctx) return;

    const now = performance.now();
    const state = animStateRef.current;
    let shouldAnimate = false;

    if (state.explodeTween.to !== explodeFactor) {
      const dist = Math.abs(explodeFactor - state.explodeTween.current);
      state.explodeTween.from = state.explodeTween.current;
      state.explodeTween.to = explodeFactor;
      state.explodeTween.startTime = now;
      state.explodeTween.duration = dist > 0.08 ? 500 : 120;
      shouldAnimate = true;
    }

    const activeKeys = new Set<string>();
    for (const entry of state.animatedBoards) {
      if (entry.toggleKey) activeKeys.add(entry.toggleKey);
    }

    for (const key of state.doorTweens.keys()) {
      if (!activeKeys.has(key)) {
        state.doorTweens.delete(key);
      }
    }

    for (const key of activeKeys) {
      const isOpen = doorOverrides[key] ?? doorsOpen;
      const target = isOpen ? 1 : 0;
      const existing = state.doorTweens.get(key);
      if (!existing) {
        state.doorTweens.set(key, {
          current: target,
          from: target,
          to: target,
          startTime: 0,
          duration: 0,
        });
      } else if (existing.to !== target) {
        const dist = Math.abs(target - existing.current);
        existing.from = existing.current;
        existing.to = target;
        existing.startTime = now;
        existing.duration = Math.max(180, Math.round(480 * dist));
        shouldAnimate = true;
      }
    }

    if (shouldAnimate) {
      ctx.requestRender();
    }
  }, [explodeFactor, doorsOpen, doorOverrides, boards]);

  return (
    <div
      ref={mountRef}
      data-testid="viewport-3d-canvas"
      style={{ touchAction: 'none' }}
      className="w-full h-full relative select-none overflow-hidden"
      aria-label="3D Mebel Konstruktori Sahnasi"
    />
  );
};
