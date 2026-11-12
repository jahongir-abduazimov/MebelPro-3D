import React, { useState } from 'react';
import { ModuleKind } from '../types/furniture';
import { MODULE_TEMPLATES } from '../utils/raskroyEngine';
import { X } from 'lucide-react';

interface ModuleCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (kind: ModuleKind) => void;
}

export const ModuleCatalogModal: React.FC<ModuleCatalogModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [catalogCategory, setCatalogCategory] = useState<'all' | 'oshxona' | 'shkaf' | 'ofis'>('all');

  if (!isOpen) return null;

  const filteredTemplates =
    catalogCategory === 'all'
      ? MODULE_TEMPLATES
      : MODULE_TEMPLATES.filter((t) => t.category === catalogCategory);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-module-catalog-title"
    >
      <div className="w-full sm:max-w-3xl rounded-t-2xl sm:rounded-xl bg-slate-900 border border-slate-800 p-4 sm:p-6 shadow-2xl space-y-4 max-h-[88vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 id="add-module-catalog-title" className="text-sm sm:text-base font-bold text-white">
              Yangi Mebel Moduli Qo&apos;shish ({MODULE_TEMPLATES.length} xil shablon)
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Shablonni tanlang — so&apos;ng o&apos;lcham, eshik/tortma va qismlarini erkin moslashtirasiz
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
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
              { id: 'oshxona', label: 'Oshxona' },
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3 pb-4 sm:pb-0">
          {filteredTemplates.map((tpl) => (
            <button
              key={tpl.kind}
              type="button"
              onClick={() => {
                onSelectTemplate(tpl.kind);
                onClose();
              }}
              className="flex flex-col justify-between text-left p-3 sm:p-3.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/60 transition-all group cursor-pointer"
            >
              <div>
                <div className="text-xs font-bold text-white group-hover:text-amber-300">
                  {tpl.title}
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {tpl.subtitle}
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
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
  );
};
