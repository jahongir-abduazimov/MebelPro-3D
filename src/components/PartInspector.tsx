import React, { useMemo, useState } from 'react';
import {
  CustomPart,
  EdgeBandType,
  EdgeConfig,
  FurnitureProject,
  Generated3DBoard,
  MaterialId,
  PartOverride,
  PartRole,
} from '../types/furniture';
import {
  createEdgeConfig,
  FINISH_PRESETS,
  getHiddenModuleBoards,
  MATERIAL_SPECS,
  PART_ROLE_LABELS,
} from '../utils/raskroyEngine';
import {
  Eye,
  EyeOff,
  Layers,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from 'lucide-react';

interface PartInspectorProps {
  project: FurnitureProject;
  boards: Generated3DBoard[];
  selectedBoardId: string | null;
  selectedModuleId: string | null;
  onSelectBoard: (boardId: string | null, moduleId: string | null) => void;
  onUpdateOverride: (boardIds: string[], patch: PartOverride) => void;
  onResetOverride: (boardId: string) => void;
  onUpdateCustomPart: (customPartId: string, patch: Partial<CustomPart>) => void;
  onDeleteCustomPart: (customPartId: string) => void;
  onOpenAddCustomPartModal: () => void;
}

const EDGE_CYCLE: EdgeBandType[] = ['none', '0.4mm', '2mm'];
function nextEdge(curr: EdgeBandType): EdgeBandType {
  return EDGE_CYCLE[(EDGE_CYCLE.indexOf(curr) + 1) % EDGE_CYCLE.length];
}

export const PartInspector: React.FC<PartInspectorProps> = ({
  project,
  boards,
  selectedBoardId,
  selectedModuleId,
  onSelectBoard,
  onUpdateOverride,
  onResetOverride,
  onUpdateCustomPart,
  onDeleteCustomPart,
  onOpenAddCustomPartModal,
}) => {
  const [filterScope, setFilterScope] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const selectedBoard = selectedBoardId
    ? boards.find((b) => b.id === selectedBoardId) || null
    : null;

  const isCustomSelected = Boolean(selectedBoard?.moduleId.startsWith('custom:'));
  const selectedCustomPart: CustomPart | null =
    isCustomSelected && selectedBoard
      ? project.customParts.find(
          (cp) => `custom:${cp.id}` === selectedBoard.moduleId,
        ) || null
      : null;

  const hiddenBoards = useMemo(() => getHiddenModuleBoards(project), [project]);

  const filteredBoards = useMemo(() => {
    return boards.filter((b) => {
      if (filterScope === 'custom' && !b.moduleId.startsWith('custom:')) return false;
      if (filterScope === 'selected_mod' && selectedModuleId && b.moduleId !== selectedModuleId)
        return false;
      if (
        filterScope !== 'all' &&
        filterScope !== 'custom' &&
        filterScope !== 'selected_mod' &&
        b.moduleId !== filterScope
      ) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          b.name.toLowerCase().includes(q) ||
          b.moduleName.toLowerCase().includes(q) ||
          PART_ROLE_LABELS[b.role].label.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [boards, filterScope, selectedModuleId, searchQuery]);

  return (
    <div className="flex flex-col h-full text-xs">
      {/* Top Action Header */}
      <div className="p-3 border-b border-slate-800/90 space-y-2.5 bg-slate-950/40 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-semibold">
              Jami: <strong className="text-white font-mono">{boards.length}</strong> detal
              {project.customParts.length > 0 && (
                <span className="text-amber-300 ml-1">
                  ({project.customParts.length} maxsus)
                </span>
              )}
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenAddCustomPartModal}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>0 dan detal</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-2 gap-1.5">
          <div className="relative">
            <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Detal qidirish..."
              aria-label="Detal qidirish"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-2 py-1.5 text-[11px] text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
            />
          </div>

          <select
            value={filterScope}
            onChange={(e) => setFilterScope(e.target.value)}
            aria-label="Detallarni modul bo'yicha saralash"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-[11px] text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="all">Barcha detallar ({boards.length})</option>
            {selectedModuleId && !selectedModuleId.startsWith('custom:') && (
              <option value="selected_mod">Faqat faol modul</option>
            )}
            <option value="custom">
              Maxsus detallar ({project.customParts.length})
            </option>
            {project.modules.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Scrollable Content: Selected Part Editor + Parts Explorer */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3.5">
        {/* Selected Part Editor Card */}
        {selectedBoard ? (
          <div className="rounded-xl bg-slate-950 border border-sky-500/50 p-3 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300">
                    {selectedCustomPart ? 'Maxsus detal' : 'Modul detali'}
                  </span>
                  {selectedBoard.isOverridden && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                      O&apos;zgartirilgan
                    </span>
                  )}
                </div>
                <div className="text-xs font-bold text-white mt-1 truncate">
                  {selectedBoard.name}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {selectedBoard.moduleName}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectBoard(null, selectedModuleId)}
                className="text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900 border border-slate-800 cursor-pointer shrink-0"
              >
                Bekor
              </button>
            </div>

            {/* Name & Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="space-y-1">
                <span className="text-[11px] text-slate-400">Detal nomi:</span>
                <input
                  type="text"
                  value={selectedCustomPart ? selectedCustomPart.name : selectedBoard.name}
                  onChange={(e) => {
                    if (selectedCustomPart) {
                      onUpdateCustomPart(selectedCustomPart.id, { name: e.target.value });
                    } else {
                      onUpdateOverride([selectedBoard.id], { name: e.target.value });
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[11px] text-slate-400">Detal turi:</span>
                <select
                  value={selectedBoard.role}
                  onChange={(e) => {
                    const role = e.target.value as PartRole;
                    if (selectedCustomPart) {
                      onUpdateCustomPart(selectedCustomPart.id, { role });
                    } else {
                      onUpdateOverride([selectedBoard.id], { role });
                    }
                  }}
                  aria-label="Tanlangan 3D detal turi"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-white"
                >
                  {(Object.keys(PART_ROLE_LABELS) as PartRole[]).map((rk) => (
                    <option key={rk} value={rk}>
                      {PART_ROLE_LABELS[rk].label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Dimensions & Material */}
            <div className="grid grid-cols-3 gap-2">
              <label className="space-y-1">
                <span className="text-[11px] text-slate-400">Uzunlik (mm)</span>
                <input
                  type="number"
                  min={40}
                  max={2800}
                  value={selectedBoard.cutLength}
                  onChange={(e) => {
                    const val = Math.max(40, Number(e.target.value) || 100);
                    if (selectedCustomPart) {
                      onUpdateCustomPart(selectedCustomPart.id, { cutLength: val });
                    } else {
                      onUpdateOverride([selectedBoard.id], { cutLength: val });
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 font-mono tabular-nums text-amber-300"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[11px] text-slate-400">Eni (mm)</span>
                <input
                  type="number"
                  min={40}
                  max={2070}
                  value={selectedBoard.cutWidth}
                  onChange={(e) => {
                    const val = Math.max(40, Number(e.target.value) || 100);
                    if (selectedCustomPart) {
                      onUpdateCustomPart(selectedCustomPart.id, { cutWidth: val });
                    } else {
                      onUpdateOverride([selectedBoard.id], { cutWidth: val });
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 font-mono tabular-nums text-sky-300"
                />
              </label>

              <label className="space-y-1">
                <span className="text-[11px] text-slate-400">Material</span>
                <select
                  value={selectedBoard.material}
                  onChange={(e) => {
                    const mat = e.target.value as MaterialId;
                    if (selectedCustomPart) {
                      onUpdateCustomPart(selectedCustomPart.id, {
                        material: mat,
                        thickness: MATERIAL_SPECS[mat]?.thickness || 16,
                      });
                    } else {
                      onUpdateOverride([selectedBoard.id], { material: mat });
                    }
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-1.5 py-1.5 text-[11px] text-white"
                >
                  {Object.values(MATERIAL_SPECS).map((ms) => (
                    <option key={ms.id} value={ms.id}>
                      {ms.shortName}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {/* Individual Part Color */}
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400">Detal rangi (alohida):</span>
              <div className="flex flex-wrap items-center gap-1.5">
                {FINISH_PRESETS.slice(0, 7).map((fp) => (
                  <button
                    key={fp.id}
                    type="button"
                    title={fp.name}
                    onClick={() => {
                      if (selectedCustomPart) {
                        onUpdateCustomPart(selectedCustomPart.id, { color: fp.hex });
                      } else {
                        onUpdateOverride([selectedBoard.id], { color: fp.hex });
                      }
                    }}
                    className={`w-6 h-6 rounded-full border-2 cursor-pointer ${
                      selectedBoard.color.toLowerCase() === fp.hex.toLowerCase()
                        ? 'border-amber-400 scale-110'
                        : 'border-slate-700'
                    }`}
                    style={{ backgroundColor: fp.hex }}
                  />
                ))}
                <input
                  type="color"
                  value={selectedBoard.color}
                  onChange={(e) => {
                    if (selectedCustomPart) {
                      onUpdateCustomPart(selectedCustomPart.id, { color: e.target.value });
                    } else {
                      onUpdateOverride([selectedBoard.id], { color: e.target.value });
                    }
                  }}
                  aria-label="Detal uchun maxsus rang"
                  className="w-7 h-6 rounded bg-slate-900 border border-slate-700 cursor-pointer"
                />
              </div>
            </div>

            {/* Custom Part 3D Placement & Quantity */}
            {selectedCustomPart && (
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="grid grid-cols-2 gap-2">
                  <label className="space-y-1">
                    <span className="text-[11px] text-slate-400">Soni (dona):</span>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={selectedCustomPart.quantity}
                      onChange={(e) =>
                        onUpdateCustomPart(selectedCustomPart.id, {
                          quantity: Math.max(1, Number(e.target.value) || 1),
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 font-mono text-white"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-[11px] text-slate-400">Yo&apos;nalishi:</span>
                    <select
                      value={selectedCustomPart.orientation}
                      onChange={(e) =>
                        onUpdateCustomPart(selectedCustomPart.id, {
                          orientation: e.target.value as CustomPart['orientation'],
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-[11px] text-white"
                    >
                      <option value="horizontal">Gorizontal</option>
                      <option value="vertical_side">Vertikal yon</option>
                      <option value="frontal">Frontal</option>
                    </select>
                  </label>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  <label className="space-y-0.5">
                    <span className="text-[10px] text-slate-400">X (mm)</span>
                    <input
                      type="number"
                      step={50}
                      value={selectedCustomPart.x}
                      onChange={(e) =>
                        onUpdateCustomPart(selectedCustomPart.id, {
                          x: Number(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 font-mono text-slate-200"
                    />
                  </label>
                  <label className="space-y-0.5">
                    <span className="text-[10px] text-slate-400">Y (mm)</span>
                    <input
                      type="number"
                      step={50}
                      value={selectedCustomPart.y}
                      onChange={(e) =>
                        onUpdateCustomPart(selectedCustomPart.id, {
                          y: Math.max(0, Number(e.target.value) || 0),
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 font-mono text-slate-200"
                    />
                  </label>
                  <label className="space-y-0.5">
                    <span className="text-[10px] text-slate-400">Z (mm)</span>
                    <input
                      type="number"
                      step={50}
                      value={selectedCustomPart.z}
                      onChange={(e) =>
                        onUpdateCustomPart(selectedCustomPart.id, {
                          z: Number(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 font-mono text-slate-200"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* PVX Edge Banding */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">PVX Kromka:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      const all2 = createEdgeConfig('2mm', '2mm', '2mm', '2mm');
                      if (selectedCustomPart) {
                        onUpdateCustomPart(selectedCustomPart.id, { edges: all2 });
                      } else {
                        onUpdateOverride([selectedBoard.id], { edges: all2 });
                      }
                    }}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 cursor-pointer"
                  >
                    4×2mm
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const front04 = createEdgeConfig('0.4mm', 'none', 'none', 'none');
                      if (selectedCustomPart) {
                        onUpdateCustomPart(selectedCustomPart.id, { edges: front04 });
                      } else {
                        onUpdateOverride([selectedBoard.id], { edges: front04 });
                      }
                    }}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-300 hover:bg-sky-500/25 cursor-pointer"
                  >
                    U1:0.4
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const none = createEdgeConfig('none', 'none', 'none', 'none');
                      if (selectedCustomPart) {
                        onUpdateCustomPart(selectedCustomPart.id, { edges: none });
                      } else {
                        onUpdateOverride([selectedBoard.id], { edges: none });
                      }
                    }}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  >
                    Tozalash
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1">
                {(['l1', 'l2', 'w1', 'w2'] as (keyof EdgeConfig)[]).map((side, idx) => {
                  const val = selectedBoard.edges[side];
                  const lbl = idx < 2 ? `U${idx + 1}` : `E${idx - 1}`;
                  return (
                    <button
                      key={side}
                      type="button"
                      onClick={() => {
                        const nextEdges = {
                          ...selectedBoard.edges,
                          [side]: nextEdge(val),
                        };
                        if (selectedCustomPart) {
                          onUpdateCustomPart(selectedCustomPart.id, { edges: nextEdges });
                        } else {
                          onUpdateOverride([selectedBoard.id], { edges: nextEdges });
                        }
                      }}
                      className={`py-1.5 rounded text-[10px] font-mono border cursor-pointer ${
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

            {/* Hide / Reset / Delete Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              {selectedCustomPart ? (
                <button
                  type="button"
                  onClick={() => {
                    onDeleteCustomPart(selectedCustomPart.id);
                    onSelectBoard(null, selectedModuleId);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/70 text-rose-300 border border-rose-800/40 font-medium cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Maxsus detalni o&apos;chirish</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateOverride([selectedBoard.id], { hidden: true });
                      onSelectBoard(null, selectedBoard.moduleId);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-800 cursor-pointer"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Detalni olib tashlash</span>
                  </button>
                  {selectedBoard.isOverridden && (
                    <button
                      type="button"
                      onClick={() => onResetOverride(selectedBoard.id)}
                      className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 cursor-pointer"
                      title="Standart holatga qaytarish"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Tiklash</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-slate-950/70 border border-slate-800/90 p-2.5 text-[11px] text-slate-400">
            Tahrirlash uchun 3D sahnada istalgan taxta ustiga bosing yoki quyidagi ro&apos;yxatdan detal tanlang.
          </div>
        )}

        {/* Hidden Module Boards Recovery Strip */}
        {hiddenBoards.length > 0 && (
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-2.5 space-y-1.5">
            <div className="text-[11px] font-semibold text-amber-300">
              Olib tashlangan detallar ({hiddenBoards.length} ta):
            </div>
            <div className="space-y-1">
              {hiddenBoards.map((hb) => (
                <div
                  key={hb.id}
                  className="flex items-center justify-between gap-2 bg-slate-950/80 rounded-lg px-2 py-1"
                >
                  <span className="truncate text-[11px] text-slate-300">
                    {hb.name} ({hb.moduleName})
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateOverride([hb.id], { hidden: false })}
                    className="flex items-center gap-1 text-[10px] text-emerald-300 hover:text-emerald-200 font-semibold shrink-0 cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Qaytarish</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Parts List Explorer */}
        <div className="space-y-1.5">
          {filteredBoards.map((b) => {
            const isSel = selectedBoardId === b.id;
            const roleMeta = PART_ROLE_LABELS[b.role];
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => onSelectBoard(b.id, b.moduleId)}
                className={`w-full text-left p-2 rounded-lg border transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                  isSel
                    ? 'bg-sky-500/15 border-sky-500 text-white'
                    : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 text-slate-200'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-white/20 shrink-0"
                      style={{ backgroundColor: b.color }}
                    />
                    <span className="font-semibold truncate text-[11px]">{b.name}</span>
                    {b.isOverridden && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-slate-400 truncate">
                    <span className="truncate">{b.moduleName}</span>
                    <span>·</span>
                    <span>{roleMeta.short}</span>
                  </div>
                </div>

                <div className="text-right shrink-0 font-mono tabular-nums text-[11px]">
                  <div className="text-amber-300 font-semibold">
                    {Math.round(b.cutLength)}×{Math.round(b.cutWidth)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {MATERIAL_SPECS[b.material]?.shortName}
                  </div>
                </div>
              </button>
            );
          })}

          {filteredBoards.length === 0 && (
            <div className="py-6 text-center text-slate-500 text-xs">
              Qidiruv bo&apos;yicha detal topilmadi.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
