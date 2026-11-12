import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { FurnitureProject, Generated3DBoard } from '../types/furniture';
import { decomposeProjectTo3DBoards, FINISH_PRESETS } from '../utils/raskroyEngine';

export type CameraViewPreset = 'isometric' | 'front' | 'side' | 'top';

interface Viewport3DProps {
  project: FurnitureProject;
  selectedModuleId: string | null;
  selectedBoardId: string | null;
  onSelectPart: (boardId: string | null, moduleId: string | null) => void;
  explodeFactor: number; // 0 to 1
  doorsOpen: boolean;
  wireframeMode: boolean;
  showDimensions: boolean;
  cameraPreset: CameraViewPreset;
  cameraTriggerCount: number;
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

function createParquetTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#C39B6A';
  ctx.fillRect(0, 0, 512, 512);

  const rows = 8;
  const cols = 4;
  const plankH = 512 / rows;
  const plankW = 512 / cols;

  const shades = ['#C69F6E', '#BE9563', '#CCA574', '#B88F5D', '#C29A68'];

  for (let r = 0; r < rows; r++) {
    const offset = (r % 2) * (plankW / 2);
    for (let c = -1; c <= cols; c++) {
      const x = c * plankW + offset;
      const y = r * plankH;
      const shade = shades[(r * 3 + c + 10) % shades.length];
      ctx.fillStyle = shade;
      ctx.fillRect(x, y, plankW, plankH);

      // Subtle wood grain lines
      ctx.strokeStyle = 'rgba(95, 65, 35, 0.09)';
      ctx.lineWidth = 1;
      for (let g = 1; g < 5; g++) {
        ctx.beginPath();
        ctx.moveTo(x + 2, y + (plankH / 5) * g);
        ctx.lineTo(x + plankW - 2, y + (plankH / 5) * g);
        ctx.stroke();
      }

      // Plank seam border
      ctx.strokeStyle = 'rgba(75, 50, 26, 0.38)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x, y, plankW, plankH);
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3.2, 3.2);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createWoodGrainBumpTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = '#929292';
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

export const Viewport3D: React.FC<Viewport3DProps> = ({
  project,
  selectedModuleId,
  selectedBoardId,
  onSelectPart,
  explodeFactor,
  doorsOpen,
  wireframeMode,
  showDimensions,
  cameraPreset,
  cameraTriggerCount,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const onSelectPartRef = useRef(onSelectPart);
  onSelectPartRef.current = onSelectPart;

  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    controls: OrbitControls;
    furnitureGroup: THREE.Group;
    roomGroup: THREE.Group;
    interactableMeshes: THREE.Mesh[];
    requestRender: () => void;
    setCameraView: (preset: CameraViewPreset, centerXMm: number) => void;
    woodBumpTex: THREE.CanvasTexture;
  } | null>(null);

  // Initialize Three.js WebGLRenderer & Scene once
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 960;
    const height = container.clientHeight || 640;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdbe0e6);
    scene.fog = new THREE.Fog(0xdbe0e6, 7.5, 18);

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.05, 30);
    camera.position.set(3.4, 2.35, 3.85);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio Environment Reflection (RoomEnvironment)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Balanced 3-Point Studio & Architectural Lighting
    const hemiLight = new THREE.HemisphereLight(0xf8fafc, 0xc2a382, 0.85);
    hemiLight.position.set(0, 4, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffaf0, 1.35);
    keyLight.position.set(3.2, 4.5, 3.8);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 12;
    const d = 3.2;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xe2e8f0, 0.45);
    fillLight.position.set(-2.5, 2.2, 2.5);
    scene.add(fillLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 - 0.01;
    controls.minDistance = 0.8;
    controls.maxDistance = 10;
    controls.target.set(1.4, 0.95, 0.35);
    controls.update();

    const roomGroup = new THREE.Group();
    const furnitureGroup = new THREE.Group();
    scene.add(roomGroup);
    scene.add(furnitureGroup);

    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const parquetTex = createParquetTexture(maxAniso);
    const woodBumpTex = createWoodGrainBumpTexture(maxAniso);

    // Build Architectural Corner Room (matching reference screenshot image_bea20856.png)
    // Floor with wooden parquet planks
    const floorGeo = new THREE.PlaneGeometry(5.6, 4.4);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      map: parquetTex,
      roughness: 0.62,
      metalness: 0.04,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(1.8, 0, 1.6);
    floorMesh.receiveShadow = true;
    roomGroup.add(floorMesh);

    // Soft contact grounding plane under cabinet line
    const contactGeo = new THREE.PlaneGeometry(3.4, 0.9);
    const contactMat = new THREE.MeshBasicMaterial({
      color: 0x261c10,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    });
    const contactPlane = new THREE.Mesh(contactGeo, contactMat);
    contactPlane.rotation.x = -Math.PI / 2;
    contactPlane.position.set(1.4, 0.002, 0.32);
    roomGroup.add(contactPlane);

    // Back wall (#ECEEF0)
    const backWallGeo = new THREE.BoxGeometry(4.6, 2.8, 0.08);
    const backWallMat = new THREE.MeshStandardMaterial({
      color: 0xedeff2,
      roughness: 0.88,
      metalness: 0.01,
    });
    const backWall = new THREE.Mesh(backWallGeo, backWallMat);
    backWall.position.set(2.15, 1.4, -0.04);
    backWall.receiveShadow = true;
    roomGroup.add(backWall);

    // Left wall (#CFD3D8)
    const leftWallGeo = new THREE.BoxGeometry(0.08, 2.8, 3.8);
    const leftWallMat = new THREE.MeshStandardMaterial({
      color: 0xd0d4d9,
      roughness: 0.88,
      metalness: 0.01,
    });
    const leftWall = new THREE.Mesh(leftWallGeo, leftWallMat);
    leftWall.position.set(-0.12, 1.4, 1.82);
    leftWall.receiveShadow = true;
    roomGroup.add(leftWall);

    // Subtle floor baseboard (Plintus)
    const baseboardMat = new THREE.MeshStandardMaterial({
      color: 0xb89264,
      roughness: 0.55,
      metalness: 0.05,
    });
    const backBaseboard = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.04, 0.015), baseboardMat);
    backBaseboard.position.set(2.15, 0.02, 0.008);
    roomGroup.add(backBaseboard);

    const leftBaseboard = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.04, 3.7), baseboardMat);
    leftBaseboard.position.set(-0.072, 0.02, 1.85);
    roomGroup.add(leftBaseboard);

    // On-demand render scheduler with Software-WebGL fenceSync guard
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

    function requestRender() {
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame(() => {
        renderDirty = false;
        renderer.render(scene, camera);
        const done = () => {
          renderBusy = false;
          if (renderDirty) requestRender();
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    }

    controls.addEventListener('change', requestRender);

    const setCameraView = (preset: CameraViewPreset, centerXMm: number) => {
      const cx = (centerXMm || 1400) / 1000;
      const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 1024;
      const targetOffsetX = isDesktop ? 0.32 : 0.0;
      if (preset === 'isometric') {
        camera.position.set(cx + 1.85, 2.38, 3.85);
        controls.target.set(cx + targetOffsetX, 0.98, 0.25);
      } else if (preset === 'front') {
        camera.position.set(cx + targetOffsetX, 1.15, 3.9);
        controls.target.set(cx + targetOffsetX, 1.05, 0.25);
      } else if (preset === 'side') {
        camera.position.set(cx + 3.4, 1.15, 0.85);
        controls.target.set(cx, 1.0, 0.28);
      } else if (preset === 'top') {
        camera.position.set(cx + targetOffsetX, 4.4, 1.2);
        controls.target.set(cx + targetOffsetX, 0.5, 0.35);
      }
      controls.update();
      requestRender();
    };

    const interactableMeshes: THREE.Mesh[] = [];
    const raycaster = new THREE.Raycaster();
    const pointerDownPos = new THREE.Vector2();
    const mouseNdc = new THREE.Vector2();

    const handlePointerDown = (e: PointerEvent) => {
      pointerDownPos.set(e.clientX, e.clientY);
    };

    const handlePointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (dist > 6) return; // Was a camera drag, not a click

      const rect = renderer.domElement.getBoundingClientRect();
      mouseNdc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseNdc.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseNdc, camera);
      const hits = raycaster.intersectObjects(interactableMeshes, false);

      if (hits.length > 0) {
        const hitMesh = hits[0].object as THREE.Mesh;
        const { boardId, moduleId } = hitMesh.userData;
        onSelectPartRef.current(boardId || null, moduleId || null);
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
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
      requestRender,
      setCameraView,
      woodBumpTex,
    };

    requestRender();

    return () => {
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      controls.dispose();
      parquetTex.dispose();
      woodBumpTex.dispose();
      renderer.dispose();
    };
  }, []);

  // Handle camera preset switches
  useEffect(() => {
    if (!sceneRef.current) return;
    const totalW =
      project.modules.reduce((max, m) => Math.max(max, m.x + m.width), 0) || 1600;
    sceneRef.current.setCameraView(cameraPreset, totalW / 2);
  }, [cameraPreset, cameraTriggerCount, project.id]);

  // Rebuild 3D furniture geometry when project, selection, explodeFactor, or doorsOpen changes
  useEffect(() => {
    const ctx = sceneRef.current;
    if (!ctx) return;

    const { furnitureGroup, interactableMeshes, requestRender, woodBumpTex } = ctx;

    // Dispose old meshes and materials inside furnitureGroup
    furnitureGroup.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh || (obj as THREE.LineSegments).isLineSegments) {
        const m = obj as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        if (Array.isArray(m.material)) {
          m.material.forEach((mat) => mat.dispose());
        } else if (m.material) {
          m.material.dispose();
        }
      }
    });
    furnitureGroup.clear();
    interactableMeshes.length = 0;

    const boards: Generated3DBoard[] = decomposeProjectTo3DBoards(project);
    const scale = 0.001; // mm to meters

    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xd4d8de,
      roughness: 0.22,
      metalness: 0.85,
    });

    const legBlackMat = new THREE.MeshStandardMaterial({
      color: 0x181b22,
      roughness: 0.45,
      metalness: 0.25,
    });

    const darkGlassMat = new THREE.MeshStandardMaterial({
      color: 0x16181d,
      roughness: 0.14,
      metalness: 0.2,
    });

    const sinkSteelMat = new THREE.MeshStandardMaterial({
      color: 0xadb4be,
      roughness: 0.28,
      metalness: 0.78,
    });

    const sinkBasinMat = new THREE.MeshStandardMaterial({
      color: 0x6f7782,
      roughness: 0.35,
      metalness: 0.72,
    });

    // 1. Render all individual boards (panels, shelves, doors, drawer boxes, countertops)
    for (const b of boards) {
      const isBoardSelected = selectedBoardId === b.id;
      const isModSelected = !selectedBoardId && selectedModuleId === b.moduleId;
      const isHighlighted = isBoardSelected || isModSelected;

      const preset = FINISH_PRESETS.find(
        (p) => p.hex.toLowerCase() === b.color.toLowerCase(),
      );

      const boardMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(b.color || '#EAE6DF'),
        roughness: preset?.roughness ?? (b.role === 'fasad_eshik' || b.role === 'tortma_fasad' ? 0.46 : 0.58),
        metalness: preset?.metalness ?? 0.04,
        wireframe: wireframeMode,
        bumpMap: preset?.woodGrain ? woodBumpTex : null,
        bumpScale: preset?.woodGrain ? 0.002 : 0,
      });

      if (isBoardSelected) {
        boardMat.emissive = new THREE.Color(0x1d4ed8);
        boardMat.emissiveIntensity = 0.12;
      }

      const sx = b.sizeX * scale;
      const sy = b.sizeY * scale;
      const sz = b.sizeZ * scale;

      const geo = new THREE.BoxGeometry(sx, sy, sz);
      const mesh = new THREE.Mesh(geo, boardMat);

      // Apply exploded view offset
      const expDist = explodeFactor * 0.24;
      let cx = b.centerX * scale + b.explodeVec[0] * expDist;
      let cy = b.centerY * scale + b.explodeVec[1] * expDist;
      let cz = b.centerZ * scale + b.explodeVec[2] * expDist;

      // Apply open doors / drawers transformation
      if (doorsOpen && b.isDrawer) {
        cz += 0.26;
      }

      mesh.position.set(cx, cy, cz);

      if (doorsOpen && b.isDoor) {
        const angle = b.doorHingeSide === 'right' ? Math.PI * 0.38 : -Math.PI * 0.38;
        if (b.doorHingeSide === 'top') {
          mesh.rotation.x = -Math.PI * 0.32;
          mesh.position.y += sy * 0.18;
          mesh.position.z += sy * 0.38;
        } else {
          const dir = b.doorHingeSide === 'right' ? 1 : -1;
          mesh.rotation.y = angle;
          mesh.position.x += dir * (sx / 2) * (1 - Math.cos(Math.abs(angle)));
          mesh.position.z += (sx / 2) * Math.sin(Math.abs(angle));
        }
      }

      mesh.castShadow = !isSoftwareGl;
      mesh.receiveShadow = !isSoftwareGl;
      mesh.userData = {
        boardId: b.id,
        moduleId: b.moduleId,
      };

      // Crisp architectural & CAD edge outlines (electric blue #1D6FF2 when selected, matching reference screenshot)
      const edgesGeo = new THREE.EdgesGeometry(geo);
      const lineMat = new THREE.LineBasicMaterial({
        color: isHighlighted ? 0x1d6ff2 : 0x646b75,
        transparent: true,
        opacity: isHighlighted ? 1.0 : 0.48,
      });
      const lineSegs = new THREE.LineSegments(edgesGeo, lineMat);
      mesh.add(lineSegs);

      // Add multi-part metallic handles to doors and drawer fronts
      if (b.role === 'fasad_eshik' || b.role === 'tortma_fasad') {
        const handleGroup = new THREE.Group();
        const parentMod = project.modules.find((m) => m.id === b.moduleId);
        const isHorizHandle =
          b.role === 'tortma_fasad' || parentMod?.handleOrientation === 'horizontal';

        const handleLen = 0.135;
        const barGeo = new THREE.CylinderGeometry(0.0055, 0.0055, handleLen, 10);
        const postGeo = new THREE.CylinderGeometry(0.0045, 0.0045, 0.022, 8);
        postGeo.rotateX(Math.PI / 2);

        const barMesh = new THREE.Mesh(barGeo, chromeMat.clone());
        const post1 = new THREE.Mesh(postGeo, chromeMat.clone());
        const post2 = new THREE.Mesh(postGeo, chromeMat.clone());

        if (isHorizHandle) {
          barMesh.rotation.z = Math.PI / 2;
          post1.position.set(-handleLen * 0.38, 0, -0.01);
          post2.position.set(handleLen * 0.38, 0, -0.01);
          const hy = b.role === 'fasad_eshik' ? sy / 2 - 0.045 : sy * 0.15;
          handleGroup.position.set(0, hy, sz / 2 + 0.018);
        } else {
          post1.position.set(0, handleLen * 0.38, -0.01);
          post2.position.set(0, -handleLen * 0.38, -0.01);
          // Place vertical handle near opening edge and top/bottom depending on upper vs lower cabinet
          const isUpperCab = (parentMod?.y ?? 0) > 800;
          const hx =
            b.doorHingeSide === 'right' ? -sx / 2 + 0.038 : sx / 2 - 0.038;
          const hy = isUpperCab ? -sy / 2 + 0.095 : sy / 2 - 0.095;
          handleGroup.position.set(hx, hy, sz / 2 + 0.018);
        }

        handleGroup.add(barMesh, post1, post2);
        mesh.add(handleGroup);
      }

      furnitureGroup.add(mesh);
      interactableMeshes.push(mesh);
    }

    // 2. Render composite multi-part module fixtures (Adjustable Legs, Stainless Sink + Faucet, 4-Burner Hob)
    for (const mod of project.modules) {
      const mx = mod.x * scale;
      const my = mod.y * scale;
      const mz = mod.z * scale;
      const mw = mod.width * scale;
      const mh = mod.height * scale;
      const md = mod.depth * scale;
      const legH = mod.legHeight * scale;
      const ctH = (mod.hasCountertop ? mod.countertopThickness : 0) * scale;

      // A. 4 Composite Black Adjustable Legs (Oyoqchalar)
      if (mod.legHeight > 0) {
        const legPositions = [
          [mx + 0.045, mz + 0.055],
          [mx + mw - 0.045, mz + 0.055],
          [mx + 0.045, mz + md - 0.045],
          [mx + mw - 0.045, mz + md - 0.045],
        ];
        for (const [lx, lz] of legPositions) {
          const legGroup = new THREE.Group();
          const shaft = new THREE.Mesh(
            new THREE.CylinderGeometry(0.016, 0.016, legH, 12),
            legBlackMat.clone(),
          );
          shaft.position.y = legH / 2;
          const footPad = new THREE.Mesh(
            new THREE.CylinderGeometry(0.024, 0.026, 0.012, 12),
            legBlackMat.clone(),
          );
          footPad.position.y = 0.006;
          legGroup.add(shaft, footPad);
          legGroup.position.set(lx, my, lz);
          furnitureGroup.add(legGroup);
        }
      }

      const topSurfaceY = my + legH + mh + ctH + explodeFactor * 0.31;

      // B. Stainless Steel Sink + Swan-Neck Faucet (`pastki_moyka`)
      if (mod.kind === 'pastki_moyka') {
        const sinkGroup = new THREE.Group();
        const sinkW = Math.min(mw * 0.72, 0.56);
        const sinkD = Math.min(md * 0.72, 0.42);

        // Outer stainless steel rim frame
        const rimMesh = new THREE.Mesh(
          new THREE.BoxGeometry(sinkW, 0.012, sinkD),
          sinkSteelMat.clone(),
        );
        rimMesh.position.set(0, 0.006, 0.02);

        // Inner recessed dark basin well
        const basinMesh = new THREE.Mesh(
          new THREE.BoxGeometry(sinkW - 0.055, 0.014, sinkD - 0.065),
          sinkBasinMat.clone(),
        );
        basinMesh.position.set(0, 0.008, 0.025);

        // Drain strainer disc
        const drainMesh = new THREE.Mesh(
          new THREE.CylinderGeometry(0.026, 0.026, 0.016, 16),
          chromeMat.clone(),
        );
        drainMesh.position.set(0, 0.009, 0.01);

        // Faucet base pillar
        const faucetBase = new THREE.Mesh(
          new THREE.CylinderGeometry(0.018, 0.022, 0.09, 14),
          chromeMat.clone(),
        );
        faucetBase.position.set(0.08, 0.045, -sinkD / 2 + 0.015);

        // Faucet tall vertical stem
        const faucetStem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.01, 0.01, 0.22, 12),
          chromeMat.clone(),
        );
        faucetStem.position.set(0.08, 0.16, -sinkD / 2 + 0.015);

        // Faucet angled spout arm
        const faucetSpout = new THREE.Mesh(
          new THREE.CylinderGeometry(0.009, 0.009, 0.18, 12),
          chromeMat.clone(),
        );
        faucetSpout.rotation.x = Math.PI / 2.5;
        faucetSpout.position.set(0.02, 0.25, -sinkD / 2 + 0.08);

        // Faucet mixer handle lever
        const mixerLever = new THREE.Mesh(
          new THREE.CylinderGeometry(0.004, 0.004, 0.065, 8),
          chromeMat.clone(),
        );
        mixerLever.rotation.z = Math.PI / 2;
        mixerLever.position.set(0.115, 0.065, -sinkD / 2 + 0.015);

        sinkGroup.add(
          rimMesh,
          basinMesh,
          drainMesh,
          faucetBase,
          faucetStem,
          faucetSpout,
          mixerLever,
        );
        sinkGroup.position.set(mx + mw / 2, topSurfaceY, mz + md / 2);
        furnitureGroup.add(sinkGroup);
      }

      // C. 4-Burner Black Glass Cooktop Hob (`pastki_plita`)
      if (mod.kind === 'pastki_plita') {
        const hobGroup = new THREE.Group();
        const hobW = Math.min(mw * 0.76, 0.58);
        const hobD = Math.min(md * 0.78, 0.48);

        // Tempered black glass base
        const glassPlate = new THREE.Mesh(
          new THREE.BoxGeometry(hobW, 0.014, hobD),
          darkGlassMat.clone(),
        );
        glassPlate.position.set(0, 0.007, 0.02);
        hobGroup.add(glassPlate);

        // 4 burners (2 front, 2 back)
        const burnerCoords: [number, number, number][] = [
          [-hobW * 0.26, -hobD * 0.2, 0.044],
          [hobW * 0.24, -hobD * 0.2, 0.036],
          [-hobW * 0.26, hobD * 0.22, 0.038],
          [hobW * 0.24, hobD * 0.22, 0.048],
        ];

        for (const [bx, bz, radius] of burnerCoords) {
          const ring = new THREE.Mesh(
            new THREE.CylinderGeometry(radius, radius * 1.06, 0.012, 20),
            chromeMat.clone(),
          );
          ring.position.set(bx, 0.016, bz + 0.02);

          const cap = new THREE.Mesh(
            new THREE.CylinderGeometry(radius * 0.62, radius * 0.62, 0.016, 16),
            legBlackMat.clone(),
          );
          cap.position.set(bx, 0.018, bz + 0.02);

          hobGroup.add(ring, cap);
        }

        hobGroup.position.set(mx + mw / 2, topSurfaceY, mz + md / 2);
        furnitureGroup.add(hobGroup);
      }

      // D. Built-in Oven Front (`pastki_duxovka`)
      if (mod.kind === 'pastki_duxovka') {
        const ovenGroup = new THREE.Group();
        const ovenW = Math.max(0.28, mw - 0.012);
        const ovenH = Math.min(0.585, mh * 0.78);
        const bottomDrawerH = Math.max(0.1, mh - 0.6);

        // Dark glass oven front body
        const ovenGlass = new THREE.Mesh(
          new THREE.BoxGeometry(ovenW, ovenH, 0.022),
          darkGlassMat.clone(),
        );
        // Top brushed steel control strip
        const ctrlStrip = new THREE.Mesh(
          new THREE.BoxGeometry(ovenW - 0.008, 0.085, 0.025),
          sinkSteelMat.clone(),
        );
        ctrlStrip.position.set(0, ovenH / 2 - 0.048, 0.002);

        // Oven viewing window frame
        const windowMesh = new THREE.Mesh(
          new THREE.BoxGeometry(ovenW * 0.74, ovenH * 0.56, 0.026),
          legBlackMat.clone(),
        );
        windowMesh.position.set(0, -0.04, 0.001);

        // Stainless horizontal oven bar handle
        const ovenBar = new THREE.Mesh(
          new THREE.CylinderGeometry(0.007, 0.007, ovenW * 0.78, 12),
          chromeMat.clone(),
        );
        ovenBar.rotation.z = Math.PI / 2;
        ovenBar.position.set(0, ovenH / 2 - 0.125, 0.028);

        // Two rotary dials
        for (const dx of [-ovenW * 0.28, ovenW * 0.28]) {
          const dial = new THREE.Mesh(
            new THREE.CylinderGeometry(0.015, 0.015, 0.018, 14),
            chromeMat.clone(),
          );
          dial.rotation.x = Math.PI / 2;
          dial.position.set(dx, ovenH / 2 - 0.048, 0.018);
          ovenGroup.add(dial);
        }

        ovenGroup.add(ovenGlass, ctrlStrip, windowMesh, ovenBar);
        ovenGroup.position.set(
          mx + mw / 2,
          my + legH + bottomDrawerH + ovenH / 2 + 0.01,
          mz + md + 0.012 + explodeFactor * 0.22,
        );
        furnitureGroup.add(ovenGroup);
      }

      // E. Chrome Clothes Hanging Rod (`hasClothesRod`)
      if (mod.hasClothesRod) {
        const rodLen = Math.max(0.1, mw - 0.036);
        const rodGeo = new THREE.CylinderGeometry(0.012, 0.012, rodLen, 14);
        rodGeo.rotateZ(Math.PI / 2);
        const rodMesh = new THREE.Mesh(rodGeo, chromeMat.clone());
        rodMesh.position.set(
          mx + mw / 2,
          my + legH + mh - 0.26,
          mz + md * 0.52,
        );
        furnitureGroup.add(rodMesh);
      }
    }

    // 3. Optional Overall Dimension Ruler Callouts in 3D
    if (showDimensions && project.modules.length > 0) {
      const minX = Math.min(...project.modules.map((m) => m.x)) * scale;
      const maxX = Math.max(...project.modules.map((m) => m.x + m.width)) * scale;
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(minX, 0.015, 0.72),
        new THREE.Vector3(maxX, 0.015, 0.72),
      ]);
      const dimLine = new THREE.Line(
        lineGeo,
        new THREE.LineBasicMaterial({ color: 0xf59e0b }),
      );
      furnitureGroup.add(dimLine);
    }

    requestRender();
  }, [
    project,
    selectedModuleId,
    selectedBoardId,
    explodeFactor,
    doorsOpen,
    wireframeMode,
    showDimensions,
  ]);

  return (
    <div
      ref={mountRef}
      data-testid="viewport-3d-canvas"
      className="w-full h-full relative select-none overflow-hidden"
      aria-label="3D Mebel Konstruktori Sahnasi"
    />
  );
};
