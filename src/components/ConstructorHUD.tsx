import React, { useState } from 'react';
import {
  BOMSummary,
  EdgeBandType,
  EdgeConfig,
  FurnitureModule,
  FurnitureProject,
  Generated3DBoard,
  MaterialId,
  ModuleKind,
  PartOverride,
  PartRole,
} from '../types/furniture';
import {
  FINISH_PRESETS,
  MATERIAL_SPECS,
  MODULE_TEMPLATES,
  PART_ROLE_LABELS,
} from '../utils/raskroyEngine';
import { formatUZS } from '../utils/storage';
import { CameraViewPreset } from './Viewport3D';
import {
  AlignHorizontalSpaceAround,
  ArrowLeft,
  ArrowRight,
  Box,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  DoorOpen,
  Layers,
  Minus,
  Plus,
  Sliders,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';

interface ConstructorHUDProps {
  project: FurnitureProject;
  boards: Generated3DBoard[];
  bom: BOMSummary;
  selectedModuleId: string | null;
  selectedBoardId: string | null;
  onSelectPart: (boardId: string | null, moduleId: string | null) => void;
  onUpdateModule: (moduleId: string, patch: Partial<FurnitureModule>) => void;
  onApplyToAllModules: (patch: Partial<FurnitureModule>) => void;
  onAutoPackModules: () => void;
  onAddModule: (kind: ModuleKind) => void;
  onDuplicateModule: (moduleId: string) => void;
  onDeleteModule: (moduleId: string) => void;
  onUpdateOverride: (boardIds: string[], patch: PartOverride) => void;
  explodeFactor: number;
  onChangeExplodeFactor: (val: number) => void;
  doorsOpen: boolean;
  onToggleDoorsOpen: () => void;
  cameraPreset: CameraViewPreset;
  onSelectCameraPreset: (preset: CameraViewPreset) => void;
  onOpenNewFromScratch: () => void;
  onOpenSmetaTab: () => void;
}

const EDGE_CYCLE: EdgeBandType[] = ['none', '0.4mm', '2mm'];
function nextEdge(curr: EdgeBandType): EdgeBandType {
  return EDGE_CYCLE[(EDGE_CYCLE.indexOf(curr) + 1) % EDGE_CYCLE.length];
}

const QUICK_WIDTHS = [300, 400, 450, 600, 800, 900, 1000, 1200];

export const ConstructorHUD: React.FC<ConstructorHUDProps> = ({
  project,
  boards,
  bom,
  selectedModuleId,
  selectedBoardId,
  onSelectPart,
  onUpdateModule,
  onApplyToAllModules,
  onAutoPackModules,
  onAddModule,
  onDuplicateModule,
  onDeleteModule,
  onUpdateOverride,
  explodeFactor,
  onChangeExplodeFactor,
  doorsOpen,
  onToggleDoorsOpen,
  cameraPreset,
  onSelectCameraPreset,
  onOpenNewFromScratch,
  onOpenSmetaTab,
}) => {
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false,
  );
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [catalogCategory, setCatalogCategory] = useState<'all' | 'oshxona' | 'shkaf' | 'ofis'>('all');
  const [colorTarget, setColorTarget] = useState<'both' | 'facade' | 'body'>('both');
  const [appliedAllNotice, setAppliedAllNotice] = useState(false);

  const selectedModule =
    project.modules.find((m) => m.id === selectedModuleId) ||
    project.modules[0] ||
    null;

  const selectedBoard = selectedBoardId
    ? boards.find((b) => b.id === selectedBoardId) || null
    : null;

  const selectedModuleCost = selectedModule
    ? bom.moduleCosts.find((mc) => mc.moduleId === selectedModule.id) || null
    : null;

  const filteredTemplates =
    catalogCategory === 'all'
      ? MODULE_TEMPLATES
      : MODULE_TEMPLATES.filter((t) => t.category === catalogCategory);

  const handleNudgeX = (deltaMm: number) => {
    if (!selectedModule) return;
    onUpdateModule(selectedModule.id, {
      x: Math.max(0, selectedModule.x + deltaMm),
    });
  };

  return (
    <>
      {/* Top-Left Live Project Summary & Estimated Price Strip */}
      <div className="absolute top-2.5 left-2.5 right-2.5 sm:right-auto z-20 pointer-events-auto flex flex-wrap items-center gap-1.5 sm:gap-2.5 bg-slate-900/95 border border-slate-800 rounded-xl px-3 py-1.5 sm:py-2 text-[11px] sm:text-xs text-slate-200 shadow-lg">
        <span className="font-semibold text-white truncate max-w-[140px] sm:max-w-[200px]">
          {project.name}
        </span>
        <span aria-hidden="true" className="text-slate-600">·</span>
        <span className="font-mono tabular-nums text-amber-300">
          {project.modules.length} modul
        </span>
        <span aria-hidden="true" className="text-slate-600">·</span>
        <span className="font-mono tabular-nums text-sky-300">
          {boards.length} detal
        </span>
        <span aria-hidden="true" className="text-slate-600">·</span>
        <button
          type="button"
          onClick={onOpenSmetaTab}
          title="Batafsil smeta va narx hisob-kitobini ko'rish"
          className="font-mono tabular-nums font-bold text-emerald-300 hover:text-emerald-200 transition-colors cursor-pointer"
        >
          ~{formatUZS(bom.grandTotalCost)}
        </button>
        <span aria-hidden="true" className="text-slate-600">·</span>
        <button
          type="button"
          onClick={() => setInspectorOpen((v) => !v)}
          className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold transition-colors cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5 text-sky-400" />
          <span>{inspectorOpen ? 'Yopish' : 'Moslashtirish'}</span>
        </button>
      </div>

      {/* Empty Project State Overlay ("0 dan modellashtirish") */}
      {project.modules.length === 0 && project.customParts.length === 0 && (
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center p-4">
          <div className="pointer-events-auto max-w-md w-full bg-slate-900/95 border border-slate-800 rounded-2xl p-6 text-center shadow-2xl space-y-4">
            <Box className="w-10 h-10 text-amber-400 mx-auto" />
            <div>
              <h2 className="text-lg font-bold text-white">
                0 dan Yangi Mebel Loyihasi
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Tayyor mebel modullaridan birini tanlab o&apos;lchamlarini kiriting yoki Raskroy bo&apos;limidan alohida detallarni 1 tadan qo&apos;shing.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowAddModuleModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Birinchi Modulni Qo&apos;shish</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collapsible CAD Parameter & Live Cost Drawer */}
      {inspectorOpen && selectedModule && (
        <aside
          aria-label="Modul va Detal O'lchamlari Inspektori"
          className="absolute top-13 right-2.5 left-2.5 sm:left-auto bottom-24 z-30 sm:w-92 bg-slate-900/95 border border-slate-800 rounded-xl shadow-2xl flex flex-col overflow-hidden pointer-events-auto"
        >
          {/* Drawer Header */}
          <div className="px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
            <div className="flex items-center gap-2 min-w-0">
              <Sliders className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs font-bold text-white truncate">
                Oson Moslashtirish va Taxminiy Narx
              </span>
            </div>
            <button
              type="button"
              onClick={() => setInspectorOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              aria-label="Inspektorni yopish"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs">
            {/* Live Estimated Price Banner for Selected Module & Whole Project */}
            <div className="rounded-xl bg-slate-950 border border-emerald-500/30 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Shu modulning taxminiy narxi:</span>
                <span className="font-mono tabular-nums font-bold text-emerald-300 text-sm">
                  {selectedModuleCost ? formatUZS(selectedModuleCost.estimatedTotal) : '—'}
                </span>
              </div>
              {selectedModuleCost && (
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>
                    {selectedModuleCost.partsCount} ta detal · {selectedModuleCost.areaM2} m²
                  </span>
                  <button
                    type="button"
                    onClick={onOpenSmetaTab}
                    className="text-amber-400 hover:text-amber-300 font-semibold underline cursor-pointer"
                  >
                    To&apos;liq smeta ({formatUZS(bom.grandTotalCost)})
                  </button>
                </div>
              )}
            </div>

            {/* Module Selector Dropdown + Quick Add */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="active-module-select" className="text-slate-400 font-medium">
                  Tanlangan modul ({project.modules.length} ta):
                </label>
                <button
                  type="button"
                  onClick={() => setShowAddModuleModal(true)}
                  className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Yangi modul qo&apos;shish</span>
                </button>
              </div>
              <select
                id="active-module-select"
                value={selectedModule.id}
                onChange={(e) => onSelectPart(null, e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
              >
                {project.modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.width}×{m.height}×{m.depth} mm)
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Individual 3D Board Card (when user clicks a specific board in 3D) */}
            {selectedBoard && (
              <div className="rounded-lg bg-slate-950 border border-sky-500/50 p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-sky-400">
                    Tanlangan 3D Detal (Raskroy)
                  </span>
                  <button
                    type="button"
                    onClick={() => onSelectPart(null, selectedModule.id)}
                    className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
                  >
                    Yopish
                  </button>
                </div>

                <div className="font-semibold text-white text-xs">
                  {selectedBoard.name} —{' '}
                  <span className="font-mono text-amber-300">
                    {selectedBoard.cutLength} × {selectedBoard.cutWidth} × {selectedBoard.thickness} mm
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <label className="space-y-1 col-span-2">
                    <span className="text-[11px] text-slate-400">Detal turi:</span>
                    <select
                      value={selectedBoard.role}
                      onChange={(e) =>
                        onUpdateOverride([selectedBoard.id], {
                          role: e.target.value as PartRole,
                        })
                      }
                      aria-label="Tanlangan 3D detal turi"
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-white"
                    >
                      {(Object.keys(PART_ROLE_LABELS) as PartRole[]).map((rk) => (
                        <option key={rk} value={rk}>
                          {PART_ROLE_LABELS[rk].label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="space-y-1">
                    <span className="text-[11px] text-slate-400">Kesish uzunligi (mm)</span>
                    <input
                      type="number"
                      min={40}
                      max={2800}
                      value={selectedBoard.cutLength}
                      onChange={(e) =>
                        onUpdateOverride([selectedBoard.id], {
                          cutLength: Math.max(40, Number(e.target.value) || 100),
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 font-mono tabular-nums text-amber-300"
                    />
                  </label>

                  <label className="space-y-1">
                    <span className="text-[11px] text-slate-400">Kesish eni (mm)</span>
                    <input
                      type="number"
                      min={40}
                      max={2070}
                      value={selectedBoard.cutWidth}
                      onChange={(e) =>
                        onUpdateOverride([selectedBoard.id], {
                          cutWidth: Math.max(40, Number(e.target.value) || 100),
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 font-mono tabular-nums text-sky-300"
                    />
                  </label>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400">PVX Kromka tomonlari:</span>
                  <div className="grid grid-cols-4 gap-1">
                    {(['l1', 'l2', 'w1', 'w2'] as (keyof EdgeConfig)[]).map((side, idx) => {
                      const val = selectedBoard.edges[side];
                      const lbl = idx < 2 ? `U${idx + 1}` : `E${idx - 1}`;
                      return (
                        <button
                          key={side}
                          type="button"
                          onClick={() =>
                            onUpdateOverride([selectedBoard.id], {
                              edges: {
                                ...selectedBoard.edges,
                                [side]: nextEdge(val),
                              },
                            })
                          }
                          className={`py-1 rounded text-[10px] font-mono border cursor-pointer ${
                            val === '2mm'
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                              : val === '0.4mm'
                              ? 'bg-sky-500/20 border-sky-500 text-sky-300'
                              : 'bg-slate-900 border-slate-800 text-slate-500'
                          }`}
                        >
                          {lbl}:{val === 'none' ? '-' : val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Module Name */}
            <label className="block space-y-1">
              <span className="text-slate-400">Modul nomi:</span>
              <input
                type="text"
                value={selectedModule.name}
                onChange={(e) =>
                  onUpdateModule(selectedModule.id, { name: e.target.value })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </label>

            {/* Primary Dimensions W x H x D with 1-Click Standard Widths & Sliders */}
            <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">
                  1. O&apos;lchamlari (Eni × Bo&apos;yi × Chuqurligi)
                </span>
                <span className="font-mono text-[11px] text-slate-400">mm</span>
              </div>

              {/* 1-Click Standard Widths */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400">Tezkor standart eni (mm):</span>
                <div className="grid grid-cols-4 gap-1">
                  {QUICK_WIDTHS.map((wVal) => (
                    <button
                      key={wVal}
                      type="button"
                      onClick={() => onUpdateModule(selectedModule.id, { width: wVal })}
                      className={`py-1 rounded font-mono text-[11px] border transition-colors cursor-pointer ${
                        selectedModule.width === wVal
                          ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold'
                          : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {wVal}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <label className="space-y-1">
                  <span className="text-[11px] text-slate-400">Eni (W)</span>
                  <input
                    type="number"
                    step={10}
                    min={150}
                    max={2600}
                    value={selectedModule.width}
                    onChange={(e) =>
                      onUpdateModule(selectedModule.id, {
                        width: Math.max(150, Number(e.target.value) || 600),
                      })
                    }
                    aria-label="Modul eni mm"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 font-mono tabular-nums text-amber-300 font-semibold"
                  />
                  <input
                    type="range"
                    min={200}
                    max={2000}
                    step={50}
                    value={Math.min(2000, selectedModule.width)}
                    onChange={(e) =>
                      onUpdateModule(selectedModule.id, { width: Number(e.target.value) })
                    }
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-[11px] text-slate-400">Bo&apos;yi (H)</span>
                  <input
                    type="number"
                    step={10}
                    min={200}
                    max={2600}
                    value={selectedModule.height}
                    onChange={(e) =>
                      onUpdateModule(selectedModule.id, {
                        height: Math.max(200, Number(e.target.value) || 720),
                      })
                    }
                    aria-label="Modul bo'yi mm"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 font-mono tabular-nums text-sky-300 font-semibold"
                  />
                  <input
                    type="range"
                    min={300}
                    max={2400}
                    step={20}
                    value={Math.min(2400, selectedModule.height)}
                    onChange={(e) =>
                      onUpdateModule(selectedModule.id, { height: Number(e.target.value) })
                    }
                    className="w-full accent-sky-500 cursor-pointer"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-[11px] text-slate-400">Chuqurlik (D)</span>
                  <input
                    type="number"
                    step={10}
                    min={150}
                    max={1200}
                    value={selectedModule.depth}
                    onChange={(e) =>
                      onUpdateModule(selectedModule.id, {
                        depth: Math.max(150, Number(e.target.value) || 560),
                      })
                    }
                    aria-label="Modul chuqurligi mm"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 font-mono tabular-nums text-emerald-300 font-semibold"
                  />
                  <input
                    type="range"
                    min={200}
                    max={800}
                    step={20}
                    value={Math.min(800, selectedModule.depth)}
                    onChange={(e) =>
                      onUpdateModule(selectedModule.id, { depth: Number(e.target.value) })
                    }
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Structure Configuration: Visual Button Selectors for Doors, Drawers, Shelves & Extras */}
            <div className="space-y-3 pt-2 border-t border-slate-800/80">
              <div className="font-semibold text-slate-200">
                2. Ichki Tuzilishi (Eshik, Tortma, Tokcha)
              </div>

              {/* Door Count Selector */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400">Fasad eshiklari soni:</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {([0, 1, 2] as (0 | 1 | 2)[]).map((dc) => (
                    <button
                      key={dc}
                      type="button"
                      onClick={() =>
                        onUpdateModule(selectedModule.id, {
                          doorCount: dc,
                          drawerCount: dc > 0 ? 0 : selectedModule.drawerCount,
                        })
                      }
                      className={`py-1.5 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer ${
                        selectedModule.doorCount === dc && selectedModule.drawerCount === 0
                          ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {dc === 0 ? 'Eshiksiz' : `${dc} ta eshik`}
                    </button>
                  ))}
                </div>
              </div>

              {/* 1-Door Hinge Direction Selector */}
              {selectedModule.doorCount === 1 && selectedModule.drawerCount === 0 && (
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400">Eshik ochilish yo&apos;nalishi:</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(
                      [
                        { id: 'left', label: 'Chapga' },
                        { id: 'right', label: "O'ngga" },
                        { id: 'top', label: 'Tepaga (Gazlift)' },
                      ] as { id: 'left' | 'right' | 'top'; label: string }[]
                    ).map((hOpt) => {
                      const currHinge =
                        selectedModule.doorHinge ||
                        (selectedModule.handleOrientation === 'horizontal' ? 'top' : 'left');
                      return (
                        <button
                          key={hOpt.id}
                          type="button"
                          onClick={() =>
                            onUpdateModule(selectedModule.id, {
                              doorHinge: hOpt.id,
                              handleOrientation: hOpt.id === 'top' ? 'horizontal' : 'vertical',
                            })
                          }
                          className={`py-1 rounded border text-[11px] transition-colors cursor-pointer ${
                            currHinge === hOpt.id
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {hOpt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Drawers Selector */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400">Tortmalar soni (Teleskopik):</span>
                <div className="grid grid-cols-5 gap-1">
                  {[0, 1, 2, 3, 4].map((dCount) => (
                    <button
                      key={dCount}
                      type="button"
                      onClick={() =>
                        onUpdateModule(selectedModule.id, {
                          drawerCount: dCount,
                          doorCount: dCount > 0 ? 0 : selectedModule.doorCount,
                        })
                      }
                      className={`py-1.5 rounded-lg border text-[11px] font-mono transition-colors cursor-pointer ${
                        selectedModule.drawerCount === dCount
                          ? 'bg-violet-500/25 border-violet-500 text-violet-200 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {dCount === 0 ? 'Yo\'q' : `${dCount} ta`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Shelves Stepper + Board Thickness */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400">Ichki tokchalar:</span>
                  <div className="flex items-center justify-between bg-slate-950 border border-slate-800 rounded-lg px-2 py-1">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateModule(selectedModule.id, {
                          shelfCount: Math.max(0, selectedModule.shelfCount - 1),
                        })
                      }
                      className="p-1 rounded hover:bg-slate-800 text-slate-300 cursor-pointer"
                      aria-label="Tokchani kamaytirish"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono font-bold text-emerald-300">
                      {selectedModule.shelfCount} ta
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateModule(selectedModule.id, {
                          shelfCount: Math.min(8, selectedModule.shelfCount + 1),
                        })
                      }
                      className="p-1 rounded hover:bg-slate-800 text-slate-300 cursor-pointer"
                      aria-label="Tokcha qo'shish"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <label className="space-y-1">
                  <span className="text-[11px] text-slate-400">Plita Qalinligi:</span>
                  <select
                    value={selectedModule.boardThickness}
                    onChange={(e) => {
                      const t = Number(e.target.value);
                      onUpdateModule(selectedModule.id, {
                        boardThickness: t,
                        bodyMaterial: t === 18 ? 'ldsp_18' : 'ldsp_16',
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-200"
                  >
                    <option value={16}>LDSP 16 mm</option>
                    <option value={18}>LDSP 18 mm</option>
                  </select>
                </label>
              </div>

              {/* Additional Construction Toggles (Peregorodka, Stoleshnitsa, Tsokol, Shtanga, XDF) */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800/90 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(selectedModule.centerDivider)}
                    onChange={(e) =>
                      onUpdateModule(selectedModule.id, {
                        centerDivider: e.target.checked,
                      })
                    }
                    className="rounded border-slate-700 bg-slate-900 text-amber-500"
                  />
                  <span className="text-[11px] text-slate-200 leading-tight">
                    O&apos;rta to&apos;siq (Peregorodka)
                  </span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800/90 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedModule.hasCountertop}
                    onChange={(e) =>
                      onUpdateModule(selectedModule.id, {
                        hasCountertop: e.target.checked,
                        countertopThickness: e.target.checked ? 38 : 0,
                        countertopOverhangFront: e.target.checked ? 40 : 0,
                      })
                    }
                    className="rounded border-slate-700 bg-slate-900 text-amber-500"
                  />
                  <span className="text-[11px] text-slate-200 leading-tight">
                    Stoleshnitsa (38mm)
                  </span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800/90 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(selectedModule.hasToeKick)}
                    onChange={(e) =>
                      onUpdateModule(selectedModule.id, {
                        hasToeKick: e.target.checked,
                        legHeight:
                          e.target.checked && selectedModule.legHeight === 0
                            ? 100
                            : selectedModule.legHeight,
                      })
                    }
                    className="rounded border-slate-700 bg-slate-900 text-amber-500"
                  />
                  <span className="text-[11px] text-slate-200 leading-tight">
                    Old tsokol plankasi
                  </span>
                </label>

                <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800/90 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(selectedModule.hasClothesRod)}
                    onChange={(e) =>
                      onUpdateModule(selectedModule.id, {
                        hasClothesRod: e.target.checked,
                      })
                    }
                    className="rounded border-slate-700 bg-slate-900 text-amber-500"
                  />
                  <span className="text-[11px] text-slate-200 leading-tight">
                    Kiyim ilgich truba
                  </span>
                </label>
              </div>
            </div>

            {/* Position & Quick Alignment in Room */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">
                  3. Joylashuvi va Tekislash
                </span>
                <button
                  type="button"
                  onClick={onAutoPackModules}
                  title="Barcha modullarni bir qatorga tirqishsiz tekislash"
                  className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 font-semibold cursor-pointer"
                >
                  <AlignHorizontalSpaceAround className="w-3.5 h-3.5" />
                  <span>Qatorni jipslash</span>
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleNudgeX(-100)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Chapga 10sm</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleNudgeX(100)}
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 cursor-pointer"
                >
                  <span>O&apos;ngga 10sm</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <label className="space-y-1">
                  <span className="text-[11px] text-slate-400">Chapdan X</span>
                  <input
                    type="number"
                    step={50}
                    min={0}
                    max={6000}
                    value={selectedModule.x}
                    onChange={(e) =>
                      onUpdateModule(selectedModule.id, {
                        x: Math.max(0, Number(e.target.value) || 0),
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 font-mono tabular-nums text-slate-200"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-[11px] text-slate-400">Poldan Y</span>
                  <input
                    type="number"
                    step={50}
                    min={0}
                    max={2400}
                    value={selectedModule.y}
                    onChange={(e) =>
                      onUpdateModule(selectedModule.id, {
                        y: Math.max(0, Number(e.target.value) || 0),
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 font-mono tabular-nums text-slate-200"
                  />
                </label>

                <label className="space-y-1">
                  <span className="text-[11px] text-slate-400">Oyoqcha (mm)</span>
                  <input
                    type="number"
                    step={10}
                    min={0}
                    max={250}
                    value={selectedModule.legHeight}
                    onChange={(e) =>
                      onUpdateModule(selectedModule.id, {
                        legHeight: Math.max(0, Number(e.target.value) || 0),
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 font-mono tabular-nums text-slate-200"
                  />
                </label>
              </div>
            </div>

            {/* Finish Swatches & Material Selection */}
            <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">
                  4. Rang va Fasad Materiali
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onApplyToAllModules({
                      facadeColor: selectedModule.facadeColor,
                      bodyColor: selectedModule.bodyColor,
                      facadeMaterial: selectedModule.facadeMaterial,
                      bodyMaterial: selectedModule.bodyMaterial,
                    });
                    setAppliedAllNotice(true);
                    setTimeout(() => setAppliedAllNotice(false), 1800);
                  }}
                  className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
                >
                  {appliedAllNotice ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Barchasiga qo&apos;llandi!</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Barchasiga qo&apos;llash</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="space-y-1">
                  <span className="text-[11px] text-slate-400">Fasad Materiali:</span>
                  <select
                    value={selectedModule.facadeMaterial}
                    onChange={(e) =>
                      onUpdateModule(selectedModule.id, {
                        facadeMaterial: e.target.value as MaterialId,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-slate-200"
                  >
                    {Object.values(MATERIAL_SPECS)
                      .filter((m) => m.id !== 'xdf_4' && m.id !== 'stoleshnitsa_38')
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.shortName}
                        </option>
                      ))}
                  </select>
                </label>

                <div className="space-y-1">
                  <span className="text-[11px] text-slate-400">Bo&apos;yash qismi:</span>
                  <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded border border-slate-800">
                    {(
                      [
                        { id: 'both', label: 'Ikkalasi' },
                        { id: 'facade', label: 'Fasad' },
                        { id: 'body', label: 'Korpus' },
                      ] as { id: 'both' | 'facade' | 'body'; label: string }[]
                    ).map((ct) => (
                      <button
                        key={ct.id}
                        type="button"
                        onClick={() => setColorTarget(ct.id)}
                        className={`py-0.5 rounded text-[10px] font-medium cursor-pointer ${
                          colorTarget === ct.id
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {ct.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {FINISH_PRESETS.map((fp) => {
                  const activeHex =
                    colorTarget === 'body'
                      ? selectedModule.bodyColor
                      : selectedModule.facadeColor;
                  const isActive = activeHex.toLowerCase() === fp.hex.toLowerCase();
                  return (
                    <button
                      key={fp.id}
                      type="button"
                      onClick={() => {
                        if (colorTarget === 'both') {
                          onUpdateModule(selectedModule.id, {
                            facadeColor: fp.hex,
                            bodyColor: fp.hex,
                          });
                        } else if (colorTarget === 'facade') {
                          onUpdateModule(selectedModule.id, { facadeColor: fp.hex });
                        } else {
                          onUpdateModule(selectedModule.id, { bodyColor: fp.hex });
                        }
                      }}
                      title={fp.name}
                      className={`flex flex-col items-center gap-1 p-1.5 rounded-lg border text-[10px] transition-all cursor-pointer ${
                        isActive
                          ? 'border-amber-500 bg-amber-500/10 text-white font-semibold'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <span
                        className="w-6 h-6 rounded-full border border-black/20 shadow-inner"
                        style={{ backgroundColor: fp.hex }}
                      />
                      <span className="truncate w-full text-center">
                        {fp.name.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Module Actions: Duplicate or Delete */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => onDuplicateModule(selectedModule.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-sky-400" />
                <span>Nusxalash</span>
              </button>
              <button
                type="button"
                onClick={() => onDeleteModule(selectedModule.id)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-rose-950/60 hover:bg-rose-900/70 text-rose-300 border border-rose-800/50 font-medium transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>O&apos;chirish</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Unified Collapsible Bottom Control Dock (Zero Viewport Occlusion) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex flex-col items-center max-w-[95vw] w-auto">
        <button
          type="button"
          onClick={() => setDockCollapsed((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-t-lg bg-slate-900 border border-b-0 border-slate-800 text-[11px] font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          {dockCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Boshqaruv panelini ochish</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Panelni yashirish</span>
            </>
          )}
        </button>

        {!dockCollapsed && (
          <div className="bg-slate-900/95 border border-slate-800 rounded-xl px-4 py-2.5 shadow-2xl flex flex-wrap items-center justify-center gap-3 md:gap-5 text-xs">
            {/* Exploded View Slider */}
            <label className="flex items-center gap-2.5 text-slate-200">
              <Layers className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="whitespace-nowrap font-medium">Ajratib ko&apos;rish:</span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(explodeFactor * 100)}
                onChange={(e) => onChangeExplodeFactor(Number(e.target.value) / 100)}
                aria-label="Detallarni ajratib ko'rish (Exploded View)"
                className="w-24 md:w-28 accent-amber-500 cursor-pointer"
              />
              <span className="font-mono tabular-nums text-amber-300 w-9">
                {Math.round(explodeFactor * 100)}%
              </span>
            </label>

            <div className="h-5 w-px bg-slate-800 hidden sm:block" />

            {/* Open Doors / Drawers Toggle */}
            <button
              type="button"
              onClick={onToggleDoorsOpen}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                doorsOpen
                  ? 'bg-sky-500/20 border border-sky-500/60 text-sky-300'
                  : 'bg-slate-950 border border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <DoorOpen className="w-3.5 h-3.5" />
              <span>{doorsOpen ? 'Eshiklarni yopish' : 'Eshiklarni ochish'}</span>
            </button>

            <div className="h-5 w-px bg-slate-800 hidden md:block" />

            {/* Camera View Presets */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {(
                [
                  { id: 'isometric', label: '3D Burchak' },
                  { id: 'front', label: 'Oldidan' },
                  { id: 'side', label: 'Yondan' },
                  { id: 'top', label: 'Tepadan' },
                ] as { id: CameraViewPreset; label: string }[]
              ).map((cam) => (
                <button
                  key={cam.id}
                  type="button"
                  onClick={() => onSelectCameraPreset(cam.id)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    cameraPreset === cam.id
                      ? 'bg-amber-500 text-slate-950 font-semibold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cam.label}
                </button>
              ))}
            </div>

            <div className="h-5 w-px bg-slate-800 hidden lg:block" />

            {/* Quick 0-dan / Add Module Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddModuleModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Modul qo&apos;shish</span>
              </button>

              <button
                type="button"
                onClick={onOpenNewFromScratch}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>0 dan boshlash</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Categorized Parametric Module Catalog */}
      {showAddModuleModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-module-catalog-title"
        >
          <div className="w-full max-w-3xl rounded-xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 id="add-module-catalog-title" className="text-base font-bold text-white">
                  Sahnaga Yangi Mebel Moduli Qo&apos;shish (13 xil shablon)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Kerakli modul turini tanlang — o&apos;lchamlari, raskroy detallari va taxminiy narxi avtomatik hisoblanadi
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModuleModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                aria-label="Yopish"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(
                [
                  { id: 'all', label: `Barchasi (${MODULE_TEMPLATES.length})` },
                  { id: 'oshxona', label: 'Oshxona modullari' },
                  { id: 'shkaf', label: 'Shkaf va Garderob' },
                  { id: 'ofis', label: 'Mehmonxona va Ofis' },
                ] as { id: 'all' | 'oshxona' | 'shkaf' | 'ofis'; label: string }[]
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCatalogCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    catalogCategory === cat.id
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'bg-slate-950 text-slate-300 border border-slate-800 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredTemplates.map((tpl) => (
                <button
                  key={tpl.kind}
                  type="button"
                  onClick={() => {
                    onAddModule(tpl.kind);
                    setShowAddModuleModal(false);
                    setInspectorOpen(true);
                  }}
                  className="flex flex-col justify-between text-left p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/60 transition-all group cursor-pointer"
                >
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-amber-300">
                      {tpl.title}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {tpl.subtitle}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span>
                      {tpl.defaultWidth}×{tpl.defaultHeight}×{tpl.defaultDepth}
                    </span>
                    <span className="text-amber-400 font-sans font-semibold">
                      + Qo&apos;shish
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
