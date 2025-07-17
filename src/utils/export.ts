import type { BuildingTemplate, BuildingLink } from '../types';

export interface ExportData {
  buildings: BuildingTemplate[];
  links: BuildingLink<string>[];
  seed: number;
  timestamp: string;
  version: string;
}

export function exportLayout(buildings: BuildingTemplate[], links: BuildingLink<string>[], seed: number): void {
  const exportData: ExportData = {
    buildings,
    links,
    seed,
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

  const exportFileDefaultName = `rimworld-base-${new Date().toISOString().slice(0, 10)}.json`;

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

export function importLayout(file: File): Promise<ExportData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result === 'string') {
          const data = JSON.parse(result) as ExportData;
          resolve(data);
        } else {
          reject(new Error('Invalid file format'));
        }
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

export function generateShareableLink(buildings: BuildingTemplate[], links: BuildingLink<string>[], seed: number): string {
  const data = {
    buildings: buildings.map(building => ({
      id: building.id,
      name: building.name,
      shape: building.shape,
      width: building.width,
      height: building.height,
      color: building.color,
    })),
    links: links.map(link => ({
      source: link.source,
      target: link.target,
      strength: link.strength,
    })),
    seed,
  };

  const compressed = btoa(JSON.stringify(data));
  return `${window.location.origin}${window.location.pathname}?data=${compressed}`;
}

export function parseShareableLink(url: string): { buildings: BuildingTemplate[]; links: BuildingLink<string>[]; seed: number } | null {
  try {
    const urlObj = new URL(url);
    const dataParam = urlObj.searchParams.get('data');
    
    if (!dataParam) return null;

    const decompressed = atob(dataParam);
    const data = JSON.parse(decompressed);

    return {
      buildings: data.buildings,
      links: data.links,
      seed: data.seed || 0,
    };
  } catch (error) {
    console.error('Failed to parse shareable link:', error);
    return null;
  }
}
