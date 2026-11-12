import { CutListRow, FurnitureProject } from '../types/furniture';
import {
  createBlankProject,
  createDefaultKitchenProject,
  createWardrobeProject,
  MATERIAL_SPECS,
  PART_ROLE_LABELS,
} from './raskroyEngine';

const STORAGE_PROJECTS_KEY = 'mebelpro_projects_v1';
const STORAGE_ACTIVE_ID_KEY = 'mebelpro_active_project_id_v1';

export function loadSavedProjects(): FurnitureProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_PROJECTS_KEY);
    if (!raw) {
      const defaults = [createDefaultKitchenProject(), createWardrobeProject()];
      localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(defaults));
      return defaults;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // Fallback if storage is unavailable
  }
  return [createDefaultKitchenProject(), createWardrobeProject()];
}

export function saveProjectsList(projects: FurnitureProject[]): void {
  try {
    localStorage.setItem(STORAGE_PROJECTS_KEY, JSON.stringify(projects));
  } catch {
    // Ignore quota errors
  }
}

export function loadActiveProjectId(projects: FurnitureProject[]): string {
  try {
    const savedId = localStorage.getItem(STORAGE_ACTIVE_ID_KEY);
    if (savedId && projects.some((p) => p.id === savedId)) {
      return savedId;
    }
  } catch {
    // Ignore
  }
  return projects[0]?.id || createBlankProject().id;
}

export function saveActiveProjectId(id: string): void {
  try {
    localStorage.setItem(STORAGE_ACTIVE_ID_KEY, id);
  } catch {
    // Ignore
  }
}

export function exportCutListToCSV(project: FurnitureProject, cutList: CutListRow[]): void {
  const headers = [
    '№',
    'Modul nomi',
    'Detal nomi',
    'Detal turi',
    'Material',
    'Uzunligi (mm)',
    'Eni (mm)',
    'Qalinligi (mm)',
    'Soni (dona)',
    'Kromka Uzunligi 1',
    'Kromka Uzunligi 2',
    'Kromka Eni 1',
    'Kromka Eni 2',
    'Yuza (m2)',
    'Kromka 0.4mm (m)',
    'Kromka 2mm (m)',
  ];

  const rows = cutList.map((r) => [
    r.index,
    `"${r.moduleName.replace(/"/g, '""')}"`,
    `"${r.partName.replace(/"/g, '""')}"`,
    `"${PART_ROLE_LABELS[r.role]?.label || r.role}"`,
    `"${MATERIAL_SPECS[r.material]?.shortName || r.material}"`,
    r.cutLength,
    r.cutWidth,
    r.thickness,
    r.quantity,
    r.edges.l1 === 'none' ? '-' : r.edges.l1,
    r.edges.l2 === 'none' ? '-' : r.edges.l2,
    r.edges.w1 === 'none' ? '-' : r.edges.w1,
    r.edges.w2 === 'none' ? '-' : r.edges.w2,
    r.areaM2,
    r.edge04Meters,
    r.edge20Meters,
  ]);

  const bomContent = '\uFEFF' + [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n');
  const blob = new Blob([bomContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeName = project.name.replace(/[^a-zA-Z0-9_-]/g, '_') || 'raskroy';
  link.setAttribute('download', `${safeName}_raskroy_jadvali.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportProjectToJSON(project: FurnitureProject): void {
  const json = JSON.stringify(project, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeName = project.name.replace(/[^a-zA-Z0-9_-]/g, '_') || 'mebel_loyiha';
  link.setAttribute('download', `${safeName}.mebel3d.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function formatUZS(amount: number): string {
  return Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + " so'm";
}
