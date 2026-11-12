import React, { useRef } from 'react';
import { FurnitureProject } from '../types/furniture';
import {
  createBlankProject,
  createDefaultKitchenProject,
  createWardrobeProject,
} from '../utils/raskroyEngine';
import { exportProjectToJSON } from '../utils/storage';
import {
  Check,
  Copy,
  Download,
  FolderOpen,
  PlusCircle,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';

interface ProjectsViewProps {
  projects: FurnitureProject[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onCreateProject: (proj: FurnitureProject) => void;
  onDeleteProject: (id: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as FurnitureProject;
        if (parsed && Array.isArray(parsed.modules)) {
          parsed.id = `proj_imp_${Date.now()}`;
          onCreateProject(parsed);
        }
      } catch {
        // Invalid JSON
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const activeProject =
    projects.find((p) => p.id === activeProjectId) || projects[0];

  const handleDuplicateProject = (proj: FurnitureProject) => {
    const copy: FurnitureProject = {
      ...proj,
      id: `proj_copy_${Date.now()}`,
      name: `${proj.name} (Nusxa)`,
      updatedAt: new Date().toISOString(),
    };
    onCreateProject(copy);
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-950 text-slate-100 p-3 sm:p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-5 sm:space-y-6 pb-24 md:pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 shrink-0">
              <FolderOpen className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight">
                Mening Loyihalarim
              </h1>
              <p className="text-xs md:text-sm text-slate-400 mt-0.5">
                Oflayn xotiradagi barcha mebel loyihalari, tayyor shablonlar va fayl eksporti
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 no-print">
            <button
              type="button"
              onClick={() => exportProjectToJSON(activeProject)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Saqlash (.json)</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-sky-400" />
              <span>Fayldan yuklash</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </div>
        </div>

        {/* Quick Create Templates */}
        <section className="space-y-2.5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Yangi Loyiha Yaratish
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => onCreateProject(createBlankProject(true))}
              className="flex flex-col items-start p-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-300">
                <PlusCircle className="w-4 h-4" />
                <span>0 dan Yangi Loyiha</span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-300 mt-1.5 leading-relaxed">
                1 ta bazaviy shkaf bilan 0 dan o&apos;zingiz xohlagandek yig&apos;ish
              </p>
            </button>

            <button
              type="button"
              onClick={() => {
                const p = createDefaultKitchenProject();
                p.id = `proj_kit_${Date.now()}`;
                p.name = 'Oshxona Garnituri 2.8m (Yangi)';
                onCreateProject(p);
              }}
              className="flex flex-col items-start p-4 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-sky-500/40 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <span>Oshxona Shablon (2.8m)</span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-1.5 leading-relaxed">
                Moyka, 3 tortmali blok, gaz plita va 4 ta osma shkafli to&apos;plam
              </p>
            </button>

            <button
              type="button"
              onClick={() => onCreateProject(createWardrobeProject())}
              className="flex flex-col items-start p-4 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Shkaf-Kupe va Komod</span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 mt-1.5 leading-relaxed">
                Yotoqxona uchun 2 eshikli baland garderob va 4 tortmali komod
              </p>
            </button>
          </div>
        </section>

        {/* Saved Projects List */}
        <section className="space-y-2.5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Qurilmada Saqlangan Loyihalar ({projects.length} ta)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {projects.map((p) => {
              const isCurrent = p.id === activeProjectId;
              const updatedLabel = (() => {
                try {
                  return new Date(p.updatedAt).toLocaleDateString('uz-UZ', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                } catch {
                  return '';
                }
              })();

              return (
                <div
                  key={p.id}
                  className={`flex flex-col justify-between p-4 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-slate-900 border-amber-500/60 shadow-lg shadow-amber-500/5'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectProject(p.id)}
                    className="text-left w-full cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-sm text-white group-hover:text-amber-300 transition-colors">
                        {p.name}
                      </div>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/40 text-[10px] font-semibold text-amber-300 shrink-0">
                          <Check className="w-3 h-3" />
                          <span>Faol</span>
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400 mt-2 font-mono tabular-nums">
                      <span className="text-amber-300">{p.modules.length} modul</span>
                      <span>·</span>
                      <span className="text-sky-300">{p.customParts.length} maxsus detal</span>
                      {updatedLabel && (
                        <>
                          <span>·</span>
                          <span className="text-slate-500 text-[11px]">{updatedLabel}</span>
                        </>
                      )}
                    </div>
                  </button>

                  <div className="flex items-center justify-between gap-2 mt-3.5 pt-3 border-t border-slate-800/80 text-xs">
                    <button
                      type="button"
                      onClick={() => onSelectProject(p.id)}
                      className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                          : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      {isCurrent ? '3D Sahnada Ochish' : 'Tanlash'}
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDuplicateProject(p)}
                        title="Loyihadan nusxa olish"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-300 hover:bg-slate-800 cursor-pointer"
                        aria-label={`${p.name} loyihasidan nusxa olish`}
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      {projects.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onDeleteProject(p.id)}
                          title="Loyihani o'chirish"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 cursor-pointer"
                          aria-label={`${p.name} loyihasini o'chirish`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};
