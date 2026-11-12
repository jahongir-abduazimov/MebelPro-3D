export type PartRole =
  | 'yon_devor'       // Yon devor (Stoyka)
  | 'ostki_ustki'     // Ostki / Ustki qism (Gorizont)
  | 'tokcha'          // Ichki tokcha (Polka)
  | 'orta_devor'      // O'rta to'siq (Peregorodka)
  | 'fasad_eshik'     // Fasad / Eshik
  | 'tortma_fasad'    // Tortma fasadi (Nakladka)
  | 'tortma_korpus'   // Tortma qutisi detali
  | 'tsarga'          // Tsarga / Planka / Tsokol
  | 'orqa_devor'      // Orqa devor (XDF / DVP)
  | 'stoleshnitsa'    // Stol usti (Stoleshnitsa)
  | 'boshqa';         // Maxsus / Boshqa detal

export type MaterialId =
  | 'ldsp_16'
  | 'ldsp_18'
  | 'lmdf_16'
  | 'akril_mdf_18'
  | 'xdf_4'
  | 'stoleshnitsa_38';

export type EdgeBandType = 'none' | '0.4mm' | '2mm';

export interface EdgeConfig {
  l1: EdgeBandType; // Uzunlik 1-tomon
  l2: EdgeBandType; // Uzunlik 2-tomon
  w1: EdgeBandType; // Eni 1-tomon
  w2: EdgeBandType; // Eni 2-tomon
}

export interface MaterialSpec {
  id: MaterialId;
  name: string;
  shortName: string;
  thickness: number; // mm
  sheetLength: number; // mm (e.g. 2750)
  sheetWidth: number; // mm (e.g. 1830)
  defaultPricePerSheet: number; // UZS
  isSheet: boolean;
}

export interface FinishPreset {
  id: string;
  name: string;
  hex: string;
  roughness: number;
  metalness: number;
  woodGrain?: boolean;
}

export type ModuleKind =
  | 'pastki_eshikli'   // Pastki shkaf (1 yoki 2 eshikli)
  | 'pastki_moyka'     // Moykali shkaf (rakovina + kran bilan)
  | 'pastki_tortmali'  // Tortmali shkaf (2-4 tortma)
  | 'pastki_plita'     // Gaz plitali shkaf (4 konforkali plita bilan)
  | 'pastki_duxovka'   // Duxovka shkafi (o'rnatiladigan pech + pastki tortma)
  | 'yuqori_shkaf'     // Yuqori osma shkaf
  | 'yuqori_vityajka'  // Dudburon (vityajka) usti shkafi
  | 'penal_kalonka'    // Baland oshxona penali / kalonka
  | 'shkaf_kupe'       // Kiyim shkafi / Garderob
  | 'tv_tumba'         // TV Tumba (Mehmonxona uchun)
  | 'oyoq_kiyim'       // Oyoq kiyim shkafi (Prixojka)
  | 'yozuv_stoli'      // Yozuv stoli / Parta
  | 'kitob_javoni';    // Ochiq stellaj / Kitob javoni

export interface FurnitureModule {
  id: string;
  name: string;
  kind: ModuleKind;
  width: number;           // Umumiy eni (X), mm
  height: number;          // Korpus balandligi (Y), mm
  depth: number;           // Korpus chuqurligi (Z), mm
  x: number;               // Xonadagi joylashuvi X, mm (chap devordan)
  y: number;               // Poldan balandligi Y, mm (pastki shkaflar uchun 0)
  z: number;               // Orqa devordan Z, mm
  boardThickness: number;  // 16 yoki 18 mm
  bodyMaterial: MaterialId;
  facadeMaterial: MaterialId;
  bodyColor: string;       // hex
  facadeColor: string;     // hex
  countertopColor: string; // hex
  hasCountertop: boolean;
  countertopThickness: number; // 38 mm
  countertopOverhangFront: number; // 40 mm
  legHeight: number;       // Oyoqcha balandligi, mm (masalan 100mm, osma shkafda 0)
  doorCount: 0 | 1 | 2;
  doorHinge?: 'left' | 'right' | 'top'; // 1 eshikli modul uchun ochilish tomoni
  handleOrientation: 'vertical' | 'horizontal';
  drawerCount: number;     // 0..5
  shelfCount: number;      // 0..8
  hasBackPanel: boolean;   // XDF 4mm
  centerDivider?: boolean; // O'rta vertikal to'siq (Peregorodka)
  hasToeKick?: boolean;    // Old tsokol plankasi (oyoqchalar oldini yopuvchi)
  hasClothesRod?: boolean; // Kiyim ilgich xrom trubasi (Shkaf uchun)
}

export interface CustomPart {
  id: string;
  name: string;
  role: PartRole;
  material: MaterialId;
  color: string;
  cutLength: number; // mm
  cutWidth: number;  // mm
  thickness: number; // mm
  quantity: number;
  edges: EdgeConfig;
  // 3D placement in room (mm)
  x: number;
  y: number;
  z: number;
  orientation: 'vertical_side' | 'horizontal' | 'frontal';
}

export interface PartOverride {
  role?: PartRole;
  name?: string;
  material?: MaterialId;
  edges?: EdgeConfig;
  cutLength?: number;
  cutWidth?: number;
}

export interface Generated3DBoard {
  id: string;              // Unique ID for 3D selection & override (e.g. `${moduleId}:left_side`)
  moduleId: string;
  moduleName: string;
  name: string;
  role: PartRole;
  material: MaterialId;
  color: string;
  // Raskroy cutting dimensions in mm
  cutLength: number;       // Uzunligi (mm)
  cutWidth: number;        // Eni (mm)
  thickness: number;       // Qalinligi (mm)
  edges: EdgeConfig;
  // 3D bounding box center & size in room space (mm)
  centerX: number;
  centerY: number;
  centerZ: number;
  sizeX: number;
  sizeY: number;
  sizeZ: number;
  // For interactive door/drawer opening or exploded view
  isDoor?: boolean;
  doorHingeSide?: 'left' | 'right' | 'top';
  isDrawer?: boolean;
  explodeVec: [number, number, number];
}

export interface CutListRow {
  id: string;
  index: number;
  moduleId: string;
  moduleName: string;
  partName: string;
  role: PartRole;
  material: MaterialId;
  thickness: number;
  cutLength: number; // mm
  cutWidth: number;  // mm
  quantity: number;
  edges: EdgeConfig;
  areaM2: number;    // Jami yuza (m²)
  edge04Meters: number;
  edge20Meters: number;
  boardIds: string[];
}

export interface PlacedSheetPart {
  rowId: string;
  partIndex: number;
  partName: string;
  moduleName: string;
  role: PartRole;
  x: number;      // mm from left of sheet
  y: number;      // mm from top of sheet
  length: number; // placed horizontal dimension (mm)
  width: number;  // placed vertical dimension (mm)
  rotated: boolean;
}

export interface RaskroySheet {
  sheetNumber: number;
  material: MaterialId;
  materialName: string;
  sheetLength: number;
  sheetWidth: number;
  usedAreaM2: number;
  totalAreaM2: number;
  efficiencyPercent: number;
  parts: PlacedSheetPart[];
}

export interface HardwareItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number; // UZS
  totalPrice: number;
}

export interface MaterialPriceConfig {
  ldsp_16: number;
  ldsp_18: number;
  lmdf_16: number;
  akril_mdf_18: number;
  xdf_4: number;
  stoleshnitsa_38: number;   // per linear meter
  kromka_04: number;         // per meter
  kromka_20: number;         // per meter
  hinge_pair: number;        // 1 juft oshiq-moshiq
  handle: number;            // 1 dona tutqich
  drawer_slide: number;      // 1 juft teleskopik yo'naltirgich
  leg: number;               // 1 dona oyoqcha
  konfirmat: number;         // 1 dona yevrovint
  gas_lift?: number;         // 1 dona gazlift (tepaga ochiluvchi eshik uchun)
  clothes_rod_set?: number;  // 1 to'plam kiyim ilgich trubasi
  cutting_per_sheet?: number;// 1 list raskroy kesish xizmati
  edge_gluing_per_m?: number;// 1 metr kromka yopishtirish xizmati
  assembly_percent?: number; // Usta yig'ish va o'rnatish foizi (%)
  delivery_flat?: number;    // Yetkazib berish (transport) narxi
}

export interface ModuleCostEstimate {
  moduleId: string;
  moduleName: string;
  dimensions: string;
  partsCount: number;
  areaM2: number;
  materialCost: number;
  hardwareCost: number;
  estimatedTotal: number;
}

export interface BOMSummary {
  totalPartsCount: number;
  totalBoardsM2: number;
  totalEdge04Meters: number;
  totalEdge20Meters: number;
  countertopLinearMeters: number;
  sheetsByMaterial: {
    material: MaterialSpec;
    usedAreaM2: number;
    sheetCount: number;
    unitPrice: number;
    totalCost: number;
  }[];
  hardware: HardwareItem[];
  totalMaterialCost: number;
  totalHardwareCost: number;
  grandTotalCost: number;        // Xomashyo + Furnitura jami
  cuttingServiceCost: number;    // Sexda list kesish xizmati
  edgeGluingServiceCost: number; // Sexda kromka yopishtirish xizmati
  assemblyServiceCost: number;   // Usta yig'ish/o'rnatish xizmati
  deliveryCost: number;          // Transport / yetkazib berish
  totalServiceCost: number;      // Jami xizmatlar
  turnkeyTotalCost: number;      // Tayyor mebelning umumiy taxminiy narxi (Xomashyo + Xizmatlar)
  moduleCosts: ModuleCostEstimate[];
}

export interface FurnitureProject {
  id: string;
  name: string;
  updatedAt: string;
  roomWidth: number;  // mm (masalan 3600)
  roomDepth: number;  // mm (masalan 2600)
  roomHeight: number; // mm (masalan 2500)
  sawKerf: number;    // Arra qirqimi qalinligi, mm (masalan 4mm)
  sheetTrim: number;  // List chetidan tekislash (obrezka), mm (masalan 10mm)
  modules: FurnitureModule[];
  customParts: CustomPart[];
  partOverrides: Record<string, PartOverride>;
  prices: MaterialPriceConfig;
}
