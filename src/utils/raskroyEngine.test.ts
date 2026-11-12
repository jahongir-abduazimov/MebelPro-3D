import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calcPartEdgeMeters,
  calculateBOMSummary,
  createBlankProject,
  createDefaultKitchenProject,
  createEdgeConfig,
  decomposeModuleToBoards,
  generateCutList,
  nestPartsIntoSheets,
} from './raskroyEngine';
import { FurnitureModule } from '../types/furniture';

test('decomposeModuleToBoards computes exact workshop joinery dimensions in mm', () => {
  const mod: FurnitureModule = {
    id: 'test_cab',
    name: 'Sinov shkafi 800mm',
    kind: 'pastki_eshikli',
    width: 800,
    height: 720,
    depth: 560,
    x: 0,
    y: 0,
    z: 0,
    boardThickness: 16,
    bodyMaterial: 'ldsp_16',
    facadeMaterial: 'lmdf_16',
    bodyColor: '#EAE6DF',
    facadeColor: '#EAE6DF',
    countertopColor: '#C6C2B9',
    hasCountertop: true,
    countertopThickness: 38,
    countertopOverhangFront: 40,
    legHeight: 100,
    doorCount: 2,
    handleOrientation: 'vertical',
    drawerCount: 0,
    shelfCount: 1,
    hasBackPanel: true,
  };

  const boards = decomposeModuleToBoards(mod);

  // Side panels: 720 x 560 x 16
  const leftSide = boards.find((b) => b.id === 'test_cab:side_left');
  assert.ok(leftSide);
  assert.equal(leftSide.cutLength, 720);
  assert.equal(leftSide.cutWidth, 560);
  assert.equal(leftSide.thickness, 16);

  // Bottom/Top horizon panels sit between side panels: 800 - 2*16 = 768 x 560
  const bottomPanel = boards.find((b) => b.id === 'test_cab:bottom_panel');
  assert.ok(bottomPanel);
  assert.equal(bottomPanel.cutLength, 768);
  assert.equal(bottomPanel.cutWidth, 560);

  // Internal shelf: 768 - 2 = 766 x (560 - 20 = 540)
  const shelf = boards.find((b) => b.id === 'test_cab:shelf_1');
  assert.ok(shelf);
  assert.equal(shelf.cutLength, 766);
  assert.equal(shelf.cutWidth, 540);

  // 2 Doors: height = 720 - 4 = 716, width = 800/2 - 4 = 396
  const leftDoor = boards.find((b) => b.id === 'test_cab:door_left');
  assert.ok(leftDoor);
  assert.equal(leftDoor.cutLength, 716);
  assert.equal(leftDoor.cutWidth, 396);

  // Countertop: 800 x (560 + 40 = 600) x 38
  const ct = boards.find((b) => b.id === 'test_cab:countertop');
  assert.ok(ct);
  assert.equal(ct.cutLength, 800);
  assert.equal(ct.cutWidth, 600);
  assert.equal(ct.thickness, 38);

  // Back XDF: 716 x 796 x 4
  const back = boards.find((b) => b.id === 'test_cab:back_xdf');
  assert.ok(back);
  assert.equal(back.cutLength, 716);
  assert.equal(back.cutWidth, 796);
  assert.equal(back.thickness, 4);
});

test('calcPartEdgeMeters calculates 0.4mm and 2mm PVC edge banding with 10% allowance', () => {
  const edges = createEdgeConfig('2mm', '2mm', '0.4mm', 'none');
  // Length = 1000mm (both 2mm -> 2000mm), Width = 500mm (one 0.4mm -> 500mm), qty = 2
  const res = calcPartEdgeMeters(1000, 500, edges, 2);
  // 2mm: 2000mm * 2 * 1.1 / 1000 = 4.4m
  assert.equal(res.edge20, 4.4);
  // 0.4mm: 500mm * 2 * 1.1 / 1000 = 1.1m
  assert.equal(res.edge04, 1.1);
});

test('default kitchen project generates valid cut-list, nested sheets, and BOM summary', () => {
  const project = createDefaultKitchenProject();
  assert.equal(project.modules.length, 8);

  const cutList = generateCutList(project);
  assert.ok(cutList.length > 20);

  const sheets = nestPartsIntoSheets(cutList, project.sawKerf, project.sheetTrim);
  assert.ok(sheets.length >= 3);

  // Verify no part exceeds sheet dimensions
  for (const s of sheets) {
    for (const p of s.parts) {
      assert.ok(p.x + p.length <= s.sheetLength);
      assert.ok(p.y + p.width <= s.sheetWidth);
    }
  }

  const bom = calculateBOMSummary(project, cutList, sheets);
  assert.ok(bom.totalPartsCount > 40);
  assert.ok(bom.totalBoardsM2 > 10);
  assert.equal(bom.countertopLinearMeters, 2.8); // 800 + 400 + 800 + 800 = 2800mm = 2.8m
  assert.ok(bom.grandTotalCost > 1000000);
});

test('part overrides and custom 0-dan parts are reflected in cut-list', () => {
  const blank = createBlankProject(false);
  assert.equal(blank.modules.length, 0);

  blank.customParts.push({
    id: 'cp_1',
    name: 'Maxsus Polka',
    role: 'tokcha',
    material: 'ldsp_16',
    color: '#EAE6DF',
    cutLength: 900,
    cutWidth: 300,
    thickness: 16,
    quantity: 3,
    edges: createEdgeConfig('2mm', 'none', '0.4mm', '0.4mm'),
    x: 100,
    y: 500,
    z: 100,
    orientation: 'horizontal',
  });

  const cutList = generateCutList(blank);
  assert.equal(cutList.length, 1);
  assert.equal(cutList[0].quantity, 3);
  assert.equal(cutList[0].cutLength, 900);
  assert.equal(cutList[0].cutWidth, 300);
  assert.equal(cutList[0].role, 'tokcha');
});

test('centerDivider, hasToeKick, built-in oven module, and per-module cost estimates work accurately', () => {
  const project = createDefaultKitchenProject();
  // Enable centerDivider and hasToeKick on first module
  project.modules[0].centerDivider = true;
  project.modules[0].hasToeKick = true;
  project.modules[0].shelfCount = 2;

  const boards = decomposeModuleToBoards(project.modules[0]);
  const divider = boards.find((b) => b.id.endsWith(':center_divider'));
  assert.ok(divider);
  assert.equal(divider.role, 'orta_devor');

  const toeKick = boards.find((b) => b.id.endsWith(':toe_kick'));
  assert.ok(toeKick);
  assert.equal(toeKick.cutLength, 800);
  assert.equal(toeKick.cutWidth, 100);

  // Split shelves: 2 shelves * 2 compartments = 4 shelf boards
  const shelves = boards.filter((b) => b.role === 'tokcha');
  assert.equal(shelves.length, 4);

  const cutList = generateCutList(project);
  const sheets = nestPartsIntoSheets(cutList, project.sawKerf, project.sheetTrim);
  const bom = calculateBOMSummary(project, cutList, sheets);

  assert.equal(bom.moduleCosts.length, project.modules.length);
  assert.ok(bom.moduleCosts[0].estimatedTotal > 100000);
  assert.ok(bom.turnkeyTotalCost > bom.grandTotalCost);
});

