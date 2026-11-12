import React, { useState } from 'react';
import {
  CustomPart,
  CutListRow,
  EdgeBandType,
  EdgeConfig,
  FurnitureProject,
  MaterialId,
  PartOverride,
  PartRole,
  RaskroySheet,
} from '../types/furniture';
import {
  createEdgeConfig,
  MATERIAL_SPECS,
  PART_ROLE_LABELS,
} from '../utils/raskroyEngine';
import { exportCutListToCSV } from '../utils/storage';
import {
  Download,
  FileSpreadsheet,
  Layers,
  Plus,
  Printer,
  Scissors,
  Search,
  Trash2,
} from 'lucide-react';

interface RaskroyViewProps {
  project: FurnitureProject;
  cutList: CutListRow[];
  sheets: RaskroySheet[];
  onUpdateOverride: (boardIds: string[], patch: PartOverride) => void;
  onAddCustomPart: (part: CustomPart) => void;
  onDeleteCustomPart: (customPartId: string) => void;
  onUpdateKerfSettings: (sawKerf: number, sheetTrim: number) => void;
}

const EDGE_CYCLE: EdgeBandType[] = ['none', '0.4mm', '2mm'];

function nextEdgeType(current: EdgeBandType): EdgeBandType {
  const idx = EDGE_CYCLE.indexOf(current);
  return EDGE_CYCLE[(idx + 1) % EDGE_CYCLE.length];
}

export const RaskroyView: React.FC<RaskroyViewProps> = ({
  project,
  cutList,
  sheets,
  onUpdateOverride,
  onAddCustomPart,
  onDeleteCustomPart,
  onUpdateKerfSettings,
}) => {
  const [subTab, setSubTab] = useState<'table' | 'sheets'>('table');
  const [filterMaterial, setFilterMaterial] = useState<string>('all');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddPartModal, setShowAddPartModal] = useState(false);

  // New custom part form state
  const [newPartName, setNewPartName] = useState('Qo\'shimcha tokcha');
  const [newPartRole, setNewPartRole] = useState<PartRole>('tokcha');
  const [newPartMaterial, setNewPartMaterial] = useState<MaterialId>('ldsp_16');
  const [newPartLength, setNewPartLength] = useState(768);
  const [newPartWidth, setNewPartWidth] = useState(500);
  const [newPartQty, setNewPartQty] = useState(1);
  const [newPartEdges, setNewPartEdges] = useState<EdgeConfig>(
    createEdgeConfig('0.4mm', 'none', 'none', 'none'),
  );

  const filteredRows = cutList.filter((row) => {
    if (filterMaterial !== 'all' && row.material !== filterMaterial) return false;
    if (filterRole !== 'all' && row.role !== filterRole) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        row.partName.toLowerCase().includes(q) ||
        row.moduleName.toLowerCase().includes(q) ||
        PART_ROLE_LABELS[row.role].label.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const totalFilteredQty = filteredRows.reduce((acc, r) => acc + r.quantity, 0);
  const totalFilteredArea = filteredRows
    .reduce((acc, r) => acc + r.areaM2, 0)
    .toFixed(2);

  const handleCreateCustomPart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPartName.trim() || newPartLength < 30 || newPartWidth < 30 || newPartQty < 1) {
      return;
    }
    const spec = MATERIAL_SPECS[newPartMaterial];
    const newPart: CustomPart = {
      id: `cp_${Date.now()}`,
      name: newPartName.trim(),
      role: newPartRole,
      material: newPartMaterial,
      color: '#EAE6DF',
      cutLength: Math.round(newPartLength),
      cutWidth: Math.round(newPartWidth),
      thickness: spec.thickness,
      quantity: Math.round(newPartQty),
      edges: { ...newPartEdges },
      x: 200,
      y: 900,
      z: 200,
      orientation:
        newPartRole === 'yon_devor' || newPartRole === 'orta_devor'
          ? 'vertical_side'
          : newPartRole === 'fasad_eshik' || newPartRole === 'orqa_devor'
          ? 'frontal'
          : 'horizontal',
    };
    onAddCustomPart(newPart);
    setShowAddPartModal(false);
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-950 text-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6 pb-20">
        {/* Top Action & Summary Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Raskroy Sexi Uchun Aniq Kesish O&apos;lchamlari
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1">
              Har bir detalning turi, millimetr aniqlikdagi kesish o&apos;lchami, PVX kromka tomonlari va 2D listga joylashuv sxemasi
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 no-print">
            <button
              type="button"
              onClick={() => setShowAddPartModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Alohida Detal Qo&apos;shish</span>
            </button>

            <button
              type="button"
              onClick={() => exportCutListToCSV(project, cutList)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Raskroy CSV (Excel) Yuklab Olish</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span>Chop etish</span>
            </button>
          </div>
        </div>

        {/* Sub-navigation & Filter Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg self-start">
            <button
              type="button"
              onClick={() => setSubTab('table')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                subTab === 'table'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Detallar Kesish Jadvali ({cutList.length} pozitsiya)</span>
            </button>
            <button
              type="button"
              onClick={() => setSubTab('sheets')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                subTab === 'sheets'
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2D Listga Joylashtirish ({sheets.length} ta list)</span>
            </button>
          </div>

          {subTab === 'table' ? (
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Detal yoki modul qidirish..."
                  aria-label="Detal yoki modul qidirish"
                  className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-500 w-48"
                />
              </div>

              <select
                value={filterMaterial}
                onChange={(e) => setFilterMaterial(e.target.value)}
                aria-label="Material bo'yicha saralash"
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="all">Barcha materiallar</option>
                {Object.values(MATERIAL_SPECS).map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.shortName}
                  </option>
                ))}
              </select>

              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                aria-label="Detal turi bo'yicha saralash"
                className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                <option value="all">Barcha detal turlari</option>
                {(Object.keys(PART_ROLE_LABELS) as PartRole[]).map((role) => (
                  <option key={role} value={role}>
                    {PART_ROLE_LABELS[role].label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 bg-slate-900 border border-slate-800 rounded-lg px-3.5 py-2">
              <label className="flex items-center gap-2">
                <span className="text-slate-400">Arra qalinligi (mm):</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={project.sawKerf}
                  onChange={(e) =>
                    onUpdateKerfSettings(
                      Math.max(1, Number(e.target.value) || 4),
                      project.sheetTrim,
                    )
                  }
                  className="w-14 bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-center font-mono tabular-nums text-amber-300"
                />
              </label>
              <label className="flex items-center gap-2">
                <span className="text-slate-400">List chetidan obrezka (mm):</span>
                <input
                  type="number"
                  min={0}
                  max={30}
                  value={project.sheetTrim}
                  onChange={(e) =>
                    onUpdateKerfSettings(
                      project.sawKerf,
                      Math.max(0, Number(e.target.value) || 10),
                    )
                  }
                  className="w-14 bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-center font-mono tabular-nums text-amber-300"
                />
              </label>
            </div>
          )}
        </div>

        {/* SUB-TAB 1: CUT-LIST TABLE */}
        {subTab === 'table' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <div>
                Ko&apos;rsatilmoqda: <strong className="text-slate-100 tabular-nums">{filteredRows.length}</strong> pozitsiya · Jami detallar: <strong className="text-amber-300 tabular-nums">{totalFilteredQty} dona</strong> · Umumiy yuza: <strong className="text-emerald-300 tabular-nums">{totalFilteredArea} m²</strong>
              </div>
              <div className="text-slate-400">
                Kromka ustiga bosib <span className="text-sky-300 font-mono">0.4mm</span> / <span className="text-amber-300 font-mono">2mm</span> / <span className="text-slate-500 font-mono">Yo&apos;q</span> rejimini almashtiring
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-semibold text-slate-400">
                    <th className="py-2.5 px-3 w-10">#</th>
                    <th className="py-2.5 px-3">Modul va Detal nomi</th>
                    <th className="py-2.5 px-3">Detal turi (Tanlash)</th>
                    <th className="py-2.5 px-3">Material</th>
                    <th className="py-2.5 px-3 text-right">Uzunligi (mm)</th>
                    <th className="py-2.5 px-3 text-right">Eni (mm)</th>
                    <th className="py-2.5 px-3 text-center">Qalinlik</th>
                    <th className="py-2.5 px-3 text-center">Soni</th>
                    <th className="py-2.5 px-3 text-center">Kromka (U1 / U2 / E1 / E2)</th>
                    <th className="py-2.5 px-3 text-right">Yuza (m²)</th>
                    <th className="py-2.5 px-3 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-xs">
                  {filteredRows.map((row) => {
                    const isCustom = row.moduleId.startsWith('custom:');
                    const customId = isCustom ? row.moduleId.replace('custom:', '') : null;

                    const toggleEdge = (side: keyof EdgeConfig) => {
                      const nextEdges: EdgeConfig = {
                        ...row.edges,
                        [side]: nextEdgeType(row.edges[side]),
                      };
                      onUpdateOverride(row.boardIds, { edges: nextEdges });
                    };

                    return (
                      <tr
                        key={row.id}
                        className="hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-2.5 px-3 font-mono tabular-nums text-slate-400">
                          {row.index}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-100">{row.partName}</div>
                          <div className="text-[11px] text-slate-400">{row.moduleName}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <select
                            value={row.role}
                            onChange={(e) =>
                              onUpdateOverride(row.boardIds, {
                                role: e.target.value as PartRole,
                              })
                            }
                            aria-label={`${row.partName} detal turi`}
                            className="bg-slate-950 border border-slate-700/80 rounded-md px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                          >
                            {(Object.keys(PART_ROLE_LABELS) as PartRole[]).map((rKey) => (
                              <option key={rKey} value={rKey}>
                                {PART_ROLE_LABELS[rKey].label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2.5 px-3">
                          <select
                            value={row.material}
                            onChange={(e) =>
                              onUpdateOverride(row.boardIds, {
                                material: e.target.value as MaterialId,
                              })
                            }
                            aria-label={`${row.partName} materiali`}
                            className="bg-slate-950 border border-slate-700/80 rounded-md px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                          >
                            {Object.values(MATERIAL_SPECS).map((ms) => (
                              <option key={ms.id} value={ms.id}>
                                {ms.shortName}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                          <input
                            type="number"
                            min={40}
                            max={2800}
                            value={row.cutLength}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              if (val >= 40) {
                                onUpdateOverride(row.boardIds, { cutLength: val });
                              }
                            }}
                            aria-label={`${row.partName} uzunligi mm`}
                            className="w-20 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-right font-mono tabular-nums text-amber-300 focus:outline-none focus:border-amber-500"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                          <input
                            type="number"
                            min={40}
                            max={2070}
                            value={row.cutWidth}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              if (val >= 40) {
                                onUpdateOverride(row.boardIds, { cutWidth: val });
                              }
                            }}
                            aria-label={`${row.partName} eni mm`}
                            className="w-20 bg-slate-950 border border-slate-800 rounded px-2 py-1 text-right font-mono tabular-nums text-sky-300 focus:outline-none focus:border-amber-500"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono tabular-nums text-slate-300">
                          {row.thickness} mm
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono tabular-nums font-bold text-white">
                          {row.quantity}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center justify-center gap-1">
                            {(['l1', 'l2', 'w1', 'w2'] as (keyof EdgeConfig)[]).map((side, sIdx) => {
                              const val = row.edges[side];
                              const labelPrefix =
                                sIdx === 0 ? 'U1' : sIdx === 1 ? 'U2' : sIdx === 2 ? 'E1' : 'E2';
                              return (
                                <button
                                  key={side}
                                  type="button"
                                  onClick={() => toggleEdge(side)}
                                  title={`${labelPrefix} kromkasini o'zgartirish`}
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono tabular-nums border transition-colors cursor-pointer ${
                                    val === '2mm'
                                      ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-semibold'
                                      : val === '0.4mm'
                                      ? 'bg-sky-500/20 border-sky-500/60 text-sky-300'
                                      : 'bg-slate-950 border-slate-800 text-slate-500'
                                  }`}
                                >
                                  {labelPrefix}:{val === 'none' ? '-' : val.replace('mm', '')}
                                </button>
                              );
                            })}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-300">
                          {row.areaM2}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {customId && (
                            <button
                              type="button"
                              onClick={() => onDeleteCustomPart(customId)}
                              className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                              aria-label={`${row.partName} detalini o'chirish`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SUB-TAB 2: 2D SHEET NESTING DIAGRAMS */}
        {subTab === 'sheets' && (
          <div className="space-y-6">
            {sheets.map((sheet) => (
              <div
                key={sheet.sheetNumber}
                className="bg-slate-900 border border-slate-800 rounded-xl p-4 md:p-5 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-sm md:text-base font-bold text-white">
                      List #{sheet.sheetNumber} — {sheet.materialName}
                    </h3>
                    <div className="text-xs text-slate-400 mt-0.5 font-mono tabular-nums">
                      O&apos;lchami: {sheet.sheetLength} × {sheet.sheetWidth} mm · Joylashgan detallar: {sheet.parts.length} dona
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono tabular-nums">
                    <span>
                      Foydali yuza: <strong className="text-emerald-300">{sheet.usedAreaM2} m²</strong> / {sheet.totalAreaM2} m²
                    </span>
                    <span>
                      Samaradorlik: <strong className="text-amber-300">{sheet.efficiencyPercent}%</strong>
                    </span>
                  </div>
                </div>

                {/* SVG 2D Nesting Map */}
                <div className="w-full overflow-x-auto bg-slate-950 rounded-lg p-3 border border-slate-800/80">
                  <svg
                    viewBox={`0 0 ${sheet.sheetLength} ${sheet.sheetWidth}`}
                    className="w-full h-auto max-h-[420px] border border-slate-700 bg-slate-900"
                  >
                    {/* Usable trim boundary */}
                    <rect
                      x={project.sheetTrim}
                      y={project.sheetTrim}
                      width={sheet.sheetLength - 2 * project.sheetTrim}
                      height={sheet.sheetWidth - 2 * project.sheetTrim}
                      fill="none"
                      stroke="#334155"
                      strokeWidth="4"
                      strokeDasharray="16 12"
                    />

                    {sheet.parts.map((part, pIdx) => {
                      const fillColors: Record<PartRole, string> = {
                        yon_devor: '#1e3a5f',
                        ostki_ustki: '#1e293b',
                        tokcha: '#134e4a',
                        orta_devor: '#1f2937',
                        fasad_eshik: '#312e81',
                        tortma_fasad: '#4c1d95',
                        tortma_korpus: '#3b0764',
                        tsarga: '#431407',
                        orqa_devor: '#334155',
                        stoleshnitsa: '#365314',
                        boshqa: '#4c0519',
                      };
                      const fill = fillColors[part.role] || '#1e293b';
                      const showLabel = part.length >= 130 && part.width >= 85;
                      const showSub = part.length >= 240 && part.width >= 130;
                      const mainFontSize = Math.min(
                        30,
                        Math.max(14, Math.min(part.length * 0.105, part.width * 0.16)),
                      );
                      const subFontSize = Math.min(
                        22,
                        Math.max(12, Math.min(part.length * 0.08, part.width * 0.11)),
                      );

                      return (
                        <g key={`${part.rowId}_${pIdx}`}>
                          <rect
                            x={part.x}
                            y={part.y}
                            width={part.length}
                            height={part.width}
                            fill={fill}
                            stroke="#f59e0b"
                            strokeWidth="3"
                          />
                          {showLabel && (
                            <>
                              <text
                                x={part.x + part.length / 2}
                                y={part.y + part.width / 2 - (showSub ? 10 : 0)}
                                fill="#ffffff"
                                fontSize={mainFontSize}
                                fontWeight="bold"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontFamily="JetBrains Mono, monospace"
                              >
                                #{part.partIndex} ({part.length}×{part.width})
                              </text>
                              {showSub && (
                                <text
                                  x={part.x + part.length / 2}
                                  y={part.y + part.width / 2 + 20}
                                  fill="#cbd5e1"
                                  fontSize={subFontSize}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                  fontFamily="Plus Jakarta Sans, sans-serif"
                                >
                                  {part.partName.slice(0, 16)}
                                </text>
                              )}
                            </>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: 0 dan Alohida Detal Qo'shish */}
      {showAddPartModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-custom-part-title"
        >
          <form
            onSubmit={handleCreateCustomPart}
            className="w-full max-w-lg rounded-xl bg-slate-900 border border-slate-800 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 id="add-custom-part-title" className="text-base font-bold text-white">
                0 dan Yangi Detal Qo&apos;shish
              </h3>
              <button
                type="button"
                onClick={() => setShowAddPartModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Bekor qilish
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <label className="space-y-1 sm:col-span-2">
                <span className="text-slate-300 font-medium">Detal nomi</span>
                <input
                  type="text"
                  required
                  value={newPartName}
                  onChange={(e) => setNewPartName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                />
              </label>

              <label className="space-y-1">
                <span className="text-slate-300 font-medium">Detal turi</span>
                <select
                  value={newPartRole}
                  onChange={(e) => setNewPartRole(e.target.value as PartRole)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                >
                  {(Object.keys(PART_ROLE_LABELS) as PartRole[]).map((role) => (
                    <option key={role} value={role}>
                      {PART_ROLE_LABELS[role].label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-slate-300 font-medium">Material</span>
                <select
                  value={newPartMaterial}
                  onChange={(e) => setNewPartMaterial(e.target.value as MaterialId)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
                >
                  {Object.values(MATERIAL_SPECS).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-1">
                <span className="text-slate-300 font-medium">Uzunligi (mm)</span>
                <input
                  type="number"
                  required
                  min={40}
                  max={2800}
                  value={newPartLength}
                  onChange={(e) => setNewPartLength(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono tabular-nums text-amber-300"
                />
              </label>

              <label className="space-y-1">
                <span className="text-slate-300 font-medium">Eni (mm)</span>
                <input
                  type="number"
                  required
                  min={40}
                  max={2070}
                  value={newPartWidth}
                  onChange={(e) => setNewPartWidth(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono tabular-nums text-sky-300"
                />
              </label>

              <label className="space-y-1">
                <span className="text-slate-300 font-medium">Soni (dona)</span>
                <input
                  type="number"
                  required
                  min={1}
                  max={100}
                  value={newPartQty}
                  onChange={(e) => setNewPartQty(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono tabular-nums text-white"
                />
              </label>

              <div className="space-y-1">
                <span className="text-slate-300 font-medium">Kromka (U1 / U2 / E1 / E2)</span>
                <div className="flex items-center gap-1.5 pt-1">
                  {(['l1', 'l2', 'w1', 'w2'] as (keyof EdgeConfig)[]).map((side, idx) => (
                    <button
                      key={side}
                      type="button"
                      onClick={() =>
                        setNewPartEdges((prev) => ({
                          ...prev,
                          [side]: nextEdgeType(prev[side]),
                        }))
                      }
                      className="px-2 py-1.5 rounded bg-slate-950 border border-slate-700 text-xs font-mono text-amber-300"
                    >
                      {idx < 2 ? `U${idx + 1}` : `E${idx - 1}`}:
                      {newPartEdges[side] === 'none' ? '-' : newPartEdges[side]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddPartModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-xs font-medium text-slate-300 hover:text-white"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-amber-500 text-xs font-semibold text-slate-950 hover:bg-amber-400"
              >
                Ro&apos;yxatga va 3D Sahnaga Qo&apos;shish
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
