import React, { useEffect, useState } from 'react';
import {
  BOMSummary,
  CustomPart,
  FurnitureModule,
  FurnitureProject,
  Generated3DBoard,
  ModuleKind,
  PartOverride,
} from '../types/furniture';
import { formatUZS } from '../utils/storage';
import { CameraViewPreset } from './Viewport3D';
import { ModuleInspector } from './ModuleInspector';
import { PartInspector } from './PartInspector';
import { ModuleCatalogModal } from './ModuleCatalogModal';
import { CustomPartModal } from './CustomPartModal';
import {
  Box,
  Camera,
  ChevronDown,
  ChevronUp,
  DoorOpen,
  Layers,
  Maximize2,
  Minimize2,
  Plus,
  Sliders,
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
  onResetOverride: (boardId: string) => void;
  onAddCustomPart: (part: CustomPart) => void;
  onUpdateCustomPart: (customPartId: string, patch: Partial<CustomPart>) => void;
  onDeleteCustomPart: (customPartId: string) => void;
  explodeFactor: number;
  onChangeExplodeFactor: (val: number) => void;
  doorsOpen: boolean;
  onToggleDoorsOpen: () => void;
  cameraPreset: CameraViewPreset;
  onSelectCameraPreset: (preset: CameraViewPreset) => void;
  onOpenNewFromScratch: () => void;
  onOpenSmetaTab: () => void;
}

const CAMERA_ORDER: CameraViewPreset[] = ['isometric', 'front', 'side', 'top'];
const CAMERA_LABELS: Record<CameraViewPreset, string> = {
  isometric: '3D',
  front: 'Old',
  side: 'Yon',
  top: 'Tepa',
};

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
  onResetOverride,
  onAddCustomPart,
  onUpdateCustomPart,
  onDeleteCustomPart,
  explodeFactor,
  onChangeExplodeFactor,
  doorsOpen,
  onToggleDoorsOpen,
  cameraPreset,
  onSelectCameraPreset,
  onOpenNewFromScratch,
  onOpenSmetaTab,
}) => {
  // Desktop independent drawers: Modullar (left) & Detallar (right)
  const [modulesOpenDesktop, setModulesOpenDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false,
  );
  const [partsOpenDesktop, setPartsOpenDesktop] = useState(false);
  const [dockCollapsed, setDockCollapsed] = useState(false);

  // Mobile clean sheet state: null | 'modules' | 'parts'
  const [mobileSheet, setMobileSheet] = useState<'modules' | 'parts' | null>(null);
  const [mobileSheetExpanded, setMobileSheetExpanded] = useState(false);

  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [showAddCustomPartModal, setShowAddCustomPartModal] = useState(false);

  // When a specific board (especially a custom part) is clicked in 3D, auto-open Detallar on desktop if closed
  useEffect(() => {
    if (selectedBoardId) {
      if (selectedBoardId.startsWith('custom:')) {
        setPartsOpenDesktop(true);
        if (mobileSheet === 'modules') setMobileSheet('parts');
      }
    }
  }, [selectedBoardId]);

  const selectedModule =
    project.modules.find((m) => m.id === selectedModuleId) ||
    project.modules[0] ||
    null;

  const cycleCamera = () => {
    const idx = CAMERA_ORDER.indexOf(cameraPreset);
    onSelectCameraPreset(CAMERA_ORDER[(idx + 1) % CAMERA_ORDER.length]);
  };

  return (
    <>
      {/* ==================== DESKTOP TOP-LEFT HUD STRIP ==================== */}
      <div className="hidden md:flex absolute top-3 left-3 z-20 pointer-events-auto flex-wrap items-center gap-2 bg-slate-900/95 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 shadow-lg">
        <span className="font-semibold text-white truncate max-w-[180px]">
          {project.name}
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

        {/* Separate Modules Manager Toggle */}
        <button
          type="button"
          onClick={() => setModulesOpenDesktop((v) => !v)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
            modulesOpenDesktop
              ? 'bg-amber-500 text-slate-950'
              : 'bg-slate-800 hover:bg-slate-700 text-amber-300'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Modullar ({project.modules.length})</span>
        </button>

        {/* Separate Parts / Details Manager Toggle */}
        <button
          type="button"
          onClick={() => setPartsOpenDesktop((v) => !v)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
            partsOpenDesktop
              ? 'bg-sky-500 text-slate-950'
              : 'bg-slate-800 hover:bg-slate-700 text-sky-300'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Detallar ({boards.length})</span>
        </button>
      </div>

      {/* ==================== MOBILE TOP COMPACT STRIP ==================== */}
      <div className="md:hidden absolute top-2 left-2 right-2 z-20 pointer-events-none flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onOpenSmetaTab}
          className="pointer-events-auto flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-full px-3 py-1.5 text-[11px] shadow-lg cursor-pointer"
        >
          <span className="font-mono text-amber-300 font-semibold">
            {project.modules.length}m · {boards.length}d
          </span>
          <span className="text-slate-600">·</span>
          <span className="font-mono font-bold text-emerald-300">
            ~{formatUZS(bom.grandTotalCost)}
          </span>
        </button>

        <div className="pointer-events-auto flex items-center gap-1 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-full p-1 shadow-lg">
          <button
            type="button"
            onClick={onToggleDoorsOpen}
            aria-label={doorsOpen ? 'Eshiklarni yopish' : 'Eshiklarni ochish'}
            title={doorsOpen ? 'Eshiklarni yopish' : 'Eshiklarni ochish'}
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              doorsOpen ? 'bg-sky-500 text-slate-950' : 'text-slate-300 hover:text-white'
            }`}
          >
            <DoorOpen className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onChangeExplodeFactor(explodeFactor > 0.1 ? 0 : 0.65)}
            aria-label="Detallarni ajratib ko'rish"
            title="Ajratib ko'rish"
            className={`p-1.5 rounded-full transition-colors cursor-pointer ${
              explodeFactor > 0.1
                ? 'bg-amber-500 text-slate-950'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={cycleCamera}
            aria-label="Kamerani almashtirish"
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-800 text-[10px] font-semibold text-slate-200 cursor-pointer"
          >
            <Camera className="w-3 h-3 text-amber-400" />
            <span>{CAMERA_LABELS[cameraPreset]}</span>
          </button>
        </div>
      </div>

      {/* ==================== EMPTY PROJECT OVERLAY ==================== */}
      {project.modules.length === 0 && project.customParts.length === 0 && (
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center p-4">
          <div className="pointer-events-auto max-w-md w-full bg-slate-900/95 border border-slate-800 rounded-2xl p-5 sm:p-6 text-center shadow-2xl space-y-4">
            <Box className="w-10 h-10 text-amber-400 mx-auto" />
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                0 dan Yangi Mebel Loyihasi
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Tayyor modullardan qo&apos;shing yoki alohida detallarni 0 dan 3D sahnaga joylashtiring.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddModuleModal(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Modul Qo&apos;shish</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAddCustomPartModal(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Alohida Detal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== DESKTOP LEFT DRAWER: MODULLAR BOSHQARUVI ==================== */}
      {modulesOpenDesktop && (
        <aside
          aria-label="Modullar Boshqaruvi"
          className="hidden md:flex absolute top-14 left-3 bottom-22 z-30 w-90 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl flex-col overflow-hidden pointer-events-auto"
        >
          <div className="px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70 shrink-0">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">
                Modullar Boshqaruvi
              </span>
            </div>
            <button
              type="button"
              onClick={() => setModulesOpenDesktop(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              aria-label="Modullar panelini yopish"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 min-h-0">
            <ModuleInspector
              project={project}
              bom={bom}
              selectedModule={selectedModule}
              onSelectModule={(mId) => onSelectPart(null, mId)}
              onUpdateModule={onUpdateModule}
              onApplyToAllModules={onApplyToAllModules}
              onAutoPackModules={onAutoPackModules}
              onOpenAddModuleModal={() => setShowAddModuleModal(true)}
              onDuplicateModule={onDuplicateModule}
              onDeleteModule={onDeleteModule}
              onOpenSmetaTab={onOpenSmetaTab}
            />
          </div>
        </aside>
      )}

      {/* ==================== DESKTOP RIGHT DRAWER: DETALLAR BOSHQARUVI ==================== */}
      {partsOpenDesktop && (
        <aside
          aria-label="Detallar Boshqaruvi"
          className="hidden md:flex absolute top-14 right-3 bottom-22 z-30 w-90 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl shadow-2xl flex-col overflow-hidden pointer-events-auto"
        >
          <div className="px-3.5 py-2.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70 shrink-0">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold text-white">
                Detallar Boshqaruvi
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPartsOpenDesktop(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              aria-label="Detallar panelini yopish"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 min-h-0">
            <PartInspector
              project={project}
              boards={boards}
              selectedBoardId={selectedBoardId}
              selectedModuleId={selectedModuleId}
              onSelectBoard={(bId, mId) => onSelectPart(bId, mId)}
              onUpdateOverride={onUpdateOverride}
              onResetOverride={onResetOverride}
              onUpdateCustomPart={onUpdateCustomPart}
              onDeleteCustomPart={onDeleteCustomPart}
              onOpenAddCustomPartModal={() => setShowAddCustomPartModal(true)}
            />
          </div>
        </aside>
      )}

      {/* ==================== DESKTOP BOTTOM 3D VIEW CONTROLS DOCK ==================== */}
      <div className="hidden md:flex fixed bottom-3.5 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex-col items-center max-w-[95vw]">
        <button
          type="button"
          onClick={() => setDockCollapsed((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-t-lg bg-slate-900 border border-b-0 border-slate-800 text-[11px] font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          {dockCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
              <span>3D Boshqaruv</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Yashirish</span>
            </>
          )}
        </button>

        {!dockCollapsed && (
          <div className="bg-slate-900/95 border border-slate-800 rounded-xl px-4 py-2 shadow-2xl flex items-center justify-center gap-4 text-xs">
            <label className="flex items-center gap-2 text-slate-200">
              <Layers className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="whitespace-nowrap font-medium">Ajratish:</span>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(explodeFactor * 100)}
                onChange={(e) => onChangeExplodeFactor(Number(e.target.value) / 100)}
                aria-label="Detallarni ajratib ko'rish"
                className="w-24 accent-amber-500 cursor-pointer"
              />
              <span className="font-mono tabular-nums text-amber-300 w-8">
                {Math.round(explodeFactor * 100)}%
              </span>
            </label>

            <div className="h-5 w-px bg-slate-800" />

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
              <span>{doorsOpen ? 'Yopish' : 'Eshik ochish'}</span>
            </button>

            <div className="h-5 w-px bg-slate-800" />

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

            <div className="h-5 w-px bg-slate-800" />

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddModuleModal(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Modul</span>
              </button>

              <button
                type="button"
                onClick={onOpenNewFromScratch}
                className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 font-medium whitespace-nowrap shrink-0 cursor-pointer"
              >
                0 dan
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ==================== MOBILE FLOATING ACTION PILLS (ABOVE BOTTOM MENU) ==================== */}
      {mobileSheet === null && (
        <div className="md:hidden fixed bottom-[72px] inset-x-0 z-20 px-3 flex items-center justify-center gap-2 pointer-events-none">
          <button
            type="button"
            onClick={() => setShowAddModuleModal(true)}
            className="pointer-events-auto flex items-center gap-1 px-3.5 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-xl cursor-pointer active:scale-95 transition-transform"
          >
            <Plus className="w-4 h-4" />
            <span>Modul</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileSheet('modules')}
            className="pointer-events-auto flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-slate-900/95 backdrop-blur-md border border-slate-700 text-amber-300 text-xs font-semibold shadow-xl cursor-pointer active:scale-95 transition-transform"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Modullar ({project.modules.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileSheet('parts')}
            className="pointer-events-auto flex items-center gap-1.5 px-3.5 py-2.5 rounded-full bg-slate-900/95 backdrop-blur-md border border-slate-700 text-sky-300 text-xs font-semibold shadow-xl cursor-pointer active:scale-95 transition-transform"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Detallar ({boards.length})</span>
          </button>
        </div>
      )}

      {/* ==================== MOBILE BOTTOM SHEET (SEPARATE MODULLAR / DETALLAR) ==================== */}
      {mobileSheet !== null && (
        <section
          aria-label={mobileSheet === 'modules' ? 'Modullar Boshqaruvi' : 'Detallar Boshqaruvi'}
          className={`md:hidden fixed inset-x-0 bottom-[64px] z-30 bg-slate-900/98 backdrop-blur-lg border-t border-slate-700/80 rounded-t-2xl shadow-[0_-12px_40px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden transition-all duration-200 ${
            mobileSheetExpanded ? 'h-[76vh]' : 'h-[47vh]'
          }`}
        >
          {/* Sheet Header with Separate Mode Switcher */}
          <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between gap-2 bg-slate-950/70 shrink-0">
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setMobileSheet('modules')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer ${
                  mobileSheet === 'modules'
                    ? 'bg-amber-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3 h-3" />
                <span>Modullar</span>
              </button>
              <button
                type="button"
                onClick={() => setMobileSheet('parts')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer ${
                  mobileSheet === 'parts'
                    ? 'bg-sky-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Detallar</span>
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMobileSheetExpanded((v) => !v)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                aria-label={mobileSheetExpanded ? 'Kichraytirish' : 'Kattalashtirish'}
              >
                {mobileSheetExpanded ? (
                  <Minimize2 className="w-3.5 h-3.5" />
                ) : (
                  <Maximize2 className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setMobileSheet(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                aria-label="Panelni yopish"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            {mobileSheet === 'modules' ? (
              <ModuleInspector
                project={project}
                bom={bom}
                selectedModule={selectedModule}
                onSelectModule={(mId) => onSelectPart(null, mId)}
                onUpdateModule={onUpdateModule}
                onApplyToAllModules={onApplyToAllModules}
                onAutoPackModules={onAutoPackModules}
                onOpenAddModuleModal={() => setShowAddModuleModal(true)}
                onDuplicateModule={onDuplicateModule}
                onDeleteModule={onDeleteModule}
                onOpenSmetaTab={onOpenSmetaTab}
              />
            ) : (
              <PartInspector
                project={project}
                boards={boards}
                selectedBoardId={selectedBoardId}
                selectedModuleId={selectedModuleId}
                onSelectBoard={(bId, mId) => onSelectPart(bId, mId)}
                onUpdateOverride={onUpdateOverride}
                onResetOverride={onResetOverride}
                onUpdateCustomPart={onUpdateCustomPart}
                onDeleteCustomPart={onDeleteCustomPart}
                onOpenAddCustomPartModal={() => setShowAddCustomPartModal(true)}
              />
            )}
          </div>
        </section>
      )}

      {/* ==================== MODALS ==================== */}
      <ModuleCatalogModal
        isOpen={showAddModuleModal}
        onClose={() => setShowAddModuleModal(false)}
        onSelectTemplate={(kind) => {
          onAddModule(kind);
          if (typeof window !== 'undefined' && window.innerWidth >= 768) {
            setModulesOpenDesktop(true);
          } else {
            setMobileSheet('modules');
          }
        }}
      />

      <CustomPartModal
        isOpen={showAddCustomPartModal}
        onClose={() => setShowAddCustomPartModal(false)}
        onAddCustomPart={onAddCustomPart}
      />
    </>
  );
};
