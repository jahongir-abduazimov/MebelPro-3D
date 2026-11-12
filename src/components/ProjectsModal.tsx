import React, { useRef } from 'react';
import { FurnitureProject } from '../types/furniture';
import {
  createBlankProject,
  createDefaultKitchenProject,
  createWardrobeProject,
} from '../utils/raskroyEngine';
import { exportProjectToJSON } from '../utils/storage';
import {
  Download,
  FolderOpen,
  PlusCircle,
  Sparkles,
  Trash2,
  Upload,
  X,
} from 'lucide-react';

interface ProjectsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: FurnitureProject[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onCreateProject: (proj: FurnitureProject) => void;
  onDeleteProject: (id: string) => void;
}

export const ProjectsModal: React.FC<ProjectsModalProps> = ({
  isOpen,
  onClose,
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

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
          onClose();
        }
      } catch {
        // Invalid JSON
      }
    };
    reader.readAsText(file);
  };

  const activeProject =
    projects.find((p) => p.id === activeProjectId) || projects[0];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="projects-modal-title"
    >
      <div className="w-full max-w-2xl rounded-xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <FolderOpen className="w-5 h-5 text-amber-400" />
            <h2 id="projects-modal-title" className="text-base font-bold text-white">
              Mening Loyihalarim va 0 dan Modellashtirish (Oflayn Xotira)
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Yopish"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Create Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() => {
              onCreateProject(createBlankProject(true));
              onClose();
            }}
            className="flex flex-col items-start p-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
              <PlusCircle className="w-4 h-4" />
              <span>0 dan Yangi Loyiha</span>
            </div>
            <p className="text-[11px] text-slate-300 mt-1">
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
              onClose();
            }}
            className="flex flex-col items-start p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Oshxona Shablon (2.8m)</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Moyka, 3 tortmali blok, gaz plita va 4 ta osma shkafli to&apos;plam
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              onCreateProject(createWardrobeProject());
              onClose();
            }}
            className="flex flex-col items-start p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Shkaf-Kupe va Komod</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Yotoqxona uchun 2 eshikli baland garderob va 4 tortmali komod
            </p>
          </button>
        </div>

        {/* Saved Projects List in LocalStorage */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-400">
            Qurilmada saqlangan loyihalar ({projects.length} ta):
          </div>
          <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
            {projects.map((p) => {
              const isCurrent = p.id === activeProjectId;
              return (
                <div
                  key={p.id}
                  className={`flex items-center justify-between p-3.5 text-xs transition-colors ${
                    isCurrent ? 'bg-slate-900' : 'hover:bg-slate-900/50'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelectProject(p.id);
                      onClose();
                    }}
                    className="flex-1 text-left cursor-pointer"
                  >
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>{p.name}</span>
                      {isCurrent && (
                        <span className="text-[11px] font-normal text-amber-400">
                          · Faol loyiha
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 font-mono tabular-nums">
                      {p.modules.length} ta modul · {p.customParts.length} ta alohida detal
                    </div>
                  </button>

                  {projects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => onDeleteProject(p.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800"
                      aria-label={`${p.name} loyihasini o'chirish`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Backup / Restore JSON */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => exportProjectToJSON(activeProject)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Loyiha faylini saqlash (.json)</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium cursor-pointer"
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

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold cursor-pointer"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
};
