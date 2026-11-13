import React, { useState } from 'react';
import {
  CustomPart,
  EdgeBandType,
  EdgeConfig,
  MaterialId,
  PartRole,
} from '../types/furniture';
import {
  createEdgeConfig,
  FINISH_PRESETS,
  MATERIAL_SPECS,
  PART_ROLE_LABELS,
} from '../utils/raskroyEngine';
import { X } from 'lucide-react';

interface CustomPartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCustomPart: (part: CustomPart) => void;
}

const EDGE_CYCLE: EdgeBandType[] = ['none', '0.4mm', '2mm'];
function nextEdgeType(current: EdgeBandType): EdgeBandType {
  return EDGE_CYCLE[(EDGE_CYCLE.indexOf(current) + 1) % EDGE_CYCLE.length];
}

export const CustomPartModal: React.FC<CustomPartModalProps> = ({
  isOpen,
  onClose,
  onAddCustomPart,
}) => {
  const [name, setName] = useState("Qo'shimcha tokcha");
  const [role, setRole] = useState<PartRole>('tokcha');
  const [material, setMaterial] = useState<MaterialId>('ldsp_16');
  const [color, setColor] = useState('#E2DDD2');
  const [cutLength, setCutLength] = useState(768);
  const [cutWidth, setCutWidth] = useState(500);
  const [quantity, setQuantity] = useState(1);
  const [orientation, setOrientation] = useState<CustomPart['orientation']>('horizontal');
  const [edges, setEdges] = useState<EdgeConfig>(
    createEdgeConfig('0.4mm', 'none', 'none', 'none'),
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || cutLength < 30 || cutWidth < 30 || quantity < 1) {
      return;
    }
    const spec = MATERIAL_SPECS[material];
    const newPart: CustomPart = {
      id: `cp_${Date.now()}`,
      name: name.trim(),
      role,
      material,
      color,
      cutLength: Math.round(cutLength),
      cutWidth: Math.round(cutWidth),
      thickness: spec.thickness,
      quantity: Math.round(quantity),
      edges: { ...edges },
      x: 200,
      y: 900,
      z: 200,
      orientation,
    };
    onAddCustomPart(newPart);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/80 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-custom-part-title"
    >
      <form
        onSubmit={handleSubmit}
        className="w-full sm:max-w-lg rounded-t-2xl sm:rounded-xl bg-slate-900 border border-slate-800 p-4 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 id="add-custom-part-title" className="text-sm sm:text-base font-bold text-white">
            0 dan Alohida Detal Qo&apos;shish
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            aria-label="Yopish"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <label className="space-y-1 sm:col-span-2">
            <span className="text-slate-300 font-medium">Detal nomi</span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
            />
          </label>

          <label className="space-y-1">
            <span className="text-slate-300 font-medium">Detal turi</span>
            <select
              value={role}
              onChange={(e) => {
                const r = e.target.value as PartRole;
                setRole(r);
                setOrientation(
                  r === 'yon_devor' || r === 'orta_devor'
                    ? 'vertical_side'
                    : r === 'fasad_eshik' || r === 'orqa_devor' || r === 'tortma_fasad'
                    ? 'frontal'
                    : 'horizontal',
                );
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
            >
              {(Object.keys(PART_ROLE_LABELS) as PartRole[]).map((r) => (
                <option key={r} value={r}>
                  {PART_ROLE_LABELS[r].label}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="text-slate-300 font-medium">Material</span>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value as MaterialId)}
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
              value={cutLength}
              onChange={(e) => setCutLength(Number(e.target.value))}
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
              value={cutWidth}
              onChange={(e) => setCutWidth(Number(e.target.value))}
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
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 font-mono tabular-nums text-white"
            />
          </label>

          <label className="space-y-1">
            <span className="text-slate-300 font-medium">3D Joylashuv yo&apos;nalishi</span>
            <select
              value={orientation}
              onChange={(e) => setOrientation(e.target.value as CustomPart['orientation'])}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
            >
              <option value="horizontal">Gorizontal (Tokcha / Qopqoq)</option>
              <option value="vertical_side">Vertikal yon (Stoyka / To&apos;siq)</option>
              <option value="frontal">Frontal (Fasad / Orqa devor)</option>
            </select>
          </label>

          <div className="space-y-1 sm:col-span-2">
            <span className="text-slate-300 font-medium">Rangi</span>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {FINISH_PRESETS.slice(0, 8).map((fp) => (
                <button
                  key={fp.id}
                  type="button"
                  onClick={() => setColor(fp.hex)}
                  title={fp.name}
                  className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                    color.toLowerCase() === fp.hex.toLowerCase()
                      ? 'border-amber-400 scale-110'
                      : 'border-slate-700'
                  }`}
                  style={{ backgroundColor: fp.hex }}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                aria-label="Boshqa rang tanlash"
                className="w-8 h-7 rounded bg-slate-950 border border-slate-700 cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-1 sm:col-span-2">
            <span className="text-slate-300 font-medium">Kromka (U1 / U2 / E1 / E2)</span>
            <div className="grid grid-cols-4 gap-1.5 pt-1">
              {(['l1', 'l2', 'w1', 'w2'] as (keyof EdgeConfig)[]).map((side, idx) => (
                <button
                  key={side}
                  type="button"
                  onClick={() =>
                    setEdges((prev) => ({
                      ...prev,
                      [side]: nextEdgeType(prev[side]),
                    }))
                  }
                  className={`px-2 py-1.5 rounded bg-slate-950 border text-xs font-mono cursor-pointer ${
                    edges[side] === '2mm'
                      ? 'border-amber-500 text-amber-300'
                      : edges[side] === '0.4mm'
                      ? 'border-sky-500 text-sky-300'
                      : 'border-slate-700 text-slate-400'
                  }`}
                >
                  {idx < 2 ? `U${idx + 1}` : `E${idx - 1}`}:
                  {edges[side] === 'none' ? '-' : edges[side]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 text-xs font-medium text-slate-300 hover:text-white cursor-pointer"
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-amber-500 text-xs font-semibold text-slate-950 hover:bg-amber-400 cursor-pointer"
          >
            3D Sahnaga va Raskroyga Qo&apos;shish
          </button>
        </div>
      </form>
    </div>
  );
};
