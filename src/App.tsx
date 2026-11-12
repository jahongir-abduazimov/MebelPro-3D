import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import {
  CustomPart,
  FurnitureModule,
  FurnitureProject,
  MaterialPriceConfig,
  ModuleKind,
  PartOverride,
} from './types/furniture';
import {
  calculateBOMSummary,
  createBlankProject,
  decomposeProjectTo3DBoards,
  generateCutList,
  MODULE_TEMPLATES,
  nestPartsIntoSheets,
} from './utils/raskroyEngine';
import {
  loadActiveProjectId,
  loadSavedProjects,
  saveActiveProjectId,
  saveProjectsList,
} from './utils/storage';
import { CameraViewPreset, Viewport3D } from './components/Viewport3D';
import { ConstructorHUD } from './components/ConstructorHUD';
import { OfflineIndicator, PWAInstallButton } from './components/PWAInstallButton';
import { MobileBottomNav, WorkspaceTab } from './components/MobileBottomNav';

const RaskroyView = lazy(() =>
  import('./components/RaskroyView').then((m) => ({ default: m.RaskroyView })),
);
const MaterialsBOMView = lazy(() =>
  import('./components/MaterialsBOMView').then((m) => ({ default: m.MaterialsBOMView })),
);
const ProjectsView = lazy(() =>
  import('./components/ProjectsView').then((m) => ({ default: m.ProjectsView })),
);

export default function App() {
  const [projects, setProjects] = useState<FurnitureProject[]>(() => loadSavedProjects());
  const [activeProjectId, setActiveProjectId] = useState<string>(() =>
    loadActiveProjectId(projects),
  );

  const activeProject = useMemo(
    () => projects.find((p) => p.id === activeProjectId) || projects[0],
    [projects, activeProjectId],
  );

  const [activeTab, setActiveTab] = useState<WorkspaceTab>('3d');
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(
    () => activeProject?.modules[0]?.id || 'mod_base_400',
  );
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);

  // 3D Viewport interactive state
  const [explodeFactor, setExplodeFactor] = useState<number>(0);
  const [doorsOpen, setDoorsOpen] = useState<boolean>(false);
  const [cameraPreset, setCameraPreset] = useState<CameraViewPreset>('isometric');
  const [cameraTriggerCount, setCameraTriggerCount] = useState<number>(0);

  // Persist projects and activeProjectId to localStorage offline
  useEffect(() => {
    saveProjectsList(projects);
  }, [projects]);

  useEffect(() => {
    saveActiveProjectId(activeProjectId);
  }, [activeProjectId]);

  // Derived calculations: 3D Boards, Raskroy Cut-List, 2D Nesting Sheets, and BOM
  const boards = useMemo(
    () => decomposeProjectTo3DBoards(activeProject),
    [activeProject],
  );

  const cutList = useMemo(
    () => generateCutList(activeProject),
    [activeProject],
  );

  const sheets = useMemo(
    () => nestPartsIntoSheets(cutList, activeProject.sawKerf, activeProject.sheetTrim),
    [cutList, activeProject.sawKerf, activeProject.sheetTrim],
  );

  const bom = useMemo(
    () => calculateBOMSummary(activeProject, cutList, sheets),
    [activeProject, cutList, sheets],
  );

  // Project state mutators
  const updateActiveProject = (updater: (prev: FurnitureProject) => FurnitureProject) => {
    setProjects((prevList) =>
      prevList.map((p) =>
        p.id === activeProject.id
          ? { ...updater(p), updatedAt: new Date().toISOString() }
          : p,
      ),
    );
  };

  const handleUpdateModule = (moduleId: string, patch: Partial<FurnitureModule>) => {
    updateActiveProject((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => (m.id === moduleId ? { ...m, ...patch } : m)),
    }));
  };

  const handleApplyToAllModules = (patch: Partial<FurnitureModule>) => {
    updateActiveProject((prev) => ({
      ...prev,
      modules: prev.modules.map((m) => ({ ...m, ...patch })),
    }));
  };

  const handleAutoPackModules = () => {
    updateActiveProject((prev) => {
      const lowerMods = [...prev.modules.filter((m) => m.y < 1000)].sort((a, b) => a.x - b.x);
      const upperMods = [...prev.modules.filter((m) => m.y >= 1000)].sort((a, b) => a.x - b.x);

      let curXLow = 0;
      const packedLow = lowerMods.map((m) => {
        const footprintW = m.rotationY === 90 || m.rotationY === 270 ? m.depth : m.width;
        const next = { ...m, x: curXLow };
        curXLow += footprintW;
        return next;
      });

      let curXUp = 0;
      const packedUp = upperMods.map((m) => {
        const footprintW = m.rotationY === 90 || m.rotationY === 270 ? m.depth : m.width;
        const next = { ...m, x: curXUp };
        curXUp += footprintW;
        return next;
      });

      const byId = new Map<string, FurnitureModule>();
      for (const m of [...packedLow, ...packedUp]) {
        byId.set(m.id, m);
      }

      return {
        ...prev,
        modules: prev.modules.map((m) => byId.get(m.id) || m),
      };
    });
  };

  const handleAddModule = (kind: ModuleKind) => {
    const tpl = MODULE_TEMPLATES.find((t) => t.kind === kind) || MODULE_TEMPLATES[0];
    const isUpper = Boolean(tpl.isUpper);

    const sameLevelMods = activeProject.modules.filter((m) =>
      isUpper ? m.y >= 1000 : m.y < 1000,
    );
    const nextX =
      sameLevelMods.length > 0
        ? Math.max(
            ...sameLevelMods.map(
              (m) => m.x + (m.rotationY === 90 || m.rotationY === 270 ? m.depth : m.width),
            ),
          )
        : 0;

    const refMod = activeProject.modules[0];

    const newMod: FurnitureModule = {
      id: `mod_${Date.now()}`,
      name: `${activeProject.modules.length + 1}. ${tpl.title}`,
      kind: tpl.kind,
      width: tpl.defaultWidth,
      height: tpl.defaultHeight,
      depth: tpl.defaultDepth,
      x: nextX,
      y: kind === 'yuqori_vityajka' ? 1660 : isUpper ? 1420 : 0,
      z: 0,
      rotationY: 0,
      boardThickness: 16,
      bodyMaterial: refMod?.bodyMaterial || 'ldsp_16',
      facadeMaterial: refMod?.facadeMaterial || 'lmdf_16',
      bodyColor: refMod?.bodyColor || '#E5E1D8',
      facadeColor: refMod?.facadeColor || '#EAE6DF',
      countertopColor: refMod?.countertopColor || '#C6C2B9',
      hasCountertop:
        !isUpper &&
        kind !== 'shkaf_kupe' &&
        kind !== 'penal_kalonka' &&
        kind !== 'kitob_javoni',
      countertopThickness: 38,
      countertopOverhangFront: kind === 'tv_tumba' || kind === 'oyoq_kiyim' ? 20 : 40,
      legHeight:
        isUpper || kind === 'yozuv_stoli'
          ? 0
          : kind === 'tv_tumba' || kind === 'shkaf_kupe'
          ? 60
          : 100,
      doorCount:
        kind === 'pastki_tortmali' ||
        kind === 'pastki_duxovka' ||
        kind === 'yozuv_stoli' ||
        kind === 'kitob_javoni'
          ? 0
          : tpl.defaultWidth >= 750
          ? 2
          : 1,
      handleOrientation:
        kind === 'pastki_tortmali' || kind === 'pastki_duxovka' || kind === 'tv_tumba'
          ? 'horizontal'
          : 'vertical',
      drawerCount: kind === 'pastki_tortmali' ? 3 : 0,
      shelfCount:
        kind === 'kitob_javoni' || kind === 'shkaf_kupe' || kind === 'penal_kalonka'
          ? 4
          : kind === 'oyoq_kiyim'
          ? 3
          : kind === 'pastki_tortmali' ||
            kind === 'pastki_moyka' ||
            kind === 'pastki_duxovka' ||
            kind === 'yozuv_stoli'
          ? 0
          : 1,
      hasBackPanel: kind !== 'yozuv_stoli' && kind !== 'pastki_moyka',
      centerDivider: kind === 'tv_tumba' || kind === 'shkaf_kupe',
      dividerCount: kind === 'tv_tumba' || kind === 'shkaf_kupe' ? 1 : 0,
      hasClothesRod: kind === 'shkaf_kupe',
    };

    updateActiveProject((prev) => ({
      ...prev,
      modules: [...prev.modules, newMod],
    }));
    setSelectedModuleId(newMod.id);
    setSelectedBoardId(null);
  };

  const handleDuplicateModule = (moduleId: string) => {
    const src = activeProject.modules.find((m) => m.id === moduleId);
    if (!src) return;
    const isUpper = src.y >= 1000;
    const sameLevel = activeProject.modules.filter((m) =>
      isUpper ? m.y >= 1000 : m.y < 1000,
    );
    const nextX =
      sameLevel.length > 0
        ? Math.max(
            ...sameLevel.map(
              (m) => m.x + (m.rotationY === 90 || m.rotationY === 270 ? m.depth : m.width),
            ),
          )
        : 0;

    const copy: FurnitureModule = {
      ...src,
      id: `mod_${Date.now()}`,
      name: `${src.name} (Nusxa)`,
      x: nextX,
    };

    updateActiveProject((prev) => ({
      ...prev,
      modules: [...prev.modules, copy],
    }));
    setSelectedModuleId(copy.id);
    setSelectedBoardId(null);
  };

  const handleDeleteModule = (moduleId: string) => {
    updateActiveProject((prev) => {
      const remaining = prev.modules.filter((m) => m.id !== moduleId);
      setSelectedModuleId(remaining[0]?.id || null);
      setSelectedBoardId(null);
      return {
        ...prev,
        modules: remaining,
      };
    });
  };

  const handleUpdateOverride = (boardIds: string[], patch: PartOverride) => {
    updateActiveProject((prev) => {
      const nextOverrides = { ...prev.partOverrides };
      for (const bid of boardIds) {
        nextOverrides[bid] = {
          ...(nextOverrides[bid] || {}),
          ...patch,
        };
      }
      return {
        ...prev,
        partOverrides: nextOverrides,
      };
    });
  };

  const handleResetOverride = (boardId: string) => {
    updateActiveProject((prev) => {
      const nextOverrides = { ...prev.partOverrides };
      delete nextOverrides[boardId];
      return {
        ...prev,
        partOverrides: nextOverrides,
      };
    });
  };

  const handleAddCustomPart = (part: CustomPart) => {
    updateActiveProject((prev) => ({
      ...prev,
      customParts: [...prev.customParts, part],
    }));
    setSelectedBoardId(`custom:${part.id}`);
    setSelectedModuleId(`custom:${part.id}`);
  };

  const handleUpdateCustomPart = (customPartId: string, patch: Partial<CustomPart>) => {
    updateActiveProject((prev) => ({
      ...prev,
      customParts: prev.customParts.map((cp) =>
        cp.id === customPartId ? { ...cp, ...patch } : cp,
      ),
    }));
  };

  const handleDeleteCustomPart = (customPartId: string) => {
    updateActiveProject((prev) => ({
      ...prev,
      customParts: prev.customParts.filter((cp) => cp.id !== customPartId),
    }));
  };

  const handleUpdateKerfSettings = (sawKerf: number, sheetTrim: number) => {
    updateActiveProject((prev) => ({
      ...prev,
      sawKerf,
      sheetTrim,
    }));
  };

  const handleUpdatePrices = (prices: MaterialPriceConfig) => {
    updateActiveProject((prev) => ({
      ...prev,
      prices,
    }));
  };

  const handleCreateProject = (newProj: FurnitureProject) => {
    setProjects((prev) => [newProj, ...prev]);
    setActiveProjectId(newProj.id);
    setSelectedModuleId(newProj.modules[0]?.id || null);
    setSelectedBoardId(null);
  };

  const handleDeleteProject = (projId: string) => {
    setProjects((prev) => {
      const filtered = prev.filter((p) => p.id !== projId);
      if (filtered.length === 0) {
        const fallback = createBlankProject(true);
        setActiveProjectId(fallback.id);
        return [fallback];
      }
      if (activeProjectId === projId) {
        setActiveProjectId(filtered[0].id);
      }
      return filtered;
    });
  };

  return (
    <div className="flex flex-col w-screen h-dvh overflow-hidden bg-slate-950 text-slate-100">
      {/* Top Bar: Clean & Minimal on Mobile, Full 3-Zone Nav on Desktop */}
      <header className="flex items-center justify-between gap-3 md:gap-8 px-3.5 md:px-6 py-2.5 md:py-3 bg-slate-950 border-b border-slate-800 shrink-0 z-30 no-print">
        <div className="flex items-center gap-2.5 min-w-0">
          <a
            href="#konstruktor"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('3d');
            }}
            className="text-base md:text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0"
          >
            MebelPro <span className="text-amber-400">3D</span>
          </a>
          <span className="md:hidden text-[11px] text-slate-400 truncate max-w-[150px]">
            · {activeProject.name}
          </span>
        </div>

        {/* Desktop Top Navigation */}
        <nav
          aria-label="Asosiy ishchi bo'limlar"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300"
        >
          <button
            type="button"
            onClick={() => setActiveTab('3d')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === '3d'
                ? 'text-amber-400 underline underline-offset-8 decoration-2 font-semibold'
                : 'hover:text-white'
            }`}
          >
            3D Konstruktor
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('raskroy')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'raskroy'
                ? 'text-amber-400 underline underline-offset-8 decoration-2 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Raskroy ({cutList.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('materials')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'materials'
                ? 'text-amber-400 underline underline-offset-8 decoration-2 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Smeta
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('projects')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              activeTab === 'projects'
                ? 'text-amber-400 underline underline-offset-8 decoration-2 font-semibold'
                : 'hover:text-white'
            }`}
          >
            Loyihalarim ({projects.length})
          </button>
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <PWAInstallButton />
        </div>
      </header>

      {/* Main Workspace Area (clears MobileBottomNav on < md) */}
      <main className="flex-1 relative w-full h-full overflow-hidden pb-[62px] md:pb-0">
        {activeTab === '3d' && (
          <div className="w-full h-full relative">
            <Viewport3D
              project={activeProject}
              boards={boards}
              selectedModuleId={selectedModuleId}
              selectedBoardId={selectedBoardId}
              onSelectPart={(bId, mId) => {
                setSelectedBoardId(bId);
                if (mId) setSelectedModuleId(mId);
              }}
              explodeFactor={explodeFactor}
              doorsOpen={doorsOpen}
              wireframeMode={false}
              showDimensions={true}
              cameraPreset={cameraPreset}
              cameraTriggerCount={cameraTriggerCount}
            />

            <ConstructorHUD
              project={activeProject}
              boards={boards}
              bom={bom}
              selectedModuleId={selectedModuleId}
              selectedBoardId={selectedBoardId}
              onSelectPart={(bId, mId) => {
                setSelectedBoardId(bId);
                if (mId) setSelectedModuleId(mId);
              }}
              onUpdateModule={handleUpdateModule}
              onApplyToAllModules={handleApplyToAllModules}
              onAutoPackModules={handleAutoPackModules}
              onAddModule={handleAddModule}
              onDuplicateModule={handleDuplicateModule}
              onDeleteModule={handleDeleteModule}
              onUpdateOverride={handleUpdateOverride}
              onResetOverride={handleResetOverride}
              onAddCustomPart={handleAddCustomPart}
              onUpdateCustomPart={handleUpdateCustomPart}
              onDeleteCustomPart={handleDeleteCustomPart}
              explodeFactor={explodeFactor}
              onChangeExplodeFactor={setExplodeFactor}
              doorsOpen={doorsOpen}
              onToggleDoorsOpen={() => setDoorsOpen((v) => !v)}
              cameraPreset={cameraPreset}
              onSelectCameraPreset={(preset) => {
                setCameraPreset(preset);
                setCameraTriggerCount((c) => c + 1);
              }}
              onOpenNewFromScratch={() => {
                const blank = createBlankProject(true);
                handleCreateProject(blank);
              }}
              onOpenSmetaTab={() => setActiveTab('materials')}
            />
          </div>
        )}

        <Suspense
          fallback={
            <div className="w-full h-full flex items-center justify-center bg-slate-950 text-xs text-slate-400">
              Yuklanmoqda...
            </div>
          }
        >
          {activeTab === 'raskroy' && (
            <RaskroyView
              project={activeProject}
              cutList={cutList}
              sheets={sheets}
              onUpdateOverride={handleUpdateOverride}
              onAddCustomPart={handleAddCustomPart}
              onDeleteCustomPart={handleDeleteCustomPart}
              onUpdateKerfSettings={handleUpdateKerfSettings}
            />
          )}

          {activeTab === 'materials' && (
            <MaterialsBOMView
              project={activeProject}
              bom={bom}
              onUpdatePrices={handleUpdatePrices}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsView
              projects={projects}
              activeProjectId={activeProject.id}
              onSelectProject={(id) => {
                setActiveProjectId(id);
                const target = projects.find((p) => p.id === id);
                setSelectedModuleId(target?.modules[0]?.id || null);
                setSelectedBoardId(null);
                setActiveTab('3d');
              }}
              onCreateProject={(newProj) => {
                handleCreateProject(newProj);
                setActiveTab('3d');
              }}
              onDeleteProject={handleDeleteProject}
            />
          )}
        </Suspense>
      </main>

      {/* Mobile Bottom Navigation Bar (< md) */}
      <MobileBottomNav
        activeTab={activeTab}
        cutListCount={cutList.length}
        projectsCount={projects.length}
        onSelectTab={setActiveTab}
      />

      {/* Offline Banner */}
      <OfflineIndicator />
    </div>
  );
}
