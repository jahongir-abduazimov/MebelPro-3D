import {
  BOMSummary,
  CustomPart,
  CutListRow,
  EdgeBandType,
  EdgeConfig,
  FinishPreset,
  FurnitureModule,
  FurnitureProject,
  Generated3DBoard,
  HardwareItem,
  MaterialId,
  MaterialPriceConfig,
  MaterialSpec,
  ModuleCostEstimate,
  ModuleKind,
  PartOverride,
  PartRole,
  PlacedSheetPart,
  RaskroySheet,
} from '../types/furniture';

export const PART_ROLE_LABELS: Record<PartRole, { label: string; short: string; badgeColor: string }> = {
  yon_devor: {
    label: 'Yon devor (Stoyka)',
    short: 'Stoyka',
    badgeColor: 'text-amber-300 border-amber-500/30 bg-amber-500/10',
  },
  ostki_ustki: {
    label: 'Ostki / Ustki qism (Gorizont)',
    short: 'Gorizont',
    badgeColor: 'text-sky-300 border-sky-500/30 bg-sky-500/10',
  },
  tokcha: {
    label: 'Ichki tokcha (Polka)',
    short: 'Polka',
    badgeColor: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10',
  },
  orta_devor: {
    label: "O'rta to'siq (Peregorodka)",
    short: 'Peregorodka',
    badgeColor: 'text-teal-300 border-teal-500/30 bg-teal-500/10',
  },
  fasad_eshik: {
    label: 'Fasad / Eshik',
    short: 'Fasad eshik',
    badgeColor: 'text-indigo-300 border-indigo-500/30 bg-indigo-500/10',
  },
  tortma_fasad: {
    label: 'Tortma fasadi (Nakladka)',
    short: 'Tortma fasad',
    badgeColor: 'text-violet-300 border-violet-500/30 bg-violet-500/10',
  },
  tortma_korpus: {
    label: 'Tortma qutisi detali',
    short: 'Tortma quti',
    badgeColor: 'text-fuchsia-300 border-fuchsia-500/30 bg-fuchsia-500/10',
  },
  tsarga: {
    label: 'Tsarga / Planka / Tsokol',
    short: 'Tsarga',
    badgeColor: 'text-orange-300 border-orange-500/30 bg-orange-500/10',
  },
  orqa_devor: {
    label: 'Orqa devor (XDF / DVP)',
    short: 'XDF Orqa',
    badgeColor: 'text-slate-300 border-slate-500/30 bg-slate-500/10',
  },
  stoleshnitsa: {
    label: 'Stol usti (Stoleshnitsa)',
    short: 'Stoleshnitsa',
    badgeColor: 'text-lime-300 border-lime-500/30 bg-lime-500/10',
  },
  boshqa: {
    label: 'Maxsus / Alohida detal',
    short: 'Maxsus',
    badgeColor: 'text-rose-300 border-rose-500/30 bg-rose-500/10',
  },
};

export const MATERIAL_SPECS: Record<MaterialId, MaterialSpec> = {
  ldsp_16: {
    id: 'ldsp_16',
    name: 'LDSP 16mm (Standart 2750×1830)',
    shortName: 'LDSP 16mm',
    thickness: 16,
    sheetLength: 2750,
    sheetWidth: 1830,
    defaultPricePerSheet: 480000,
    isSheet: true,
  },
  ldsp_18: {
    id: 'ldsp_18',
    name: 'LDSP 18mm (2800×2070)',
    shortName: 'LDSP 18mm',
    thickness: 18,
    sheetLength: 2800,
    sheetWidth: 2070,
    defaultPricePerSheet: 620000,
    isSheet: true,
  },
  lmdf_16: {
    id: 'lmdf_16',
    name: 'LMDF 16mm Fasad (2800×2070)',
    shortName: 'LMDF 16mm',
    thickness: 16,
    sheetLength: 2800,
    sheetWidth: 2070,
    defaultPricePerSheet: 790000,
    isSheet: true,
  },
  akril_mdf_18: {
    id: 'akril_mdf_18',
    name: 'Akril MDF 18mm (2800×1220)',
    shortName: 'Akril 18mm',
    thickness: 18,
    sheetLength: 2800,
    sheetWidth: 1220,
    defaultPricePerSheet: 980000,
    isSheet: true,
  },
  xdf_4: {
    id: 'xdf_4',
    name: 'XDF / DVP 4mm Orqa devor (2750×1700)',
    shortName: 'XDF 4mm',
    thickness: 4,
    sheetLength: 2750,
    sheetWidth: 1700,
    defaultPricePerSheet: 145000,
    isSheet: true,
  },
  stoleshnitsa_38: {
    id: 'stoleshnitsa_38',
    name: 'Stoleshnitsa 38mm (3000×600)',
    shortName: 'Stoleshnitsa 38mm',
    thickness: 38,
    sheetLength: 3000,
    sheetWidth: 600,
    defaultPricePerSheet: 850000,
    isSheet: false,
  },
};

export const FINISH_PRESETS: FinishPreset[] = [
  { id: 'krem_mat', name: 'Krem Matoviy (Slonovaya kost)', hex: '#E2DDD2', roughness: 0.56, metalness: 0.03 },
  { id: 'oq_qor', name: 'Oq Qor (Belosnejniy)', hex: '#F0F1F3', roughness: 0.44, metalness: 0.04 },
  { id: 'kvars_bej', name: 'Kvars Bej Tosh', hex: '#BCB6A9', roughness: 0.42, metalness: 0.06 },
  { id: 'eman_sonoma', name: 'Eman Sonoma (Dub)', hex: '#C8A878', roughness: 0.65, metalness: 0.03, woodGrain: true },
  { id: 'yong_oq', name: "Klassik Yong'oq (Orex)", hex: '#7C5836', roughness: 0.62, metalness: 0.04, woodGrain: true },
  { id: 'antratsit', name: 'Antratsit Grafit', hex: '#373C45', roughness: 0.50, metalness: 0.10 },
  { id: 'kashemir', name: 'Kashemir Kulrang', hex: '#D4CFC7', roughness: 0.52, metalness: 0.05 },
  { id: 'zumrad', name: 'Zumrad Yashil Mat', hex: '#2D4F46', roughness: 0.48, metalness: 0.06 },
  { id: 'kapuchino', name: 'Kapuchino Mokko', hex: '#A58E7C', roughness: 0.48, metalness: 0.05 },
  { id: 'loft_beton', name: 'Loft Kulrang Beton', hex: '#8C929AC0'.slice(0, 7), roughness: 0.68, metalness: 0.04 },
  { id: 'oltin_eman', name: 'Oltin Eman (Kraft)', hex: '#B6864C', roughness: 0.60, metalness: 0.03, woodGrain: true },
  { id: 'toq_ko_k', name: 'Okean Moviy Mat', hex: '#2B4257', roughness: 0.46, metalness: 0.06 },
];

export const DEFAULT_PRICES: MaterialPriceConfig = {
  ldsp_16: 480000,
  ldsp_18: 620000,
  lmdf_16: 790000,
  akril_mdf_18: 980000,
  xdf_4: 145000,
  stoleshnitsa_38: 290000,   // 1 pog.m narxi
  kromka_04: 2500,           // 1 metr PVX 0.4mm
  kromka_20: 7500,           // 1 metr PVX 2mm
  hinge_pair: 18000,         // 1 juft oshiq-moshiq (dovodchik bilan)
  handle: 15000,             // 1 dona profil/skoba tutqich
  drawer_slide: 45000,       // 1 juft teleskopik napravlyayushie
  leg: 4000,                 // 1 dona rostlanuvchi oyoqcha
  konfirmat: 350,            // 1 dona yevrovint 7x50
  gas_lift: 14000,           // 1 dona gazlift (tepaga ochiluvchi eshik uchun)
  clothes_rod_set: 35000,    // 1 to'plam kiyim ilgich xrom trubasi va flanets
  cutting_per_sheet: 45000,  // 1 list raskroy kesish xizmati
  edge_gluing_per_m: 3000,   // 1 metr kromka yopishtirish xizmati
  assembly_percent: 15,      // Usta yig'ish va o'rnatish foizi (%)
  delivery_flat: 150000,     // Yetkazib berish (transport)
};

export interface ModuleTemplateInfo {
  kind: ModuleKind;
  category: 'oshxona' | 'shkaf' | 'ofis';
  title: string;
  subtitle: string;
  defaultWidth: number;
  defaultHeight: number;
  defaultDepth: number;
  isUpper?: boolean;
}

export const MODULE_TEMPLATES: ModuleTemplateInfo[] = [
  {
    kind: 'pastki_eshikli',
    category: 'oshxona',
    title: 'Pastki shkaf (Eshikli)',
    subtitle: '1 yoki 2 eshikli standart ostki shkaf, ichki tokcha bilan',
    defaultWidth: 600,
    defaultHeight: 720,
    defaultDepth: 560,
  },
  {
    kind: 'pastki_moyka',
    category: 'oshxona',
    title: 'Moykali shkaf (Rakovina)',
    subtitle: "Oshxona moykasi va krani o'rnatiladigan 2 eshikli ostki shkaf",
    defaultWidth: 800,
    defaultHeight: 720,
    defaultDepth: 560,
  },
  {
    kind: 'pastki_tortmali',
    category: 'oshxona',
    title: 'Tortmali shkaf (Komod)',
    subtitle: '3 ta teleskopik tortmali qulay shkaf bloki',
    defaultWidth: 800,
    defaultHeight: 720,
    defaultDepth: 560,
  },
  {
    kind: 'pastki_plita',
    category: 'oshxona',
    title: 'Gaz plitali shkaf (Varochnaya)',
    subtitle: 'Ustida 4 konforkali gaz/induksion plita joylashgan shkaf',
    defaultWidth: 800,
    defaultHeight: 720,
    defaultDepth: 560,
  },
  {
    kind: 'pastki_duxovka',
    category: 'oshxona',
    title: 'Duxovka shkafi (Pech uchun)',
    subtitle: "O'rnatiladigan duxovka pechi va pastki tortmali maxsus shkaf",
    defaultWidth: 600,
    defaultHeight: 720,
    defaultDepth: 560,
  },
  {
    kind: 'yuqori_shkaf',
    category: 'oshxona',
    title: 'Yuqori osma shkaf',
    subtitle: 'Devorga osiladigan oshxona yoki xona shkafi',
    defaultWidth: 800,
    defaultHeight: 720,
    defaultDepth: 320,
    isUpper: true,
  },
  {
    kind: 'yuqori_vityajka',
    category: 'oshxona',
    title: 'Dudburon (Vityajka) shkafi',
    subtitle: 'Plita ustiga osiladigan qisqartirilgan osma shkaf',
    defaultWidth: 800,
    defaultHeight: 480,
    defaultDepth: 320,
    isUpper: true,
  },
  {
    kind: 'penal_kalonka',
    category: 'oshxona',
    title: 'Oshxona Penali (Baland Kalonka)',
    subtitle: "Idish-tovoq va maishiy texnika uchun baland oshxona shkafi",
    defaultWidth: 600,
    defaultHeight: 2140,
    defaultDepth: 560,
  },
  {
    kind: 'shkaf_kupe',
    category: 'shkaf',
    title: 'Baland Kiyim Shkafi (Garderob)',
    subtitle: "Tokchali, kiyim ilgich trubali va 2 eshikli baland garderob",
    defaultWidth: 900,
    defaultHeight: 2100,
    defaultDepth: 580,
  },
  {
    kind: 'oyoq_kiyim',
    category: 'shkaf',
    title: 'Oyoq kiyim shkafi (Prixojka)',
    subtitle: "Yo'lak uchun ixcham va ko'p tokchali poyabzal tumbasi",
    defaultWidth: 800,
    defaultHeight: 900,
    defaultDepth: 380,
  },
  {
    kind: 'tv_tumba',
    category: 'ofis',
    title: 'TV Tumba (Mehmonxona)',
    subtitle: "Televizor osti uchun keng tumba, yon bo'lma va tokchalar bilan",
    defaultWidth: 1600,
    defaultHeight: 480,
    defaultDepth: 450,
  },
  {
    kind: 'yozuv_stoli',
    category: 'ofis',
    title: 'Yozuv / Kompyuter Stoli',
    subtitle: 'Mustahkam yon stoykalar, tsarga va qalin stoleshnitsali stol',
    defaultWidth: 1200,
    defaultHeight: 730,
    defaultDepth: 600,
  },
  {
    kind: 'kitob_javoni',
    category: 'ofis',
    title: 'Ochiq Kitob Javoni (Stellaj)',
    subtitle: "Eshiksiz, ko'p tokchali universal kitob va hujjat javoni",
    defaultWidth: 800,
    defaultHeight: 1800,
    defaultDepth: 350,
  },
];

export function createEdgeConfig(
  l1: EdgeBandType = 'none',
  l2: EdgeBandType = 'none',
  w1: EdgeBandType = 'none',
  w2: EdgeBandType = 'none',
): EdgeConfig {
  return { l1, l2, w1, w2 };
}

export function calcPartEdgeMeters(
  cutLength: number,
  cutWidth: number,
  edges: EdgeConfig,
  quantity: number,
): { edge04: number; edge20: number } {
  let mm04 = 0;
  let mm20 = 0;

  const addEdge = (lenMm: number, type: EdgeBandType) => {
    if (type === '0.4mm') mm04 += lenMm;
    else if (type === '2mm') mm20 += lenMm;
  };

  addEdge(cutLength, edges.l1);
  addEdge(cutLength, edges.l2);
  addEdge(cutWidth, edges.w1);
  addEdge(cutWidth, edges.w2);

  // Add 10% technological allowance for edge banding trimmer waste
  const factor = 1.1;
  return {
    edge04: Number(((mm04 * quantity * factor) / 1000).toFixed(2)),
    edge20: Number(((mm20 * quantity * factor) / 1000).toFixed(2)),
  };
}

/**
 * Helper to transform a module-local board (in 0..W, Y, 0..D) into room coordinates
 * taking `rotationY` (0, 90, 180, 270) into account so the module's bounding box minX=mod.x, minZ=mod.z.
 */
function transformBoardForRotation(
  raw: Generated3DBoard,
  mod: FurnitureModule,
): Generated3DBoard {
  const rot = mod.rotationY ?? 0;
  if (rot === 0) return { ...raw, rotationY: 0 };

  const W = mod.width;
  const D = mod.depth;
  const lx = raw.centerX - mod.x;
  const lz = raw.centerZ - mod.z;

  let nx = lx;
  let nz = lz;
  let nsx = raw.sizeX;
  let nsz = raw.sizeZ;
  let ex = raw.explodeVec[0];
  let ez = raw.explodeVec[2];

  if (rot === 90) {
    // +Z front becomes +X front; footprint X=[x..x+D], Z=[z..z+W]
    nx = lz;
    nz = W - lx;
    nsx = raw.sizeZ;
    nsz = raw.sizeX;
    ex = raw.explodeVec[2];
    ez = -raw.explodeVec[0];
  } else if (rot === 180) {
    // +Z front becomes -Z front; footprint X=[x..x+W], Z=[z..z+D]
    nx = W - lx;
    nz = D - lz;
    ex = -raw.explodeVec[0];
    ez = -raw.explodeVec[2];
  } else if (rot === 270) {
    // +Z front becomes -X front; footprint X=[x..x+D], Z=[z..z+W]
    nx = D - lz;
    nz = lx;
    nsx = raw.sizeZ;
    nsz = raw.sizeX;
    ex = -raw.explodeVec[2];
    ez = raw.explodeVec[0];
  }

  return {
    ...raw,
    centerX: mod.x + nx,
    centerZ: mod.z + nz,
    sizeX: nsx,
    sizeZ: nsz,
    rotationY: rot,
    explodeVec: [ex, raw.explodeVec[1], ez],
  };
}

/**
 * Decomposes a single parametric FurnitureModule into exact 3D boards with millimeter accuracy.
 */
export function decomposeModuleToBoards(
  mod: FurnitureModule,
  overrides: Record<string, PartOverride> = {},
  includeHidden: boolean = false,
): Generated3DBoard[] {
  const boards: Generated3DBoard[] = [];
  const t = mod.boardThickness;
  const W = mod.width;
  const H = mod.height;
  const D = mod.depth;
  const baseX = mod.x;
  const baseY = mod.y + mod.legHeight;
  const baseZ = mod.z;

  const innerW = Math.max(50, W - 2 * t);
  const facadeStyle = mod.facadeStyle ?? 'overlay';
  const handleStyle = mod.handleStyle ?? 'bar';

  const effectiveTopType =
    mod.topPanelType ??
    (mod.kind === 'yozuv_stoli'
      ? 'none'
      : mod.kind === 'pastki_moyka' || mod.kind === 'pastki_plita' || mod.kind === 'pastki_duxovka'
      ? 'tsarga'
      : 'full');

  const effectiveBottomType =
    mod.bottomPanelType ?? (mod.kind === 'yozuv_stoli' ? 'none' : 'full');

  const effectiveBackType = mod.backPanelType ?? 'overlay_xdf';

  const pushBoard = (raw: Generated3DBoard) => {
    const ov = overrides[raw.id];
    if (ov?.hidden && !includeHidden) {
      return;
    }
    if (ov) {
      const hasChange = Boolean(
        ov.role !== undefined ||
          ov.name !== undefined ||
          ov.material !== undefined ||
          ov.edges !== undefined ||
          ov.cutLength !== undefined ||
          ov.cutWidth !== undefined ||
          ov.color !== undefined ||
          ov.hidden !== undefined,
      );
      raw = {
        ...raw,
        role: ov.role ?? raw.role,
        name: ov.name ?? raw.name,
        material: ov.material ?? raw.material,
        color: ov.color ?? raw.color,
        edges: ov.edges ? { ...ov.edges } : raw.edges,
        cutLength: ov.cutLength ?? raw.cutLength,
        cutWidth: ov.cutWidth ?? raw.cutWidth,
        isOverridden: hasChange,
      };
    }
    boards.push(transformBoardForRotation(raw, mod));
  };

  // 1. Left Side Panel (Chap yon devor - Stoyka)
  pushBoard({
    id: `${mod.id}:side_left`,
    moduleId: mod.id,
    moduleName: mod.name,
    name: 'Yon devor (Chap stoyka)',
    role: 'yon_devor',
    material: mod.bodyMaterial,
    color: mod.bodyColor,
    cutLength: H,
    cutWidth: D,
    thickness: t,
    edges: createEdgeConfig('0.4mm', 'none', '0.4mm', '0.4mm'),
    centerX: baseX + t / 2,
    centerY: baseY + H / 2,
    centerZ: baseZ + D / 2,
    sizeX: t,
    sizeY: H,
    sizeZ: D,
    explodeVec: [-1, 0, 0],
  });

  // 2. Right Side Panel (O'ng yon devor - Stoyka)
  pushBoard({
    id: `${mod.id}:side_right`,
    moduleId: mod.id,
    moduleName: mod.name,
    name: "Yon devor (O'ng stoyka)",
    role: 'yon_devor',
    material: mod.bodyMaterial,
    color: mod.bodyColor,
    cutLength: H,
    cutWidth: D,
    thickness: t,
    edges: createEdgeConfig('0.4mm', 'none', '0.4mm', '0.4mm'),
    centerX: baseX + W - t / 2,
    centerY: baseY + H / 2,
    centerZ: baseZ + D / 2,
    sizeX: t,
    sizeY: H,
    sizeZ: D,
    explodeVec: [1, 0, 0],
  });

  // 3. Bottom Horizon (Ostki gorizont / Taglik)
  if (effectiveBottomType === 'full') {
    pushBoard({
      id: `${mod.id}:bottom_panel`,
      moduleId: mod.id,
      moduleName: mod.name,
      name: 'Ostki qism (Gorizont)',
      role: 'ostki_ustki',
      material: mod.bodyMaterial,
      color: mod.bodyColor,
      cutLength: innerW,
      cutWidth: D,
      thickness: t,
      edges: createEdgeConfig('0.4mm', 'none', 'none', 'none'),
      centerX: baseX + W / 2,
      centerY: baseY + t / 2,
      centerZ: baseZ + D / 2,
      sizeX: innerW,
      sizeY: t,
      sizeZ: D,
      explodeVec: [0, -0.8, 0],
    });
  }

  // 4. Top Panel, Tsarga, or Desk Modesty Panel
  if (mod.kind === 'yozuv_stoli' && effectiveTopType === 'none') {
    const tsargaH = Math.min(350, Math.round(H * 0.45));
    pushBoard({
      id: `${mod.id}:desk_tsarga`,
      moduleId: mod.id,
      moduleName: mod.name,
      name: 'Orqa mustahkamlovchi tsarga',
      role: 'tsarga',
      material: mod.bodyMaterial,
      color: mod.bodyColor,
      cutLength: innerW,
      cutWidth: tsargaH,
      thickness: t,
      edges: createEdgeConfig('0.4mm', '0.4mm', 'none', 'none'),
      centerX: baseX + W / 2,
      centerY: baseY + H - tsargaH / 2 - 40,
      centerZ: baseZ + D * 0.25,
      sizeX: innerW,
      sizeY: tsargaH,
      sizeZ: t,
      explodeVec: [0, 0, -0.8],
    });
  } else if (effectiveTopType === 'tsarga') {
    const railW = 100;
    pushBoard({
      id: `${mod.id}:top_tsarga_front`,
      moduleId: mod.id,
      moduleName: mod.name,
      name: 'Old ustki tsarga (Planka)',
      role: 'tsarga',
      material: mod.bodyMaterial,
      color: mod.bodyColor,
      cutLength: innerW,
      cutWidth: railW,
      thickness: t,
      edges: createEdgeConfig('0.4mm', '0.4mm', 'none', 'none'),
      centerX: baseX + W / 2,
      centerY: baseY + H - t / 2,
      centerZ: baseZ + D - railW / 2,
      sizeX: innerW,
      sizeY: t,
      sizeZ: railW,
      explodeVec: [0, 0.7, 0.4],
    });

    pushBoard({
      id: `${mod.id}:top_tsarga_back`,
      moduleId: mod.id,
      moduleName: mod.name,
      name: 'Orqa ustki tsarga (Planka)',
      role: 'tsarga',
      material: mod.bodyMaterial,
      color: mod.bodyColor,
      cutLength: innerW,
      cutWidth: railW,
      thickness: t,
      edges: createEdgeConfig('0.4mm', '0.4mm', 'none', 'none'),
      centerX: baseX + W / 2,
      centerY: baseY + H - t / 2,
      centerZ: baseZ + railW / 2,
      sizeX: innerW,
      sizeY: t,
      sizeZ: railW,
      explodeVec: [0, 0.7, -0.4],
    });
  } else if (effectiveTopType === 'full') {
    pushBoard({
      id: `${mod.id}:top_panel`,
      moduleId: mod.id,
      moduleName: mod.name,
      name: 'Ustki qism (Gorizont)',
      role: 'ostki_ustki',
      material: mod.bodyMaterial,
      color: mod.bodyColor,
      cutLength: innerW,
      cutWidth: D,
      thickness: t,
      edges: createEdgeConfig('0.4mm', 'none', 'none', 'none'),
      centerX: baseX + W / 2,
      centerY: baseY + H - t / 2,
      centerZ: baseZ + D / 2,
      sizeX: innerW,
      sizeY: t,
      sizeZ: D,
      explodeVec: [0, 0.8, 0],
    });
  }

  // 4b. Built-in Oven Cabinet (`pastki_duxovka`) special structure
  const facadeThick = MATERIAL_SPECS[mod.facadeMaterial]?.thickness || t;
  if (mod.kind === 'pastki_duxovka') {
    const bottomDrawerH = Math.max(100, H - 600);
    pushBoard({
      id: `${mod.id}:oven_shelf`,
      moduleId: mod.id,
      moduleName: mod.name,
      name: 'Duxovka tayanch gorizonti',
      role: 'ostki_ustki',
      material: mod.bodyMaterial,
      color: mod.bodyColor,
      cutLength: innerW,
      cutWidth: D - 10,
      thickness: t,
      edges: createEdgeConfig('0.4mm', 'none', 'none', 'none'),
      centerX: baseX + W / 2,
      centerY: baseY + bottomDrawerH + t / 2,
      centerZ: baseZ + (D - 10) / 2 + 5,
      sizeX: innerW,
      sizeY: t,
      sizeZ: D - 10,
      explodeVec: [0, 0, 0.4],
    });

    pushBoard({
      id: `${mod.id}:oven_drawer_front`,
      moduleId: mod.id,
      moduleName: mod.name,
      name: 'Duxovka osti tortma fasadi',
      role: 'tortma_fasad',
      material: mod.facadeMaterial,
      color: mod.facadeColor,
      cutLength: Math.max(60, W - 4),
      cutWidth: Math.max(60, bottomDrawerH - 4),
      thickness: facadeThick,
      edges: createEdgeConfig('2mm', '2mm', '2mm', '2mm'),
      centerX: baseX + W / 2,
      centerY: baseY + bottomDrawerH / 2,
      centerZ: baseZ + D + facadeThick / 2 + 1,
      sizeX: Math.max(60, W - 4),
      sizeY: Math.max(60, bottomDrawerH - 4),
      sizeZ: facadeThick,
      isDrawer: true,
      facadeStyle,
      handleStyle,
      handleOrientation: 'horizontal',
      explodeVec: [0, -0.2, 1.4],
    });
  }

  // Compute Zone Split when BOTH Drawers and Doors (or Shelves) exist in the same module
  const hasDrawers = mod.drawerCount > 0 && mod.kind !== 'pastki_duxovka';
  const hasDoors = mod.doorCount > 0 && mod.kind !== 'pastki_duxovka';
  const isCombinedZone = hasDrawers && (hasDoors || mod.shelfCount > 0);
  const drawerPosition = mod.drawerPosition ?? 'bottom';

  let drawerZoneStartY = 0; // local Y from 0..H
  let drawerZoneH = hasDrawers ? H : 0;
  let upperZoneStartY = 0;
  let upperZoneH = H;

  if (isCombinedZone) {
    const defaultDZ = Math.min(Math.round(H * 0.48), Math.max(150, mod.drawerCount * 165));
    drawerZoneH = Math.max(120, Math.min(H - 180, mod.drawerZoneHeight ?? defaultDZ));
    upperZoneH = H - drawerZoneH;
    if (drawerPosition === 'top') {
      drawerZoneStartY = upperZoneH;
      upperZoneStartY = 0;
    } else {
      drawerZoneStartY = 0;
      upperZoneStartY = drawerZoneH;
    }

    // Emit horizontal zone separator shelf between drawer zone & door/shelf zone
    const sepY = drawerPosition === 'top' ? upperZoneH : drawerZoneH;
    pushBoard({
      id: `${mod.id}:zone_divider`,
      moduleId: mod.id,
      moduleName: mod.name,
      name: 'Bo\'limlararo gorizont (Tortma/Eshik)',
      role: 'ostki_ustki',
      material: mod.bodyMaterial,
      color: mod.bodyColor,
      cutLength: innerW,
      cutWidth: D - 10,
      thickness: t,
      edges: createEdgeConfig('0.4mm', 'none', 'none', 'none'),
      centerX: baseX + W / 2,
      centerY: baseY + sepY,
      centerZ: baseZ + (D - 10) / 2 + 5,
      sizeX: innerW,
      sizeY: t,
      sizeZ: D - 10,
      explodeVec: [0, 0, 0.45],
    });
  }

  // 4c. Vertical Dividers (`dividerCount` 0 | 1 | 2 or legacy `centerDivider`)
  const rawDivCount =
    mod.dividerCount !== undefined ? mod.dividerCount : mod.centerDivider ? 1 : 0;
  const divCount =
    mod.kind !== 'yozuv_stoli' && mod.kind !== 'pastki_duxovka'
      ? Math.max(0, Math.min(2, rawDivCount))
      : 0;

  if (divCount > 0) {
    const botDeduction = effectiveBottomType === 'full' ? t : 0;
    const topDeduction = effectiveTopType !== 'none' ? t : 0;
    const divTotalH = isCombinedZone ? upperZoneH - t : H - botDeduction - topDeduction;
    const divCenterY = isCombinedZone
      ? baseY + upperZoneStartY + upperZoneH / 2
      : baseY + botDeduction + divTotalH / 2;
    const divD = Math.max(80, D - 10);

    if (divTotalH >= 60) {
      if (divCount === 1) {
        pushBoard({
          id: `${mod.id}:center_divider`,
          moduleId: mod.id,
          moduleName: mod.name,
          name: "O'rta vertikal to'siq (Peregorodka)",
          role: 'orta_devor',
          material: mod.bodyMaterial,
          color: mod.bodyColor,
          cutLength: divTotalH,
          cutWidth: divD,
          thickness: t,
          edges: createEdgeConfig('0.4mm', 'none', 'none', 'none'),
          centerX: baseX + W / 2,
          centerY: divCenterY,
          centerZ: baseZ + 6 + divD / 2,
          sizeX: t,
          sizeY: divTotalH,
          sizeZ: divD,
          explodeVec: [0, 0, 0.35],
        });
      } else {
        for (let dIdx = 1; dIdx <= divCount; dIdx++) {
          const xPos = baseX + (W / (divCount + 1)) * dIdx;
          pushBoard({
            id: `${mod.id}:divider_${dIdx}`,
            moduleId: mod.id,
            moduleName: mod.name,
            name: `Vertikal to'siq #${dIdx} (Peregorodka)`,
            role: 'orta_devor',
            material: mod.bodyMaterial,
            color: mod.bodyColor,
            cutLength: divTotalH,
            cutWidth: divD,
            thickness: t,
            edges: createEdgeConfig('0.4mm', 'none', 'none', 'none'),
            centerX: xPos,
            centerY: divCenterY,
            centerZ: baseZ + 6 + divD / 2,
            sizeX: t,
            sizeY: divTotalH,
            sizeZ: divD,
            explodeVec: [0, 0, 0.35],
          });
        }
      }
    }
  }

  // 4d. Front Base Plinth / Toe-Kick (`hasToeKick` — Old tsokol plankasi)
  if (mod.legHeight > 0 && mod.hasToeKick) {
    pushBoard({
      id: `${mod.id}:toe_kick`,
      moduleId: mod.id,
      moduleName: mod.name,
      name: 'Old tsokol plankasi',
      role: 'tsarga',
      material: mod.bodyMaterial,
      color: mod.bodyColor,
      cutLength: W,
      cutWidth: mod.legHeight,
      thickness: t,
      edges: createEdgeConfig('0.4mm', '0.4mm', 'none', 'none'),
      centerX: baseX + W / 2,
      centerY: mod.y + mod.legHeight / 2,
      centerZ: baseZ + D - 35,
      sizeX: W,
      sizeY: mod.legHeight,
      sizeZ: t,
      explodeVec: [0, -0.5, 1.0],
    });
  }

  // 5. Internal Shelves (Ichki tokchalar — supports 1..3 compartments & combined drawer+shelf zone)
  const canHaveShelves =
    mod.shelfCount > 0 && mod.kind !== 'pastki_duxovka' && (!hasDrawers || isCombinedZone);
  if (canHaveShelves) {
    const shelfD = Math.max(80, D - 20);
    const botDed = isCombinedZone ? t : effectiveBottomType === 'full' ? t : 0;
    const topDed = isCombinedZone ? t : effectiveTopType !== 'none' ? t : 0;
    const usableH = Math.max(60, upperZoneH - botDed - topDed);
    const compCount = divCount + 1;

    if (compCount === 1) {
      const shelfW = Math.max(50, innerW - 2);
      for (let i = 1; i <= mod.shelfCount; i++) {
        const yOffset = upperZoneStartY + botDed + (usableH / (mod.shelfCount + 1)) * i;
        pushBoard({
          id: `${mod.id}:shelf_${i}`,
          moduleId: mod.id,
          moduleName: mod.name,
          name: `Ichki tokcha #${i}`,
          role: 'tokcha',
          material: mod.bodyMaterial,
          color: mod.bodyColor,
          cutLength: shelfW,
          cutWidth: shelfD,
          thickness: t,
          edges: createEdgeConfig('0.4mm', 'none', 'none', 'none'),
          centerX: baseX + W / 2,
          centerY: baseY + yOffset,
          centerZ: baseZ + 6 + shelfD / 2,
          sizeX: shelfW,
          sizeY: t,
          sizeZ: shelfD,
          explodeVec: [0, 0, 0.5 * i],
        });
      }
    } else if (compCount === 2) {
      const halfShelfW = Math.max(50, Math.floor((innerW - t) / 2) - 2);
      for (let i = 1; i <= mod.shelfCount; i++) {
        const yOffset = upperZoneStartY + botDed + (usableH / (mod.shelfCount + 1)) * i;
        pushBoard({
          id: `${mod.id}:shelf_${i}_L`,
          moduleId: mod.id,
          moduleName: mod.name,
          name: `Ichki tokcha #${i} (Chap)`,
          role: 'tokcha',
          material: mod.bodyMaterial,
          color: mod.bodyColor,
          cutLength: halfShelfW,
          cutWidth: shelfD,
          thickness: t,
          edges: createEdgeConfig('0.4mm', 'none', 'none', 'none'),
          centerX: baseX + t + halfShelfW / 2 + 1,
          centerY: baseY + yOffset,
          centerZ: baseZ + 6 + shelfD / 2,
          sizeX: halfShelfW,
          sizeY: t,
          sizeZ: shelfD,
          explodeVec: [-0.2, 0, 0.5 * i],
        });
        pushBoard({
          id: `${mod.id}:shelf_${i}_R`,
          moduleId: mod.id,
          moduleName: mod.name,
          name: `Ichki tokcha #${i} (O'ng)`,
          role: 'tokcha',
          material: mod.bodyMaterial,
          color: mod.bodyColor,
          cutLength: halfShelfW,
          cutWidth: shelfD,
          thickness: t,
          edges: createEdgeConfig('0.4mm', 'none', 'none', 'none'),
          centerX: baseX + W - t - halfShelfW / 2 - 1,
          centerY: baseY + yOffset,
          centerZ: baseZ + 6 + shelfD / 2,
          sizeX: halfShelfW,
          sizeY: t,
          sizeZ: shelfD,
          explodeVec: [0.2, 0, 0.5 * i],
        });
      }
    } else {
      // 3 compartments
      const partShelfW = Math.max(50, Math.floor((innerW - 2 * t) / 3) - 2);
      for (let i = 1; i <= mod.shelfCount; i++) {
        const yOffset = upperZoneStartY + botDed + (usableH / (mod.shelfCount + 1)) * i;
        for (let c = 0; c < 3; c++) {
          const compLeft = baseX + t + c * ((innerW - 2 * t) / 3 + t);
          const compLabel = c === 0 ? 'Chap' : c === 1 ? "O'rta" : "O'ng";
          pushBoard({
            id: `${mod.id}:shelf_${i}_C${c + 1}`,
            moduleId: mod.id,
            moduleName: mod.name,
            name: `Ichki tokcha #${i} (${compLabel})`,
            role: 'tokcha',
            material: mod.bodyMaterial,
            color: mod.bodyColor,
            cutLength: partShelfW,
            cutWidth: shelfD,
            thickness: t,
            edges: createEdgeConfig('0.4mm', 'none', 'none', 'none'),
            centerX: compLeft + partShelfW / 2 + 1,
            centerY: baseY + yOffset,
            centerZ: baseZ + 6 + shelfD / 2,
            sizeX: partShelfW,
            sizeY: t,
            sizeZ: shelfD,
            explodeVec: [(c - 1) * 0.25, 0, 0.5 * i],
          });
        }
      }
    }
  }

  // 6. Countertop (Stoleshnitsa 38mm)
  if (mod.hasCountertop) {
    const ctThick = mod.countertopThickness || 38;
    const ctDepth = D + (mod.countertopOverhangFront || 40);
    pushBoard({
      id: `${mod.id}:countertop`,
      moduleId: mod.id,
      moduleName: mod.name,
      name: 'Stol usti (Stoleshnitsa)',
      role: 'stoleshnitsa',
      material: 'stoleshnitsa_38',
      color: mod.countertopColor || '#C6C2B9',
      cutLength: W,
      cutWidth: ctDepth,
      thickness: ctThick,
      edges: createEdgeConfig('2mm', 'none', '2mm', '2mm'),
      centerX: baseX + W / 2,
      centerY: baseY + H + ctThick / 2,
      centerZ: baseZ + ctDepth / 2,
      sizeX: W,
      sizeY: ctThick,
      sizeZ: ctDepth,
      explodeVec: [0, 1.3, 0],
    });
  }

  // 7. Doors (Fasad eshiklar — 1, 2, or 3 doors; supports overlay, inset, and vitrine; works alongside drawers)
  if (hasDoors) {
    const isInset = facadeStyle === 'inset';
    const doorAvailW = isInset ? innerW : W;
    const doorAvailH = isInset
      ? Math.max(60, upperZoneH - (isCombinedZone ? t : 2 * t))
      : upperZoneH;
    const doorH = Math.max(60, doorAvailH - 4);
    const doorCenterY = baseY + upperZoneStartY + upperZoneH / 2;
    const doorCenterZ = isInset
      ? baseZ + D - facadeThick / 2 - 2
      : baseZ + D + facadeThick / 2 + 1;

    if (mod.doorCount === 1) {
      const doorW = Math.max(60, doorAvailW - 4);
      const hingeSide =
        mod.doorHinge || (mod.handleOrientation === 'horizontal' ? 'top' : 'left');
      pushBoard({
        id: `${mod.id}:door_1`,
        moduleId: mod.id,
        moduleName: mod.name,
        name: 'Fasad eshik',
        role: 'fasad_eshik',
        material: mod.facadeMaterial,
        color: mod.facadeColor,
        cutLength: doorH,
        cutWidth: doorW,
        thickness: facadeThick,
        edges: createEdgeConfig('2mm', '2mm', '2mm', '2mm'),
        centerX: baseX + W / 2,
        centerY: doorCenterY,
        centerZ: doorCenterZ,
        sizeX: doorW,
        sizeY: doorH,
        sizeZ: facadeThick,
        isDoor: true,
        doorHingeSide: hingeSide,
        facadeStyle,
        handleStyle,
        handleOrientation: mod.handleOrientation,
        explodeVec: [0, 0, 1.4],
      });
    } else if (mod.doorCount === 2) {
      const singleDoorW = Math.max(60, Math.floor(doorAvailW / 2) - 4);
      const leftCenterX = isInset ? baseX + t + innerW / 4 : baseX + W / 4;
      const rightCenterX = isInset ? baseX + W - t - innerW / 4 : baseX + (W * 3) / 4;

      pushBoard({
        id: `${mod.id}:door_left`,
        moduleId: mod.id,
        moduleName: mod.name,
        name: 'Fasad eshik (Chap)',
        role: 'fasad_eshik',
        material: mod.facadeMaterial,
        color: mod.facadeColor,
        cutLength: doorH,
        cutWidth: singleDoorW,
        thickness: facadeThick,
        edges: createEdgeConfig('2mm', '2mm', '2mm', '2mm'),
        centerX: leftCenterX,
        centerY: doorCenterY,
        centerZ: doorCenterZ,
        sizeX: singleDoorW,
        sizeY: doorH,
        sizeZ: facadeThick,
        isDoor: true,
        doorHingeSide: 'left',
        facadeStyle,
        handleStyle,
        handleOrientation: mod.handleOrientation,
        explodeVec: [-0.4, 0, 1.4],
      });

      pushBoard({
        id: `${mod.id}:door_right`,
        moduleId: mod.id,
        moduleName: mod.name,
        name: "Fasad eshik (O'ng)",
        role: 'fasad_eshik',
        material: mod.facadeMaterial,
        color: mod.facadeColor,
        cutLength: doorH,
        cutWidth: singleDoorW,
        thickness: facadeThick,
        edges: createEdgeConfig('2mm', '2mm', '2mm', '2mm'),
        centerX: rightCenterX,
        centerY: doorCenterY,
        centerZ: doorCenterZ,
        sizeX: singleDoorW,
        sizeY: doorH,
        sizeZ: facadeThick,
        isDoor: true,
        doorHingeSide: 'right',
        facadeStyle,
        handleStyle,
        handleOrientation: mod.handleOrientation,
        explodeVec: [0.4, 0, 1.4],
      });
    } else if (mod.doorCount === 3) {
      const singleDoorW = Math.max(60, Math.floor(doorAvailW / 3) - 4);
      const startX = isInset ? baseX + t : baseX;
      const positions = [
        { id: 'door_left', label: 'Chap', cx: startX + doorAvailW / 6, hinge: 'left' as const, ex: -0.5 },
        { id: 'door_mid', label: "O'rta", cx: startX + doorAvailW / 2, hinge: 'left' as const, ex: 0 },
        { id: 'door_right', label: "O'ng", cx: startX + (doorAvailW * 5) / 6, hinge: 'right' as const, ex: 0.5 },
      ];
      for (const pos of positions) {
        pushBoard({
          id: `${mod.id}:${pos.id}`,
          moduleId: mod.id,
          moduleName: mod.name,
          name: `Fasad eshik (${pos.label})`,
          role: 'fasad_eshik',
          material: mod.facadeMaterial,
          color: mod.facadeColor,
          cutLength: doorH,
          cutWidth: singleDoorW,
          thickness: facadeThick,
          edges: createEdgeConfig('2mm', '2mm', '2mm', '2mm'),
          centerX: pos.cx,
          centerY: doorCenterY,
          centerZ: doorCenterZ,
          sizeX: singleDoorW,
          sizeY: doorH,
          sizeZ: facadeThick,
          isDoor: true,
          doorHingeSide: pos.hinge,
          facadeStyle,
          handleStyle,
          handleOrientation: mod.handleOrientation,
          explodeVec: [pos.ex, 0, 1.4],
        });
      }
    }
  }

  // 8. Drawers (Tortma fasadlari va tortma qutilari)
  if (hasDrawers) {
    const count = mod.drawerCount;
    const gap = 4;
    const isInset = facadeStyle === 'inset';
    const zoneAvailW = isInset ? innerW : W;
    const singleFrontH = Math.max(60, Math.floor((drawerZoneH - gap * count) / count));
    const frontW = Math.max(60, zoneAvailW - 4);
    const boxDepth = Math.max(250, Math.floor((D - 50) / 50) * 50);
    const boxSideH = Math.max(60, singleFrontH - 55);
    const boxInnerW = Math.max(80, innerW - 26 - 2 * t);
    const frontZ = isInset
      ? baseZ + D - facadeThick / 2 - 2
      : baseZ + D + facadeThick / 2 + 1;

    for (let i = 0; i < count; i++) {
      const slotCenterY = baseY + drawerZoneStartY + (drawerZoneH / count) * (i + 0.5);
      const num = count - i;

      pushBoard({
        id: `${mod.id}:drawer_front_${num}`,
        moduleId: mod.id,
        moduleName: mod.name,
        name: `Tortma fasadi #${num}`,
        role: 'tortma_fasad',
        material: mod.facadeMaterial,
        color: mod.facadeColor,
        cutLength: frontW,
        cutWidth: singleFrontH,
        thickness: facadeThick,
        edges: createEdgeConfig('2mm', '2mm', '2mm', '2mm'),
        centerX: baseX + W / 2,
        centerY: slotCenterY,
        centerZ: frontZ,
        sizeX: frontW,
        sizeY: singleFrontH,
        sizeZ: facadeThick,
        isDrawer: true,
        facadeStyle,
        handleStyle,
        handleOrientation: 'horizontal',
        explodeVec: [0, 0, 1.5],
      });

      pushBoard({
        id: `${mod.id}:drawer_side_l_${num}`,
        moduleId: mod.id,
        moduleName: mod.name,
        name: `Tortma yoni #${num} (Chap)`,
        role: 'tortma_korpus',
        material: mod.bodyMaterial,
        color: mod.bodyColor,
        cutLength: boxDepth,
        cutWidth: boxSideH,
        thickness: t,
        edges: createEdgeConfig('0.4mm', 'none', 'none', 'none'),
        centerX: baseX + t + 13 + t / 2,
        centerY: slotCenterY - 8,
        centerZ: baseZ + D - boxDepth / 2 - 5,
        sizeX: t,
        sizeY: boxSideH,
        sizeZ: boxDepth,
        isDrawer: true,
        explodeVec: [0, 0, 1.1],
      });

      pushBoard({
        id: `${mod.id}:drawer_side_r_${num}`,
        moduleId: mod.id,
        moduleName: mod.name,
        name: `Tortma yoni #${num} (O'ng)`,
        role: 'tortma_korpus',
        material: mod.bodyMaterial,
        color: mod.bodyColor,
        cutLength: boxDepth,
        cutWidth: boxSideH,
        thickness: t,
        edges: createEdgeConfig('0.4mm', 'none', 'none', 'none'),
        centerX: baseX + W - t - 13 - t / 2,
        centerY: slotCenterY - 8,
        centerZ: baseZ + D - boxDepth / 2 - 5,
        sizeX: t,
        sizeY: boxSideH,
        sizeZ: boxDepth,
        isDrawer: true,
        explodeVec: [0, 0, 1.1],
      });

      pushBoard({
        id: `${mod.id}:drawer_back_${num}`,
        moduleId: mod.id,
        moduleName: mod.name,
        name: `Tortma orqa/old quti #${num}`,
        role: 'tortma_korpus',
        material: mod.bodyMaterial,
        color: mod.bodyColor,
        cutLength: boxInnerW,
        cutWidth: boxSideH,
        thickness: t,
        edges: createEdgeConfig('0.4mm', 'none', 'none', 'none'),
        centerX: baseX + W / 2,
        centerY: slotCenterY - 8,
        centerZ: baseZ + D - boxDepth - 5 + t / 2,
        sizeX: boxInnerW,
        sizeY: boxSideH,
        sizeZ: t,
        isDrawer: true,
        explodeVec: [0, 0, 1.1],
      });

      pushBoard({
        id: `${mod.id}:drawer_bottom_${num}`,
        moduleId: mod.id,
        moduleName: mod.name,
        name: `Tortma tagligi XDF #${num}`,
        role: 'orqa_devor',
        material: 'xdf_4',
        color: '#DEDAD2',
        cutLength: boxInnerW + 2 * t - 2,
        cutWidth: boxDepth - 2,
        thickness: 4,
        edges: createEdgeConfig('none', 'none', 'none', 'none'),
        centerX: baseX + W / 2,
        centerY: slotCenterY - 8 - boxSideH / 2 - 2,
        centerZ: baseZ + D - boxDepth / 2 - 5,
        sizeX: boxInnerW + 2 * t - 2,
        sizeY: 4,
        sizeZ: boxDepth - 2,
        isDrawer: true,
        explodeVec: [0, 0, 1.1],
      });
    }
  }

  // 9. Back Panel (`overlay_xdf` | `inset_xdf` | `ldsp`)
  if (mod.hasBackPanel) {
    if (effectiveBackType === 'ldsp') {
      const backH = Math.max(60, H - (effectiveBottomType === 'full' ? t : 0) - (effectiveTopType === 'full' ? t : 0));
      const backW = innerW;
      pushBoard({
        id: `${mod.id}:back_xdf`,
        moduleId: mod.id,
        moduleName: mod.name,
        name: 'Orqa devor (LDSP)',
        role: 'orqa_devor',
        material: mod.bodyMaterial,
        color: mod.bodyColor,
        cutLength: backH,
        cutWidth: backW,
        thickness: t,
        edges: createEdgeConfig('none', 'none', 'none', 'none'),
        centerX: baseX + W / 2,
        centerY: baseY + (effectiveBottomType === 'full' ? t : 0) + backH / 2,
        centerZ: baseZ + t / 2,
        sizeX: backW,
        sizeY: backH,
        sizeZ: t,
        explodeVec: [0, 0, -1.1],
      });
    } else if (effectiveBackType === 'inset_xdf') {
      const backH = Math.max(60, H - 2 * t + 10);
      const backW = Math.max(60, innerW + 10);
      pushBoard({
        id: `${mod.id}:back_xdf`,
        moduleId: mod.id,
        moduleName: mod.name,
        name: 'Orqa devor (Pazli XDF 4mm)',
        role: 'orqa_devor',
        material: 'xdf_4',
        color: '#D8D4CC',
        cutLength: backH,
        cutWidth: backW,
        thickness: 4,
        edges: createEdgeConfig('none', 'none', 'none', 'none'),
        centerX: baseX + W / 2,
        centerY: baseY + H / 2,
        centerZ: baseZ + 16,
        sizeX: backW,
        sizeY: backH,
        sizeZ: 4,
        explodeVec: [0, 0, -1.1],
      });
    } else {
      const backH = Math.max(60, H - 4);
      const backW = Math.max(60, W - 4);
      pushBoard({
        id: `${mod.id}:back_xdf`,
        moduleId: mod.id,
        moduleName: mod.name,
        name: 'Orqa devor (XDF 4mm)',
        role: 'orqa_devor',
        material: 'xdf_4',
        color: '#D8D4CC',
        cutLength: backH,
        cutWidth: backW,
        thickness: 4,
        edges: createEdgeConfig('none', 'none', 'none', 'none'),
        centerX: baseX + W / 2,
        centerY: baseY + H / 2,
        centerZ: baseZ + 2,
        sizeX: backW,
        sizeY: backH,
        sizeZ: 4,
        explodeVec: [0, 0, -1.1],
      });
    }
  }

  return boards;
}

/**
 * Converts a full FurnitureProject (modules + customParts + overrides) into all 3D boards.
 */
export function decomposeProjectTo3DBoards(project: FurnitureProject): Generated3DBoard[] {
  const allBoards: Generated3DBoard[] = [];

  for (const mod of project.modules) {
    const modBoards = decomposeModuleToBoards(mod, project.partOverrides);
    allBoards.push(...modBoards);
  }

  for (const cp of project.customParts) {
    let sizeX = cp.cutLength;
    let sizeY = cp.thickness;
    let sizeZ = cp.cutWidth;

    if (cp.orientation === 'vertical_side') {
      sizeX = cp.thickness;
      sizeY = cp.cutLength;
      sizeZ = cp.cutWidth;
    } else if (cp.orientation === 'frontal') {
      sizeX = cp.cutWidth;
      sizeY = cp.cutLength;
      sizeZ = cp.thickness;
    }

    for (let q = 0; q < cp.quantity; q++) {
      const offset = q * (cp.thickness + 24);
      allBoards.push({
        id: q === 0 ? `custom:${cp.id}` : `custom:${cp.id}_${q}`,
        moduleId: `custom:${cp.id}`,
        moduleName: 'Maxsus detallar (0 dan)',
        name: cp.name,
        role: cp.role,
        material: cp.material,
        color: cp.color,
        cutLength: cp.cutLength,
        cutWidth: cp.cutWidth,
        thickness: cp.thickness,
        edges: { ...cp.edges },
        centerX: cp.x + sizeX / 2 + (cp.orientation === 'vertical_side' ? offset : 0),
        centerY: cp.y + sizeY / 2 + (cp.orientation === 'horizontal' ? offset : 0),
        centerZ: cp.z + sizeZ / 2 + (cp.orientation === 'frontal' ? offset : 0),
        sizeX,
        sizeY,
        sizeZ,
        explodeVec: [0, 0.5, 0.5],
      });
    }
  }

  return allBoards;
}

/**
 * Returns any module boards that were hidden by the user via `partOverrides[id].hidden`.
 */
export function getHiddenModuleBoards(project: FurnitureProject): Generated3DBoard[] {
  const hidden: Generated3DBoard[] = [];
  for (const mod of project.modules) {
    const all = decomposeModuleToBoards(mod, project.partOverrides, true);
    for (const b of all) {
      if (project.partOverrides[b.id]?.hidden) {
        hidden.push(b);
      }
    }
  }
  return hidden;
}

/**
 * Aggregates all 3D boards into a workshop-ready Raskroy Cut-List Table (`CutListRow[]`).
 */
export function generateCutList(project: FurnitureProject): CutListRow[] {
  const boards = decomposeProjectTo3DBoards(project);
  const grouped = new Map<string, CutListRow>();

  for (const b of boards) {
    const edgeKey = `${b.edges.l1}-${b.edges.l2}-${b.edges.w1}-${b.edges.w2}`;
    const groupKey = `${b.moduleId}|${b.role}|${b.material}|${b.cutLength}x${b.cutWidth}x${b.thickness}|${edgeKey}`;

    const existing = grouped.get(groupKey);
    if (existing) {
      existing.quantity += 1;
      existing.boardIds.push(b.id);
    } else {
      grouped.set(groupKey, {
        id: b.id,
        index: 0,
        moduleId: b.moduleId,
        moduleName: b.moduleName,
        partName: b.name.replace(/\s*\((Chap|O'ng)\)$/i, ''),
        role: b.role,
        material: b.material,
        thickness: b.thickness,
        cutLength: Math.round(b.cutLength),
        cutWidth: Math.round(b.cutWidth),
        quantity: 1,
        edges: { ...b.edges },
        areaM2: 0,
        edge04Meters: 0,
        edge20Meters: 0,
        boardIds: [b.id],
      });
    }
  }

  const rows: CutListRow[] = [];
  let idx = 1;
  for (const row of grouped.values()) {
    row.index = idx++;
    const singleArea = (row.cutLength * row.cutWidth) / 1_000_000;
    row.areaM2 = Number((singleArea * row.quantity).toFixed(3));
    const edgesCalc = calcPartEdgeMeters(row.cutLength, row.cutWidth, row.edges, row.quantity);
    row.edge04Meters = edgesCalc.edge04;
    row.edge20Meters = edgesCalc.edge20;
    rows.push(row);
  }

  return rows;
}

/**
 * 2D Sheet Nesting (Guillotine / Shelf First-Fit Decreasing) for Raskroy Workshop.
 */
export function nestPartsIntoSheets(
  cutList: CutListRow[],
  sawKerf: number = 4,
  sheetTrim: number = 10,
): RaskroySheet[] {
  const sheets: RaskroySheet[] = [];
  const byMaterial = new Map<MaterialId, CutListRow[]>();

  for (const row of cutList) {
    const spec = MATERIAL_SPECS[row.material];
    if (!spec || !spec.isSheet) continue;
    const list = byMaterial.get(row.material) || [];
    list.push(row);
    byMaterial.set(row.material, list);
  }

  let globalSheetNum = 1;

  for (const [matId, rows] of byMaterial.entries()) {
    const spec = MATERIAL_SPECS[matId];
    const usableL = spec.sheetLength - 2 * sheetTrim;
    const usableW = spec.sheetWidth - 2 * sheetTrim;

    interface ItemToPlace {
      rowId: string;
      partIndex: number;
      partName: string;
      moduleName: string;
      role: PartRole;
      length: number;
      width: number;
    }

    const items: ItemToPlace[] = [];
    for (const r of rows) {
      for (let q = 0; q < r.quantity; q++) {
        // Fit into usableL x usableW, preferring orientation that keeps part within bounds
        let len = r.cutLength;
        let wid = r.cutWidth;
        if ((len > usableL || wid > usableW) && wid <= usableL && len <= usableW) {
          len = r.cutWidth;
          wid = r.cutLength;
        }
        items.push({
          rowId: r.id,
          partIndex: r.index,
          partName: r.partName,
          moduleName: r.moduleName,
          role: r.role,
          length: Math.min(len, usableL),
          width: Math.min(wid, usableW),
        });
      }
    }

    items.sort((a, b) => b.width - a.width || b.length - a.length);

    interface ShelfStrip {
      y: number;
      height: number;
      usedX: number;
    }

    interface OpenSheet {
      shelves: ShelfStrip[];
      usedY: number;
      parts: PlacedSheetPart[];
    }

    const openSheets: OpenSheet[] = [];

    for (const item of items) {
      let placed = false;

      for (const sheet of openSheets) {
        for (const shelf of sheet.shelves) {
          if (item.width <= shelf.height && shelf.usedX + item.length <= usableL) {
            sheet.parts.push({
              rowId: item.rowId,
              partIndex: item.partIndex,
              partName: item.partName,
              moduleName: item.moduleName,
              role: item.role,
              x: sheetTrim + shelf.usedX,
              y: sheetTrim + shelf.y,
              length: item.length,
              width: item.width,
              rotated: false,
            });
            shelf.usedX += item.length + sawKerf;
            placed = true;
            break;
          }
          if (item.length <= shelf.height && shelf.usedX + item.width <= usableL) {
            sheet.parts.push({
              rowId: item.rowId,
              partIndex: item.partIndex,
              partName: item.partName,
              moduleName: item.moduleName,
              role: item.role,
              x: sheetTrim + shelf.usedX,
              y: sheetTrim + shelf.y,
              length: item.width,
              width: item.length,
              rotated: true,
            });
            shelf.usedX += item.width + sawKerf;
            placed = true;
            break;
          }
        }

        if (placed) break;

        if (sheet.usedY + item.width <= usableW && item.length <= usableL) {
          const newShelf: ShelfStrip = {
            y: sheet.usedY,
            height: item.width,
            usedX: item.length + sawKerf,
          };
          sheet.shelves.push(newShelf);
          sheet.usedY += item.width + sawKerf;
          sheet.parts.push({
            rowId: item.rowId,
            partIndex: item.partIndex,
            partName: item.partName,
            moduleName: item.moduleName,
            role: item.role,
            x: sheetTrim,
            y: sheetTrim + newShelf.y,
            length: item.length,
            width: item.width,
            rotated: false,
          });
          placed = true;
          break;
        } else if (sheet.usedY + item.length <= usableW && item.width <= usableL) {
          const newShelf: ShelfStrip = {
            y: sheet.usedY,
            height: item.length,
            usedX: item.width + sawKerf,
          };
          sheet.shelves.push(newShelf);
          sheet.usedY += item.length + sawKerf;
          sheet.parts.push({
            rowId: item.rowId,
            partIndex: item.partIndex,
            partName: item.partName,
            moduleName: item.moduleName,
            role: item.role,
            x: sheetTrim,
            y: sheetTrim + newShelf.y,
            length: item.width,
            width: item.length,
            rotated: true,
          });
          placed = true;
          break;
        }
      }

      if (!placed) {
        const useRotated = item.width > usableW && item.length <= usableW && item.width <= usableL;
        const pLen = useRotated ? item.width : item.length;
        const pWid = useRotated ? item.length : item.width;
        const firstShelf: ShelfStrip = {
          y: 0,
          height: pWid,
          usedX: pLen + sawKerf,
        };
        const newSheet: OpenSheet = {
          shelves: [firstShelf],
          usedY: pWid + sawKerf,
          parts: [
            {
              rowId: item.rowId,
              partIndex: item.partIndex,
              partName: item.partName,
              moduleName: item.moduleName,
              role: item.role,
              x: sheetTrim,
              y: sheetTrim,
              length: pLen,
              width: pWid,
              rotated: useRotated,
            },
          ],
        };
        openSheets.push(newSheet);
      }
    }

    for (const os of openSheets) {
      const totalAreaM2 = Number(((spec.sheetLength * spec.sheetWidth) / 1_000_000).toFixed(2));
      const usedAreaM2 = Number(
        (
          os.parts.reduce((acc, p) => acc + (p.length * p.width) / 1_000_000, 0)
        ).toFixed(2),
      );
      const efficiencyPercent = Math.min(100, Math.round((usedAreaM2 / totalAreaM2) * 100));
      sheets.push({
        sheetNumber: globalSheetNum++,
        material: matId,
        materialName: spec.name,
        sheetLength: spec.sheetLength,
        sheetWidth: spec.sheetWidth,
        usedAreaM2,
        totalAreaM2,
        efficiencyPercent,
        parts: os.parts,
      });
    }
  }

  return sheets;
}

/**
 * Calculates full BOM (Materials, Kromka, Countertop, Hardware, Workshop Services, Per-Module Cost, and Turnkey UZS Cost).
 */
export function calculateBOMSummary(
  project: FurnitureProject,
  cutList: CutListRow[],
  sheets: RaskroySheet[],
): BOMSummary {
  const prices: MaterialPriceConfig = {
    ...DEFAULT_PRICES,
    ...(project.prices || {}),
  };

  const totalPartsCount = cutList.reduce((acc, r) => acc + r.quantity, 0);
  const totalBoardsM2 = Number(cutList.reduce((acc, r) => acc + r.areaM2, 0).toFixed(2));
  const totalEdge04Meters = Number(cutList.reduce((acc, r) => acc + r.edge04Meters, 0).toFixed(1));
  const totalEdge20Meters = Number(cutList.reduce((acc, r) => acc + r.edge20Meters, 0).toFixed(1));

  // Countertop linear meters
  const countertopLinearMeters = Number(
    (
      cutList
        .filter((r) => r.material === 'stoleshnitsa_38' || r.role === 'stoleshnitsa')
        .reduce((acc, r) => acc + r.cutLength * r.quantity, 0) / 1000
    ).toFixed(2),
  );

  // Group sheets by material
  const sheetCounts = new Map<MaterialId, { count: number; usedArea: number }>();
  for (const s of sheets) {
    const prev = sheetCounts.get(s.material) || { count: 0, usedArea: 0 };
    prev.count += 1;
    prev.usedArea += s.usedAreaM2;
    sheetCounts.set(s.material, prev);
  }

  const sheetsByMaterial: BOMSummary['sheetsByMaterial'] = [];
  for (const [matId, info] of sheetCounts.entries()) {
    const spec = MATERIAL_SPECS[matId];
    const unitPrice = prices[matId] ?? spec.defaultPricePerSheet;
    sheetsByMaterial.push({
      material: spec,
      usedAreaM2: Number(info.usedArea.toFixed(2)),
      sheetCount: info.count,
      unitPrice,
      totalCost: info.count * unitPrice,
    });
  }

  // Hardware calculation from modules and cutList
  let hingePairs = 0;
  let gasLiftCount = 0;
  let handlesCount = 0;
  let drawerSlidesPairs = 0;
  let legsCount = 0;
  let clothesRodSets = 0;

  for (const mod of project.modules) {
    const noHandle = mod.handleStyle === 'none';
    if (mod.kind === 'pastki_duxovka') {
      drawerSlidesPairs += 1;
      if (!noHandle) handlesCount += 1;
    } else {
      if (mod.doorCount > 0) {
        const pairsPerDoor = mod.height > 1100 ? 2 : 1;
        hingePairs += mod.doorCount * pairsPerDoor;
        if (!noHandle) handlesCount += mod.doorCount;
        if (mod.doorCount === 1 && (mod.doorHinge === 'top' || mod.handleOrientation === 'horizontal')) {
          gasLiftCount += 2;
        }
      }
      if (mod.drawerCount > 0) {
        drawerSlidesPairs += mod.drawerCount;
        if (!noHandle) handlesCount += mod.drawerCount;
      }
    }
    if (mod.legHeight > 0) {
      legsCount += mod.width >= 1200 ? 6 : 4;
    }
    if (mod.hasClothesRod) {
      clothesRodSets += 1;
    }
  }

  // Konfirmat screws (approx 4 per structural board)
  const structuralPanels = cutList
    .filter(
      (r) =>
        r.role === 'ostki_ustki' ||
        r.role === 'tsarga' ||
        r.role === 'tortma_korpus' ||
        r.role === 'orta_devor',
    )
    .reduce((acc, r) => acc + r.quantity, 0);
  const konfirmatCount = totalPartsCount > 0 ? Math.max(16, structuralPanels * 4) : 0;

  const hardware: HardwareItem[] = [];

  if (totalEdge04Meters > 0) {
    hardware.push({
      id: 'kromka_04',
      name: 'Kromka PVX 0.4×19mm (Korpus uchun)',
      unit: 'metr',
      quantity: Math.ceil(totalEdge04Meters),
      unitPrice: prices.kromka_04,
      totalPrice: Math.ceil(totalEdge04Meters) * prices.kromka_04,
    });
  }

  if (totalEdge20Meters > 0) {
    hardware.push({
      id: 'kromka_20',
      name: 'Kromka PVX 2.0×19mm (Fasad va old qirralar)',
      unit: 'metr',
      quantity: Math.ceil(totalEdge20Meters),
      unitPrice: prices.kromka_20,
      totalPrice: Math.ceil(totalEdge20Meters) * prices.kromka_20,
    });
  }

  if (countertopLinearMeters > 0) {
    hardware.push({
      id: 'stoleshnitsa_pm',
      name: 'Stoleshnitsa 38mm (Namga chidamli)',
      unit: 'pog.m',
      quantity: countertopLinearMeters,
      unitPrice: prices.stoleshnitsa_38,
      totalPrice: Math.round(countertopLinearMeters * prices.stoleshnitsa_38),
    });
  }

  if (hingePairs > 0) {
    hardware.push({
      id: 'hinges',
      name: 'Oshiq-moshiq (Petlya dovodchik bilan)',
      unit: 'juft',
      quantity: hingePairs,
      unitPrice: prices.hinge_pair,
      totalPrice: hingePairs * prices.hinge_pair,
    });
  }

  if (gasLiftCount > 0) {
    const glPrice = prices.gas_lift ?? DEFAULT_PRICES.gas_lift!;
    hardware.push({
      id: 'gas_lift',
      name: 'Gazlift 80N/100N (Tepaga ochiluvchi eshik)',
      unit: 'dona',
      quantity: gasLiftCount,
      unitPrice: glPrice,
      totalPrice: gasLiftCount * glPrice,
    });
  }

  if (drawerSlidesPairs > 0) {
    hardware.push({
      id: 'slides',
      name: "Teleskopik tortma yo'naltirgich (Napravlyayushie)",
      unit: 'juft',
      quantity: drawerSlidesPairs,
      unitPrice: prices.drawer_slide,
      totalPrice: drawerSlidesPairs * prices.drawer_slide,
    });
  }

  if (handlesCount > 0) {
    hardware.push({
      id: 'handles',
      name: 'Mebel tutqichi (Ruchka skoba 128mm)',
      unit: 'dona',
      quantity: handlesCount,
      unitPrice: prices.handle,
      totalPrice: handlesCount * prices.handle,
    });
  }

  if (legsCount > 0) {
    hardware.push({
      id: 'legs',
      name: 'Rostlanuvchi mebel oyoqchasi (100mm qora)',
      unit: 'dona',
      quantity: legsCount,
      unitPrice: prices.leg,
      totalPrice: legsCount * prices.leg,
    });
  }

  if (clothesRodSets > 0) {
    const rodPrice = prices.clothes_rod_set ?? DEFAULT_PRICES.clothes_rod_set!;
    hardware.push({
      id: 'clothes_rod',
      name: 'Kiyim ilgich xrom trubasi (Joker 25mm + flanets)',
      unit: "to'plam",
      quantity: clothesRodSets,
      unitPrice: rodPrice,
      totalPrice: clothesRodSets * rodPrice,
    });
  }

  if (konfirmatCount > 0) {
    hardware.push({
      id: 'konfirmat',
      name: 'Yevrovint (Konfirmat 7×50mm) va shkantlar',
      unit: 'dona',
      quantity: konfirmatCount,
      unitPrice: prices.konfirmat,
      totalPrice: konfirmatCount * prices.konfirmat,
    });
  }

  const totalMaterialCost = sheetsByMaterial.reduce((acc, s) => acc + s.totalCost, 0);
  const totalHardwareCost = hardware.reduce((acc, h) => acc + h.totalPrice, 0);
  const grandTotalCost = totalMaterialCost + totalHardwareCost;

  // Workshop services (Sex va Usta xizmatlari)
  const totalSheetsCount = sheetsByMaterial.reduce((acc, s) => acc + s.sheetCount, 0);
  const cuttingRate = prices.cutting_per_sheet ?? DEFAULT_PRICES.cutting_per_sheet!;
  const edgeGluingRate = prices.edge_gluing_per_m ?? DEFAULT_PRICES.edge_gluing_per_m!;
  const assemblyPct = prices.assembly_percent ?? DEFAULT_PRICES.assembly_percent!;
  const deliveryFlat = prices.delivery_flat ?? DEFAULT_PRICES.delivery_flat!;

  const cuttingServiceCost = totalSheetsCount * cuttingRate;
  const edgeGluingServiceCost =
    Math.ceil(totalEdge04Meters + totalEdge20Meters) * edgeGluingRate;
  const assemblyServiceCost = Math.round(
    ((grandTotalCost + cuttingServiceCost + edgeGluingServiceCost) * assemblyPct) / 100,
  );
  const deliveryCost = totalPartsCount > 0 ? deliveryFlat : 0;
  const totalServiceCost =
    cuttingServiceCost + edgeGluingServiceCost + assemblyServiceCost + deliveryCost;
  const turnkeyTotalCost = grandTotalCost + totalServiceCost;

  // Per-module cost breakdown (`moduleCosts`)
  const moduleCosts: ModuleCostEstimate[] = project.modules.map((mod) => {
    const modRows = cutList.filter((r) => r.moduleId === mod.id);
    const partsCount = modRows.reduce((a, r) => a + r.quantity, 0);
    const areaM2 = Number(modRows.reduce((a, r) => a + r.areaM2, 0).toFixed(2));

    // Estimate module's board cost proportionally by sheet m² price + waste factor (1.22)
    let matCost = 0;
    let edgeCost = 0;
    for (const r of modRows) {
      if (r.material === 'stoleshnitsa_38' || r.role === 'stoleshnitsa') {
        matCost += ((r.cutLength * r.quantity) / 1000) * prices.stoleshnitsa_38;
      } else {
        const spec = MATERIAL_SPECS[r.material];
        const sheetArea = (spec.sheetLength * spec.sheetWidth) / 1_000_000;
        const pricePerM2 = (prices[r.material] ?? spec.defaultPricePerSheet) / sheetArea;
        matCost += r.areaM2 * pricePerM2 * 1.22;
      }
      edgeCost += r.edge04Meters * prices.kromka_04 + r.edge20Meters * prices.kromka_20;
    }

    // Module hardware
    let hwCost = edgeCost + partsCount * 3 * prices.konfirmat;
    const noHandle = mod.handleStyle === 'none';
    if (mod.kind === 'pastki_duxovka') {
      hwCost += prices.drawer_slide + (noHandle ? 0 : prices.handle);
    } else {
      if (mod.drawerCount > 0) {
        hwCost += mod.drawerCount * (prices.drawer_slide + (noHandle ? 0 : prices.handle));
      }
      if (mod.doorCount > 0) {
        const pairs = mod.height > 1100 ? 2 : 1;
        hwCost += mod.doorCount * (pairs * prices.hinge_pair + (noHandle ? 0 : prices.handle));
        if (mod.doorCount === 1 && (mod.doorHinge === 'top' || mod.handleOrientation === 'horizontal')) {
          hwCost += 2 * (prices.gas_lift ?? DEFAULT_PRICES.gas_lift!);
        }
      }
    }
    if (mod.legHeight > 0) {
      hwCost += (mod.width >= 1200 ? 6 : 4) * prices.leg;
    }
    if (mod.hasClothesRod) {
      hwCost += prices.clothes_rod_set ?? DEFAULT_PRICES.clothes_rod_set!;
    }

    const materialCost = Math.round(matCost / 1000) * 1000;
    const hardwareCost = Math.round(hwCost / 1000) * 1000;
    return {
      moduleId: mod.id,
      moduleName: mod.name,
      dimensions: `${mod.width}×${mod.height}×${mod.depth} mm`,
      partsCount,
      areaM2,
      materialCost,
      hardwareCost,
      estimatedTotal: materialCost + hardwareCost,
    };
  });

  return {
    totalPartsCount,
    totalBoardsM2,
    totalEdge04Meters,
    totalEdge20Meters,
    countertopLinearMeters,
    sheetsByMaterial,
    hardware,
    totalMaterialCost,
    totalHardwareCost,
    grandTotalCost,
    cuttingServiceCost,
    edgeGluingServiceCost,
    assemblyServiceCost,
    deliveryCost,
    totalServiceCost,
    turnkeyTotalCost,
    moduleCosts,
  };
}

/**
 * Creates the default Kitchen Garnitur project matching the user's attached reference image (`image_bea20856.png`).
 */
export function createDefaultKitchenProject(): FurnitureProject {
  const bodyHex = '#D9D3C7';
  const facadeHex = '#E2DDD2';
  const ctHex = '#BCB6A9';

  const modules: FurnitureModule[] = [
    // 1. Left Sink Cabinet (Moykali 2 eshikli shkaf, W=800mm)
    {
      id: 'mod_sink_800',
      name: '1. Moykali shkaf (Chap 800mm)',
      kind: 'pastki_moyka',
      width: 800,
      height: 720,
      depth: 560,
      x: 0,
      y: 0,
      z: 0,
      boardThickness: 16,
      bodyMaterial: 'ldsp_16',
      facadeMaterial: 'lmdf_16',
      bodyColor: bodyHex,
      facadeColor: facadeHex,
      countertopColor: ctHex,
      hasCountertop: true,
      countertopThickness: 38,
      countertopOverhangFront: 40,
      legHeight: 100,
      doorCount: 2,
      handleOrientation: 'vertical',
      drawerCount: 0,
      shelfCount: 0,
      hasBackPanel: false,
    },
    // 2. Narrow 1-Door Base Cabinet (Tor 1 eshikli shkaf, W=400mm — highlighted in blue in reference image)
    {
      id: 'mod_base_400',
      name: "2. O'rta tor shkaf (400mm)",
      kind: 'pastki_eshikli',
      width: 400,
      height: 720,
      depth: 560,
      x: 800,
      y: 0,
      z: 0,
      boardThickness: 16,
      bodyMaterial: 'ldsp_16',
      facadeMaterial: 'lmdf_16',
      bodyColor: bodyHex,
      facadeColor: facadeHex,
      countertopColor: ctHex,
      hasCountertop: true,
      countertopThickness: 38,
      countertopOverhangFront: 40,
      legHeight: 100,
      doorCount: 1,
      handleOrientation: 'horizontal',
      drawerCount: 0,
      shelfCount: 1,
      hasBackPanel: true,
    },
    // 3. 3-Drawer Base Cabinet (3 tortmali shkaf, W=800mm)
    {
      id: 'mod_drawers_800',
      name: '3. Tortmali shkaf (800mm, 3 tortma)',
      kind: 'pastki_tortmali',
      width: 800,
      height: 720,
      depth: 560,
      x: 1200,
      y: 0,
      z: 0,
      boardThickness: 16,
      bodyMaterial: 'ldsp_16',
      facadeMaterial: 'lmdf_16',
      bodyColor: bodyHex,
      facadeColor: facadeHex,
      countertopColor: ctHex,
      hasCountertop: true,
      countertopThickness: 38,
      countertopOverhangFront: 40,
      legHeight: 100,
      doorCount: 0,
      handleOrientation: 'horizontal',
      drawerCount: 3,
      shelfCount: 0,
      hasBackPanel: true,
    },
    // 4. Right Stove Base Cabinet (Gaz plitali 1 eshikli shkaf, W=800mm)
    {
      id: 'mod_stove_800',
      name: "4. Plitali shkaf (O'ng 800mm)",
      kind: 'pastki_plita',
      width: 800,
      height: 720,
      depth: 560,
      x: 2000,
      y: 0,
      z: 0,
      boardThickness: 16,
      bodyMaterial: 'ldsp_16',
      facadeMaterial: 'lmdf_16',
      bodyColor: bodyHex,
      facadeColor: facadeHex,
      countertopColor: ctHex,
      hasCountertop: true,
      countertopThickness: 38,
      countertopOverhangFront: 40,
      legHeight: 100,
      doorCount: 1,
      handleOrientation: 'vertical',
      drawerCount: 0,
      shelfCount: 1,
      hasBackPanel: true,
    },
    // 5. Upper Left Wall Cabinet (Yuqori chap osma shkaf, W=800mm, H=720mm)
    {
      id: 'mod_upper_left_800',
      name: '5. Yuqori osma shkaf (Chap 800mm)',
      kind: 'yuqori_shkaf',
      width: 800,
      height: 720,
      depth: 320,
      x: 0,
      y: 1420,
      z: 0,
      boardThickness: 16,
      bodyMaterial: 'ldsp_16',
      facadeMaterial: 'lmdf_16',
      bodyColor: bodyHex,
      facadeColor: facadeHex,
      countertopColor: ctHex,
      hasCountertop: false,
      countertopThickness: 0,
      countertopOverhangFront: 0,
      legHeight: 0,
      doorCount: 1,
      handleOrientation: 'vertical',
      drawerCount: 0,
      shelfCount: 2,
      hasBackPanel: true,
    },
    // 6. Upper Narrow Wall Cabinet (Yuqori tor osma shkaf, W=400mm, H=720mm)
    {
      id: 'mod_upper_mid_400',
      name: "6. Yuqori tor shkaf (O'rta 400mm)",
      kind: 'yuqori_shkaf',
      width: 400,
      height: 720,
      depth: 320,
      x: 800,
      y: 1420,
      z: 0,
      boardThickness: 16,
      bodyMaterial: 'ldsp_16',
      facadeMaterial: 'lmdf_16',
      bodyColor: bodyHex,
      facadeColor: facadeHex,
      countertopColor: ctHex,
      hasCountertop: false,
      countertopThickness: 0,
      countertopOverhangFront: 0,
      legHeight: 0,
      doorCount: 1,
      handleOrientation: 'vertical',
      drawerCount: 0,
      shelfCount: 2,
      hasBackPanel: true,
    },
    // 7. Upper Center-Right Wall Cabinet (Yuqori o'rta osma shkaf, W=800mm, H=720mm)
    {
      id: 'mod_upper_mid_800',
      name: "7. Yuqori osma shkaf (O'rta 800mm)",
      kind: 'yuqori_shkaf',
      width: 800,
      height: 720,
      depth: 320,
      x: 1200,
      y: 1420,
      z: 0,
      boardThickness: 16,
      bodyMaterial: 'ldsp_16',
      facadeMaterial: 'lmdf_16',
      bodyColor: bodyHex,
      facadeColor: facadeHex,
      countertopColor: ctHex,
      hasCountertop: false,
      countertopThickness: 0,
      countertopOverhangFront: 0,
      legHeight: 0,
      doorCount: 1,
      handleOrientation: 'vertical',
      drawerCount: 0,
      shelfCount: 2,
      hasBackPanel: true,
    },
    // 8. Upper Hood Cabinet (Dudburon usti shkafi, W=800mm, H=480mm, Y=1660mm so top aligns at 2140mm)
    {
      id: 'mod_upper_hood_800',
      name: '8. Dudburon (Vityajka) shkafi (800mm)',
      kind: 'yuqori_vityajka',
      width: 800,
      height: 480,
      depth: 320,
      x: 2000,
      y: 1660,
      z: 0,
      boardThickness: 16,
      bodyMaterial: 'ldsp_16',
      facadeMaterial: 'lmdf_16',
      bodyColor: bodyHex,
      facadeColor: facadeHex,
      countertopColor: ctHex,
      hasCountertop: false,
      countertopThickness: 0,
      countertopOverhangFront: 0,
      legHeight: 0,
      doorCount: 1,
      handleOrientation: 'vertical',
      drawerCount: 0,
      shelfCount: 1,
      hasBackPanel: true,
    },
  ];

  return {
    id: 'proj_kitchen_default',
    name: "Oshxona Garnituri 2.8m (Standart To'plam)",
    updatedAt: new Date().toISOString(),
    roomWidth: 3400,
    roomDepth: 2400,
    roomHeight: 2500,
    sawKerf: 4,
    sheetTrim: 10,
    modules,
    customParts: [],
    partOverrides: {},
    prices: { ...DEFAULT_PRICES },
  };
}

/**
 * Creates a clean "0 dan" project with a single customizable starter cabinet or completely empty workspace.
 */
export function createBlankProject(withStarterBox: boolean = false): FurnitureProject {
  const modules: FurnitureModule[] = withStarterBox
    ? [
        {
          id: `mod_${Date.now()}`,
          name: '1. Pastki shkaf (Bazaviy)',
          kind: 'pastki_eshikli',
          width: 600,
          height: 720,
          depth: 560,
          x: 200,
          y: 0,
          z: 0,
          boardThickness: 16,
          bodyMaterial: 'ldsp_16',
          facadeMaterial: 'lmdf_16',
          bodyColor: '#D9D3C7',
          facadeColor: '#E2DDD2',
          countertopColor: '#BCB6A9',
          hasCountertop: true,
          countertopThickness: 38,
          countertopOverhangFront: 40,
          legHeight: 100,
          doorCount: 2,
          handleOrientation: 'vertical',
          drawerCount: 0,
          shelfCount: 1,
          hasBackPanel: true,
        },
      ]
    : [];

  return {
    id: `proj_${Date.now()}`,
    name: withStarterBox ? 'Yangi Mebel Loyihasi (1-modul)' : '0 dan Yangi Loyiha',
    updatedAt: new Date().toISOString(),
    roomWidth: 3200,
    roomDepth: 2400,
    roomHeight: 2500,
    sawKerf: 4,
    sheetTrim: 10,
    modules,
    customParts: [],
    partOverrides: {},
    prices: { ...DEFAULT_PRICES },
  };
}

export function createWardrobeProject(): FurnitureProject {
  return {
    id: `proj_wardrobe_${Date.now()}`,
    name: "Yotoqxona Shkaf-Kupe va Komod To'plami",
    updatedAt: new Date().toISOString(),
    roomWidth: 3200,
    roomDepth: 2400,
    roomHeight: 2500,
    sawKerf: 4,
    sheetTrim: 10,
    modules: [
      {
        id: 'mod_wardrobe_1',
        name: '1. Baland Kiyim Shkafi (Chap 900mm)',
        kind: 'shkaf_kupe',
        width: 900,
        height: 2100,
        depth: 580,
        x: 100,
        y: 0,
        z: 0,
        boardThickness: 16,
        bodyMaterial: 'ldsp_16',
        facadeMaterial: 'lmdf_16',
        bodyColor: '#C8A878',
        facadeColor: '#E2DDD2',
        countertopColor: '#C8A878',
        hasCountertop: false,
        countertopThickness: 0,
        countertopOverhangFront: 0,
        legHeight: 60,
        doorCount: 2,
        handleOrientation: 'vertical',
        drawerCount: 0,
        shelfCount: 4,
        hasBackPanel: true,
        centerDivider: true,
        hasClothesRod: true,
      },
      {
        id: 'mod_wardrobe_2',
        name: '2. Tortmali Komod (800mm)',
        kind: 'pastki_tortmali',
        width: 800,
        height: 850,
        depth: 500,
        x: 1050,
        y: 0,
        z: 0,
        boardThickness: 16,
        bodyMaterial: 'ldsp_16',
        facadeMaterial: 'lmdf_16',
        bodyColor: '#C8A878',
        facadeColor: '#E2DDD2',
        countertopColor: '#C8A878',
        hasCountertop: true,
        countertopThickness: 38,
        countertopOverhangFront: 20,
        legHeight: 60,
        doorCount: 0,
        handleOrientation: 'horizontal',
        drawerCount: 4,
        shelfCount: 0,
        hasBackPanel: true,
      },
    ],
    customParts: [],
    partOverrides: {},
    prices: { ...DEFAULT_PRICES },
  };
}
