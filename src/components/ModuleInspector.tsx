import React, { useState } from 'react';
import {
  BackPanelType,
  BOMSummary,
  BottomPanelType,
  FacadeStyle,
  FurnitureModule,
  FurnitureProject,
  HandleStyle,
  MaterialId,
  ModuleKind,
  TopPanelType,
} from '../types/furniture';
import {
  FINISH_PRESETS,
  MATERIAL_SPECS,
  MODULE_TEMPLATES,
} from '../utils/raskroyEngine';
import { formatUZS } from '../utils/storage';
import {
  AlignHorizontalSpaceAround,
  ArrowLeft,
  ArrowRight,
  Box,
  Check,
  Copy,
  Layers,
  Minus,
  Palette,
  Plus,
  RotateCw,
  Ruler,
  Sliders,
  Sparkles,
  Trash2,
} from 'lucide-react';

interface ModuleInspectorProps {
  project: FurnitureProject;
  bom: BOMSummary;
  selectedModule: FurnitureModule | null;
  onSelectModule: (moduleId: string) => void;
  onUpdateModule: (moduleId: string, patch: Partial<FurnitureModule>) => void;
  onApplyToAllModules: (patch: Partial<FurnitureModule>) => void;
  onAutoPackModules: () => void;
  onOpenAddModuleModal: () => void;
  onDuplicateModule: (moduleId: string) => void;
  onDeleteModule: (moduleId: string) => void;
  onOpenSmetaTab: () => void;
}

type ModuleSubTab = 'size' | 'structure' | 'corpus' | 'finish';

const QUICK_WIDTHS = [300, 400, 450, 600, 800, 900, 1000, 1200];

export const ModuleInspector: React.FC<ModuleInspectorProps> = ({
  project,
  bom,
  selectedModule,
  onSelectModule,
  onUpdateModule,
  onApplyToAllModules,
  onAutoPackModules,
  onOpenAddModuleModal,
  onDuplicateModule,
  onDeleteModule,
  onOpenSmetaTab,
}) => {
  const [subTab, setSubTab] = useState<ModuleSubTab>('size');
  const [colorTarget, setColorTarget] = useState<'both' | 'facade' | 'body' | 'countertop'>('both');
  const [appliedAllNotice, setAppliedAllNotice] = useState(false);

  if (!selectedModule) {
    return (
      <div className="p-4 text-center space-y-3 text-xs">
        <Box className="w-8 h-8 text-amber-400 mx-auto" />
        <p className="text-slate-300">
          Loyihada hozircha modul yo&apos;q. Yangi modul qo&apos;shib boshlang.
        </p>
        <button
          type="button"
          onClick={onOpenAddModuleModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Modul qo&apos;shish</span>
        </button>
      </div>
    );
  }

  const selectedModuleCost =
    bom.moduleCosts.find((mc) => mc.moduleId === selectedModule.id) || null;

  const activeDividerCount =
    selectedModule.dividerCount !== undefined
      ? selectedModule.dividerCount
      : selectedModule.centerDivider
      ? 1
      : 0;

  const activeTopType: TopPanelType =
    selectedModule.topPanelType ??
    (selectedModule.kind === 'yozuv_stoli'
      ? 'none'
      : selectedModule.kind === 'pastki_moyka' ||
        selectedModule.kind === 'pastki_plita' ||
        selectedModule.kind === 'pastki_duxovka'
      ? 'tsarga'
      : 'full');

  const activeBottomType: BottomPanelType =
    selectedModule.bottomPanelType ??
    (selectedModule.kind === 'yozuv_stoli' ? 'none' : 'full');

  const activeBackType: BackPanelType = selectedModule.backPanelType ?? 'overlay_xdf';
  const activeFacadeStyle: FacadeStyle = selectedModule.facadeStyle ?? 'overlay';
  const activeHandleStyle: HandleStyle = selectedModule.handleStyle ?? 'bar';
  const activeRotation = selectedModule.rotationY ?? 0;

  const activeColorHex =
    colorTarget === 'body'
      ? selectedModule.bodyColor
      : colorTarget === 'countertop'
      ? selectedModule.countertopColor
      : selectedModule.facadeColor;

  const applyColorHex = (hex: string) => {
    if (colorTarget === 'both') {
      onUpdateModule(selectedModule.id, { facadeColor: hex, bodyColor: hex });
    } else if (colorTarget === 'facade') {
      onUpdateModule(selectedModule.id, { facadeColor: hex });
    } else if (colorTarget === 'body') {
      onUpdateModule(selectedModule.id, { bodyColor: hex });
    } else {
      onUpdateModule(selectedModule.id, { countertopColor: hex, hasCountertop: true });
    }
  };

  return (
    <div className="flex flex-col h-full text-xs">
      {/* Top Module Switcher & Cost Strip */}
      <div className="p-3 border-b border-slate-800/90 space-y-2.5 bg-slate-950/40 shrink-0">
        <div className="flex items-center gap-1.5">
          <select
            aria-label="Tanlangan modul"
            value={selectedModule.id}
            onChange={(e) => onSelectModule(e.target.value)}
            className="flex-1 min-w-0 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-2 text-xs font-semibold text-white focus:outline-none focus:border-amber-500"
          >
            {project.modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.width}×{m.height}×{m.depth})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onOpenAddModuleModal}
            title="Yangi modul qo'shish"
            className="flex items-center gap-1 px-2.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Yangi</span>
          </button>
        </div>

        {/* Compact Cost + Quick Actions Row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono tabular-nums font-bold text-emerald-300">
              {selectedModuleCost ? formatUZS(selectedModuleCost.estimatedTotal) : '—'}
            </span>
            {selectedModuleCost && (
              <button
                type="button"
                onClick={onOpenSmetaTab}
                className="text-[11px] text-slate-400 hover:text-amber-300 underline truncate cursor-pointer"
              >
                {selectedModuleCost.partsCount} detal · {selectedModuleCost.areaM2} m²
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onDuplicateModule(selectedModule.id)}
              title="Modulni nusxalash"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 cursor-pointer"
              aria-label="Modulni nusxalash"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDeleteModule(selectedModule.id)}
              title="Modulni o'chirish"
              className="p-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/40 cursor-pointer"
              aria-label="Modulni o'chirish"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4 Clean Sub-Tabs */}
        <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {(
            [
              { id: 'size', label: "O'lcham", icon: <Ruler className="w-3 h-3" /> },
              { id: 'structure', label: 'Tuzilma', icon: <Sliders className="w-3 h-3" /> },
              { id: 'corpus', label: 'Korpus', icon: <Layers className="w-3 h-3" /> },
              { id: 'finish', label: 'Rang', icon: <Palette className="w-3 h-3" /> },
            ] as { id: ModuleSubTab; label: string; icon: React.ReactNode }[]
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setSubTab(t.id)}
              className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                subTab === t.id
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {/* TAB 1: DIMENSIONS, TYPE & POSITION */}
        {subTab === 'size' && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="space-y-1">
                <span className="text-[11px] text-slate-400">Modul nomi:</span>
                <input
                  type="text"
                  value={selectedModule.name}
                  onChange={(e) =>
                    onUpdateModule(selectedModule.id, { name: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[11px] text-slate-400">Modul vazifasi / turi:</span>
                <select
                  value={selectedModule.kind}
                  onChange={(e) => {
                    const k = e.target.value as ModuleKind;
                    onUpdateModule(selectedModule.id, { kind: k });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  {MODULE_TEMPLATES.map((tpl) => (
                    <option key={tpl.kind} value={tpl.kind}>
                      {tpl.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Quick Standard Widths */}
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400">Tezkor eni (mm):</span>
              <div className="grid grid-cols-4 gap-1">
                {QUICK_WIDTHS.map((wVal) => (
                  <button
                    key={wVal}
                    type="button"
                    onClick={() => onUpdateModule(selectedModule.id, { width: wVal })}
                    className={`py-1.5 rounded font-mono text-[11px] border transition-colors cursor-pointer ${
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

            {/* W x H x D Numeric + Sliders */}
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

            {/* Position & 3D Rotation */}
            <div className="space-y-2.5 pt-2.5 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">
                  Joylashuvi (X, Y, Z) va Burish
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
                  onClick={() =>
                    onUpdateModule(selectedModule.id, {
                      x: Math.max(0, selectedModule.x - 100),
                    })
                  }
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>-10 sm</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateModule(selectedModule.id, {
                      x: selectedModule.x + 100,
                    })
                  }
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-slate-300 cursor-pointer"
                >
                  <span>+10 sm</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateModule(selectedModule.id, {
                      rotationY: (((activeRotation + 90) % 360) as 0 | 90 | 180 | 270),
                    })
                  }
                  title="Modulni 90° burish (burchak oshxona uchun)"
                  className="flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[11px] text-amber-300 font-mono cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{activeRotation}°</span>
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
                  <span className="text-[11px] text-slate-400">Devordan Z</span>
                  <input
                    type="number"
                    step={50}
                    min={0}
                    max={4000}
                    value={selectedModule.z}
                    onChange={(e) =>
                      onUpdateModule(selectedModule.id, {
                        z: Math.max(0, Number(e.target.value) || 0),
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 font-mono tabular-nums text-slate-200"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STRUCTURE (COMBINED DOORS + DRAWERS + DIVIDERS + SHELVES + HANDLES) */}
        {subTab === 'structure' && (
          <div className="space-y-3.5">
            {/* Doors Count 0..3 */}
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400">
                Fasad eshiklari (tortma bilan birga ham qo&apos;llash mumkin):
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {([0, 1, 2, 3] as (0 | 1 | 2 | 3)[]).map((dc) => (
                  <button
                    key={dc}
                    type="button"
                    onClick={() => onUpdateModule(selectedModule.id, { doorCount: dc })}
                    className={`py-1.5 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer ${
                      selectedModule.doorCount === dc
                        ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {dc === 0 ? 'Yo\'q' : `${dc} eshik`}
                  </button>
                ))}
              </div>
            </div>

            {/* 1-Door Hinge Direction */}
            {selectedModule.doorCount === 1 && (
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400">1-eshik ochilish tomoni:</span>
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
                        className={`py-1.5 rounded-lg border text-[11px] transition-colors cursor-pointer ${
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

            {/* Drawers Count 0..4 */}
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400">Tortmalar soni (Teleskopik):</span>
              <div className="grid grid-cols-5 gap-1">
                {[0, 1, 2, 3, 4].map((dCount) => (
                  <button
                    key={dCount}
                    type="button"
                    onClick={() => onUpdateModule(selectedModule.id, { drawerCount: dCount })}
                    className={`py-1.5 rounded-lg border text-[11px] font-mono transition-colors cursor-pointer ${
                      selectedModule.drawerCount === dCount
                        ? 'bg-violet-500/25 border-violet-500 text-violet-200 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {dCount === 0 ? "Yo'q" : `${dCount} ta`}
                  </button>
                ))}
              </div>
            </div>

            {/* Combined Door + Drawer Zone Settings */}
            {selectedModule.drawerCount > 0 &&
              (selectedModule.doorCount > 0 || selectedModule.shelfCount > 0) && (
                <div className="rounded-xl bg-slate-950 border border-violet-500/30 p-2.5 space-y-2">
                  <div className="text-[11px] font-semibold text-violet-300">
                    Aralash rejim (Tortma + Eshik/Tokcha)
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(
                      [
                        { id: 'bottom', label: 'Tortmalar pastda' },
                        { id: 'top', label: 'Tortmalar tepada' },
                      ] as { id: 'bottom' | 'top'; label: string }[]
                    ).map((pos) => (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() =>
                          onUpdateModule(selectedModule.id, { drawerPosition: pos.id })
                        }
                        className={`py-1 rounded border text-[11px] cursor-pointer ${
                          (selectedModule.drawerPosition ?? 'bottom') === pos.id
                            ? 'bg-violet-500/20 border-violet-400 text-white font-semibold'
                            : 'border-slate-800 text-slate-400'
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                  <label className="block space-y-1">
                    <div className="flex justify-between text-[11px] text-slate-400">
                      <span>Tortmalar zonasi balandligi:</span>
                      <span className="font-mono text-amber-300">
                        {selectedModule.drawerZoneHeight ??
                          Math.min(
                            Math.round(selectedModule.height * 0.48),
                            Math.max(150, selectedModule.drawerCount * 165),
                          )}{' '}
                        mm
                      </span>
                    </div>
                    <input
                      type="range"
                      min={120}
                      max={Math.max(200, selectedModule.height - 180)}
                      step={20}
                      value={
                        selectedModule.drawerZoneHeight ??
                        Math.min(
                          Math.round(selectedModule.height * 0.48),
                          Math.max(150, selectedModule.drawerCount * 165),
                        )
                      }
                      onChange={(e) =>
                        onUpdateModule(selectedModule.id, {
                          drawerZoneHeight: Number(e.target.value),
                        })
                      }
                      className="w-full accent-violet-500 cursor-pointer"
                    />
                  </label>
                </div>
              )}

            {/* Internal Shelves & Vertical Dividers */}
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

              <div className="space-y-1">
                <span className="text-[11px] text-slate-400">Vertikal to&apos;siqlar:</span>
                <div className="grid grid-cols-3 gap-1">
                  {([0, 1, 2] as (0 | 1 | 2)[]).map((dc) => (
                    <button
                      key={dc}
                      type="button"
                      onClick={() =>
                        onUpdateModule(selectedModule.id, {
                          dividerCount: dc,
                          centerDivider: dc > 0,
                        })
                      }
                      className={`py-1.5 rounded-lg border text-[11px] font-mono cursor-pointer ${
                        activeDividerCount === dc
                          ? 'bg-teal-500/20 border-teal-500 text-teal-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {dc === 0 ? '1 bo\'lim' : `${dc + 1}x`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Facade Style & Handle Style */}
            <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-800/80">
              <label className="space-y-1">
                <span className="text-[11px] text-slate-400">Fasad joylashuvi:</span>
                <select
                  value={activeFacadeStyle}
                  onChange={(e) =>
                    onUpdateModule(selectedModule.id, {
                      facadeStyle: e.target.value as FacadeStyle,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-200"
                >
                  <option value="overlay">Ustki (Nakladnoy)</option>
                  <option value="inset">Ichki (Vkladnoy)</option>
                  <option value="vitrine">Oynali Vitrina</option>
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-[11px] text-slate-400">Tutqich (Ruchka):</span>
                <select
                  value={activeHandleStyle}
                  onChange={(e) =>
                    onUpdateModule(selectedModule.id, {
                      handleStyle: e.target.value as HandleStyle,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-200"
                >
                  <option value="bar">Skoba (Xrom)</option>
                  <option value="profile">Profil (Qora)</option>
                  <option value="knob">Tugma (Knopka)</option>
                  <option value="none">Tutqichsiz (Push)</option>
                </select>
              </label>
            </div>
          </div>
        )}

        {/* TAB 3: CORPUS & HARDWARE CONSTRUCTION */}
        {subTab === 'corpus' && (
          <div className="space-y-3.5">
            <div className="grid grid-cols-2 gap-2.5">
              <label className="space-y-1">
                <span className="text-[11px] text-slate-400">Korpus Plita Qalinligi:</span>
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
                  <option value={16}>16 mm (Standart)</option>
                  <option value={18}>18 mm (Qalin)</option>
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-[11px] text-slate-400">Oyoqcha balandligi (mm):</span>
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
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 font-mono tabular-nums text-slate-200"
                />
              </label>
            </div>

            {/* Top & Bottom Panel Types */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400">Ustki qism konstruksiyasi:</span>
              <div className="grid grid-cols-3 gap-1.5">
                {(
                  [
                    { id: 'full', label: "To'liq qopqoq" },
                    { id: 'tsarga', label: '2 ta Tsarga' },
                    { id: 'none', label: "Ustkisiz" },
                  ] as { id: TopPanelType; label: string }[]
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      onUpdateModule(selectedModule.id, { topPanelType: opt.id })
                    }
                    className={`py-1.5 rounded-lg border text-[11px] cursor-pointer ${
                      activeTopType === opt.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400">Ostki qism (Taglik):</span>
              <div className="grid grid-cols-2 gap-1.5">
                {(
                  [
                    { id: 'full', label: "To'liq taglik (Gorizont)" },
                    { id: 'none', label: "Tagliksiz (Stol/Texnika)" },
                  ] as { id: BottomPanelType; label: string }[]
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      onUpdateModule(selectedModule.id, { bottomPanelType: opt.id })
                    }
                    className={`py-1.5 rounded-lg border text-[11px] cursor-pointer ${
                      activeBottomType === opt.id
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Back Panel Configuration */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400">Orqa devor (XDF / LDSP):</span>
              <div className="grid grid-cols-4 gap-1">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateModule(selectedModule.id, { hasBackPanel: false })
                  }
                  className={`py-1.5 rounded-lg border text-[10px] cursor-pointer ${
                    !selectedModule.hasBackPanel
                      ? 'bg-rose-500/20 border-rose-500 text-rose-300 font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  Yo&apos;q
                </button>
                {(
                  [
                    { id: 'overlay_xdf', label: 'XDF Ustidan' },
                    { id: 'inset_xdf', label: 'XDF Pazda' },
                    { id: 'ldsp', label: 'LDSP 16mm' },
                  ] as { id: BackPanelType; label: string }[]
                ).map((bp) => (
                  <button
                    key={bp.id}
                    type="button"
                    onClick={() =>
                      onUpdateModule(selectedModule.id, {
                        hasBackPanel: true,
                        backPanelType: bp.id,
                      })
                    }
                    className={`py-1.5 rounded-lg border text-[10px] cursor-pointer ${
                      selectedModule.hasBackPanel && activeBackType === bp.id
                        ? 'bg-sky-500/20 border-sky-500 text-sky-300 font-semibold'
                        : 'bg-slate-950 border-slate-800 text-slate-400'
                    }`}
                  >
                    {bp.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Countertop & Extras */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="grid grid-cols-1 gap-2">
                <label className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
                  <span className="text-slate-200 font-medium">
                    Stoleshnitsa (Stol usti)
                  </span>
                  <input
                    type="checkbox"
                    checked={selectedModule.hasCountertop}
                    onChange={(e) =>
                      onUpdateModule(selectedModule.id, {
                        hasCountertop: e.target.checked,
                        countertopThickness: e.target.checked
                          ? selectedModule.countertopThickness || 38
                          : 0,
                        countertopOverhangFront: e.target.checked
                          ? selectedModule.countertopOverhangFront || 40
                          : 0,
                      })
                    }
                    className="rounded border-slate-700 bg-slate-900 text-amber-500"
                  />
                </label>

                {selectedModule.hasCountertop && (
                  <div className="grid grid-cols-2 gap-2 px-1">
                    <label className="space-y-1">
                      <span className="text-[11px] text-slate-400">Qalinligi (mm):</span>
                      <input
                        type="number"
                        min={16}
                        max={60}
                        value={selectedModule.countertopThickness || 38}
                        onChange={(e) =>
                          onUpdateModule(selectedModule.id, {
                            countertopThickness: Math.max(16, Number(e.target.value) || 38),
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 font-mono text-amber-300"
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-[11px] text-slate-400">Oldinga chiqishi (mm):</span>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={selectedModule.countertopOverhangFront ?? 40}
                        onChange={(e) =>
                          onUpdateModule(selectedModule.id, {
                            countertopOverhangFront: Math.max(0, Number(e.target.value) || 0),
                          })
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 font-mono text-sky-300"
                      />
                    </label>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
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
                    <span className="text-[11px] text-slate-200">Old tsokol plankasi</span>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
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
                    <span className="text-[11px] text-slate-200">Kiyim ilgich truba</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: MATERIALS & FINISH COLORS */}
        {subTab === 'finish' && (
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-200">Material va Ranglar</span>
              <button
                type="button"
                onClick={() => {
                  onApplyToAllModules({
                    facadeColor: selectedModule.facadeColor,
                    bodyColor: selectedModule.bodyColor,
                    countertopColor: selectedModule.countertopColor,
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
                <span className="text-[11px] text-slate-400">Korpus Materiali:</span>
                <select
                  value={selectedModule.bodyMaterial}
                  onChange={(e) => {
                    const mat = e.target.value as MaterialId;
                    onUpdateModule(selectedModule.id, {
                      bodyMaterial: mat,
                      boardThickness: MATERIAL_SPECS[mat]?.thickness || 16,
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-200"
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

              <label className="space-y-1">
                <span className="text-[11px] text-slate-400">Fasad Materiali:</span>
                <select
                  value={selectedModule.facadeMaterial}
                  onChange={(e) =>
                    onUpdateModule(selectedModule.id, {
                      facadeMaterial: e.target.value as MaterialId,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-slate-200"
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
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400">Bo&apos;yash qismi:</span>
              <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                {(
                  [
                    { id: 'both', label: 'Ikkalasi' },
                    { id: 'facade', label: 'Fasad' },
                    { id: 'body', label: 'Korpus' },
                    { id: 'countertop', label: 'Stolesh.' },
                  ] as { id: 'both' | 'facade' | 'body' | 'countertop'; label: string }[]
                ).map((ct) => (
                  <button
                    key={ct.id}
                    type="button"
                    onClick={() => setColorTarget(ct.id)}
                    className={`py-1 rounded text-[10px] font-medium cursor-pointer ${
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

            <div className="grid grid-cols-4 gap-1.5">
              {FINISH_PRESETS.map((fp) => {
                const isActive = activeColorHex.toLowerCase() === fp.hex.toLowerCase();
                return (
                  <button
                    key={fp.id}
                    type="button"
                    onClick={() => applyColorHex(fp.hex)}
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

            <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
              <span className="text-[11px] text-slate-300">Istalgan maxsus rang:</span>
              <input
                type="color"
                value={activeColorHex}
                onChange={(e) => applyColorHex(e.target.value)}
                className="w-10 h-7 rounded bg-transparent border-0 cursor-pointer"
              />
            </label>
          </div>
        )}
      </div>
    </div>
  );
};
