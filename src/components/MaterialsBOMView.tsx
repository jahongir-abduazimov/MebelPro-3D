import React from 'react';
import {
  BOMSummary,
  FurnitureProject,
  MaterialPriceConfig,
} from '../types/furniture';
import { formatUZS } from '../utils/storage';
import {
  Box,
  Calculator,
  Layers,
  Printer,
  RotateCcw,
  Wrench,
} from 'lucide-react';
import { DEFAULT_PRICES } from '../utils/raskroyEngine';

interface MaterialsBOMViewProps {
  project: FurnitureProject;
  bom: BOMSummary;
  onUpdatePrices: (prices: MaterialPriceConfig) => void;
}

const PRICE_KEY_MAP: Record<string, keyof MaterialPriceConfig> = {
  kromka_04: 'kromka_04',
  kromka_20: 'kromka_20',
  stoleshnitsa_pm: 'stoleshnitsa_38',
  hinges: 'hinge_pair',
  gas_lift: 'gas_lift',
  slides: 'drawer_slide',
  handles: 'handle',
  legs: 'leg',
  clothes_rod: 'clothes_rod_set',
  konfirmat: 'konfirmat',
};

export const MaterialsBOMView: React.FC<MaterialsBOMViewProps> = ({
  project,
  bom,
  onUpdatePrices,
}) => {
  const prices: MaterialPriceConfig = {
    ...DEFAULT_PRICES,
    ...(project.prices || {}),
  };

  const updatePriceField = (key: keyof MaterialPriceConfig, val: number) => {
    onUpdatePrices({
      ...prices,
      [key]: Math.max(0, Math.round(val)),
    });
  };

  const totalSheetsCount = bom.sheetsByMaterial.reduce((a, b) => a + b.sheetCount, 0);
  const totalEdgeMeters = Math.ceil(bom.totalEdge04Meters + bom.totalEdge20Meters);

  return (
    <div className="w-full h-full overflow-y-auto bg-slate-950 text-slate-100 p-3 sm:p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6 pb-24 md:pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-tight">
              Materiallar va Narx Smetasi
            </h1>
            <p className="text-xs md:text-sm text-slate-400 mt-1 hidden sm:block">
              LDSP/MDF listlar, PVX kromka, furnitura, raskroy sexi xizmati va har bir modulning alohida tannarxi
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto no-print">
            <button
              type="button"
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-sky-400" />
              <span>Chop etish</span>
            </button>
            <button
              type="button"
              onClick={() => onUpdatePrices({ ...DEFAULT_PRICES })}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Standart narxlar</span>
            </button>
          </div>
        </div>

        {/* 4 Key Summary KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4">
            <div className="text-[11px] sm:text-xs text-slate-400">1. Plita Materiallari</div>
            <div className="text-base sm:text-xl font-bold text-emerald-300 font-mono tabular-nums mt-1">
              {formatUZS(bom.totalMaterialCost)}
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1">
              {totalSheetsCount} list · {bom.totalBoardsM2} m²
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4">
            <div className="text-[11px] sm:text-xs text-slate-400">2. Kromka va Furnitura</div>
            <div className="text-base sm:text-xl font-bold text-sky-300 font-mono tabular-nums mt-1">
              {formatUZS(bom.totalHardwareCost)}
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1">
              Kromka: {bom.totalEdge04Meters}m / {bom.totalEdge20Meters}m
            </div>
          </div>

          <div className="bg-slate-900 border border-amber-500/40 rounded-xl p-3 sm:p-4">
            <div className="text-[11px] sm:text-xs text-amber-300 font-medium">
              3. Xomashyo Jami
            </div>
            <div className="text-base sm:text-xl font-bold text-amber-400 font-mono tabular-nums mt-1">
              {formatUZS(bom.grandTotalCost)}
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1">
              O&apos;zi yig&apos;ganda tannarxi
            </div>
          </div>

          <div className="bg-slate-900 border border-emerald-500/40 rounded-xl p-3 sm:p-4">
            <div className="text-[11px] sm:text-xs text-emerald-300 font-medium">
              4. Tayyor Mebel Narxi
            </div>
            <div className="text-base sm:text-xl font-bold text-white font-mono tabular-nums mt-1">
              {formatUZS(bom.turnkeyTotalCost)}
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 mt-1">
              Kesish, yig&apos;ish ({prices.assembly_percent ?? 15}%), dostavka
            </div>
          </div>
        </div>

        {/* Section 1: Sheet Materials */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs sm:text-sm font-bold text-white">
              1. Plita va List Materiallari
            </h2>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-slate-800/70">
            {bom.sheetsByMaterial.map((item) => (
              <div key={item.material.id} className="p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-white">{item.material.shortName}</span>
                  <span className="font-mono font-bold text-amber-300">
                    {item.sheetCount} list ({item.usedAreaM2} m²)
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span>Narxi:</span>
                    <input
                      type="number"
                      step={5000}
                      min={0}
                      value={prices[item.material.id]}
                      onChange={(e) =>
                        updatePriceField(item.material.id, Number(e.target.value))
                      }
                      className="w-28 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-right font-mono text-white"
                    />
                  </label>
                  <span className="font-mono font-bold text-emerald-300">
                    {formatUZS(item.totalCost)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                  <th className="py-2.5 px-4">Material nomi va formati</th>
                  <th className="py-2.5 px-4 text-right">Detallar yuzasi</th>
                  <th className="py-2.5 px-4 text-center">Kerakli list soni</th>
                  <th className="py-2.5 px-4 text-right">1 list narxi (so&apos;m)</th>
                  <th className="py-2.5 px-4 text-right">Jami summa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {bom.sheetsByMaterial.map((item) => (
                  <tr key={item.material.id} className="hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-medium text-slate-100">
                      {item.material.name}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300">
                      {item.usedAreaM2} m²
                    </td>
                    <td className="py-3 px-4 text-center font-mono tabular-nums font-bold text-amber-300">
                      {item.sheetCount} list
                    </td>
                    <td className="py-3 px-4 text-right">
                      <input
                        type="number"
                        step={5000}
                        min={0}
                        value={prices[item.material.id]}
                        onChange={(e) =>
                          updatePriceField(item.material.id, Number(e.target.value))
                        }
                        aria-label={`${item.material.shortName} list narxi`}
                        className="w-32 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-right font-mono tabular-nums text-slate-100"
                      />
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-white">
                      {formatUZS(item.totalCost)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Hardware, Edge Banding & Countertop */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-sky-400" />
            <h2 className="text-xs sm:text-sm font-bold text-white">
              2. Kromka, Stoleshnitsa va Furnitura
            </h2>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-slate-800/70">
            {bom.hardware.map((hw) => {
              const priceKey = PRICE_KEY_MAP[hw.id];
              return (
                <div key={hw.id} className="p-3 space-y-2 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-white">{hw.name}</span>
                    <span className="font-mono font-bold text-sky-300 shrink-0">
                      {hw.quantity} {hw.unit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    {priceKey ? (
                      <label className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <span>Birlik:</span>
                        <input
                          type="number"
                          step={500}
                          min={0}
                          value={prices[priceKey] ?? hw.unitPrice}
                          onChange={(e) =>
                            updatePriceField(priceKey, Number(e.target.value))
                          }
                          className="w-24 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-right font-mono text-white"
                        />
                      </label>
                    ) : (
                      <span className="font-mono text-slate-400">{hw.unitPrice}</span>
                    )}
                    <span className="font-mono font-bold text-white">
                      {formatUZS(hw.totalPrice)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                  <th className="py-2.5 px-4">Furnitura / Xomashyo nomi</th>
                  <th className="py-2.5 px-4 text-center">Miqdori</th>
                  <th className="py-2.5 px-4 text-center">O&apos;lchov birligi</th>
                  <th className="py-2.5 px-4 text-right">Birlik narxi (so&apos;m)</th>
                  <th className="py-2.5 px-4 text-right">Jami summa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {bom.hardware.map((hw) => {
                  const priceKey = PRICE_KEY_MAP[hw.id];
                  return (
                    <tr key={hw.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-medium text-slate-100">{hw.name}</td>
                      <td className="py-3 px-4 text-center font-mono tabular-nums font-bold text-sky-300">
                        {hw.quantity}
                      </td>
                      <td className="py-3 px-4 text-center text-slate-400">{hw.unit}</td>
                      <td className="py-3 px-4 text-right">
                        {priceKey ? (
                          <input
                            type="number"
                            step={500}
                            min={0}
                            value={prices[priceKey] ?? hw.unitPrice}
                            onChange={(e) =>
                              updatePriceField(priceKey, Number(e.target.value))
                            }
                            aria-label={`${hw.name} narxi`}
                            className="w-28 bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-right font-mono tabular-nums text-slate-100"
                          />
                        ) : (
                          <span className="font-mono tabular-nums">{hw.unitPrice}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-white">
                        {formatUZS(hw.totalPrice)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Workshop Services & Assembly Calculator */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs sm:text-sm font-bold text-white">
                3. Sex, Yig&apos;ish va Transport Xizmatlari
              </h2>
            </div>
            <span className="text-xs font-mono text-emerald-300 font-bold">
              Jami: {formatUZS(bom.totalServiceCost)}
            </span>
          </div>

          <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <label className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1.5">
              <div className="text-slate-400">Raskroy kesish (1 list):</div>
              <input
                type="number"
                step={5000}
                min={0}
                value={prices.cutting_per_sheet ?? 45000}
                onChange={(e) =>
                  updatePriceField('cutting_per_sheet', Number(e.target.value))
                }
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 font-mono text-white"
              />
              <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                <span>{totalSheetsCount} list ×</span>
                <span className="font-mono text-amber-300 font-semibold">
                  {formatUZS(bom.cuttingServiceCost)}
                </span>
              </div>
            </label>

            <label className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1.5">
              <div className="text-slate-400">Kromka yopishtirish (1 m):</div>
              <input
                type="number"
                step={500}
                min={0}
                value={prices.edge_gluing_per_m ?? 3000}
                onChange={(e) =>
                  updatePriceField('edge_gluing_per_m', Number(e.target.value))
                }
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 font-mono text-white"
              />
              <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                <span>{totalEdgeMeters} m ×</span>
                <span className="font-mono text-sky-300 font-semibold">
                  {formatUZS(bom.edgeGluingServiceCost)}
                </span>
              </div>
            </label>

            <label className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Usta yig&apos;ish foizi:</span>
                <span className="font-mono text-emerald-300 font-bold">
                  {prices.assembly_percent ?? 15}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                step={5}
                value={prices.assembly_percent ?? 15}
                onChange={(e) =>
                  updatePriceField('assembly_percent', Number(e.target.value))
                }
                className="w-full accent-emerald-500 cursor-pointer my-1"
              />
              <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                <span>Usta haqi:</span>
                <span className="font-mono text-emerald-300 font-semibold">
                  {formatUZS(bom.assemblyServiceCost)}
                </span>
              </div>
            </label>

            <label className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1.5">
              <div className="text-slate-400">Transport / Yetkazish:</div>
              <input
                type="number"
                step={25000}
                min={0}
                value={prices.delivery_flat ?? 150000}
                onChange={(e) =>
                  updatePriceField('delivery_flat', Number(e.target.value))
                }
                className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 font-mono text-white"
              />
              <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                <span>Yetkazish:</span>
                <span className="font-mono text-slate-200 font-semibold">
                  {formatUZS(bom.deliveryCost)}
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Section 4: Per-Module Cost Breakdown */}
        {bom.moduleCosts.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2">
              <Box className="w-4 h-4 text-amber-400" />
              <h2 className="text-xs sm:text-sm font-bold text-white">
                4. Har Bir Modul Narxi ({bom.moduleCosts.length} ta modul)
              </h2>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-slate-800/70">
              {bom.moduleCosts.map((mc) => (
                <div key={mc.moduleId} className="p-3 space-y-1 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-white truncate">{mc.moduleName}</span>
                    <span className="font-mono font-bold text-emerald-300 shrink-0">
                      {formatUZS(mc.estimatedTotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>{mc.dimensions}</span>
                    <span>
                      {mc.partsCount} det · {mc.areaM2} m²
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400">
                    <th className="py-2.5 px-4">Modul nomi</th>
                    <th className="py-2.5 px-4 text-center">O&apos;lchami (E×B×Ch)</th>
                    <th className="py-2.5 px-4 text-center">Detallar va Yuza</th>
                    <th className="py-2.5 px-4 text-right">Material</th>
                    <th className="py-2.5 px-4 text-right">Furnitura va Kromka</th>
                    <th className="py-2.5 px-4 text-right">Taxminiy tannarxi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {bom.moduleCosts.map((mc) => (
                    <tr key={mc.moduleId} className="hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-semibold text-white">
                        {mc.moduleName}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-slate-300">
                        {mc.dimensions}
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-sky-300">
                        {mc.partsCount} ta · {mc.areaM2} m²
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300">
                        {formatUZS(mc.materialCost)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-300">
                        {formatUZS(mc.hardwareCost)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-emerald-300">
                        {formatUZS(mc.estimatedTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
