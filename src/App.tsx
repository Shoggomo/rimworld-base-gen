import { useMemo, useState, useEffect } from "react";
import type { BuildingTemplate, BuildingNode, BuildingLink } from "./types";
import { createPolygons } from "./utils/geometry";
import { parseShareableLink } from "./utils/export";
import { getDefaultPresetConfiguration } from "./data/presets";
import BuildingEditor from "./components/BuildingEditor";
import LinkEditor from "./components/LinkEditor";
import BaseGenerator from "./components/BaseGenerator";
import PresetSelector from "./components/PresetSelector";
import ExportImport from "./components/ExportImport";

// Get the first preset configuration as default
const defaultPreset = getDefaultPresetConfiguration();

export default function App() {
  const [buildings, setBuildings] = useState<BuildingTemplate[]>(
    defaultPreset.buildings
  );
  const [links, setLinks] = useState<BuildingLink<string>[]>(
    defaultPreset.links
  );
  const [fastGeneration, setFastGeneration] = useState(true);
  const [seed, setSeed] = useState<number>(Math.floor(Math.random() * 1000000));
  const [regenerateKey, setRegenerateKey] = useState(0);

  // Load from URL parameters on app initialization
  useEffect(() => {
    const urlParams = window.location.search;
    if (urlParams) {
      const parsedData = parseShareableLink(window.location.href);
      if (parsedData) {
        setBuildings(parsedData.buildings);
        setLinks(parsedData.links);
        setSeed(parsedData.seed);
        setRegenerateKey((prev) => prev + 1);
      }
    }
  }, []);

  const buildingNodes = useMemo(() => {
    return buildings.map((building): BuildingNode => {
      const { outerPolygon, innerPolygon } = createPolygons(
        building.shape,
        building.width,
        building.height
      );
      return {
        ...building,
        polygon: outerPolygon,
        innerPolygon: innerPolygon,
        x: 0,
        y: 0,
        roundX: 0,
        roundY: 0,
      };
    });
  }, [buildings]);

  // Auto-generate weak links between all buildings to prevent unnecessary spacing
  const allLinks = useMemo(() => {
    const autoLinks: BuildingLink<string>[] = [];

    buildings.forEach((buildingA, i) => {
      buildings.forEach((buildingB, j) => {
        if (i >= j) return; // avoid duplicates and self-links

        const linkExists = links.some(
          (link) =>
            (link.source === buildingA.id && link.target === buildingB.id) ||
            (link.source === buildingB.id && link.target === buildingA.id)
        );

        if (!linkExists) {
          autoLinks.push({
            source: buildingA.id,
            target: buildingB.id,
            strength: 3,
          });
        }
      });
    });

    return [...links, ...autoLinks];
  }, [buildings, links]);

  const handleLoadPreset = (
    presetBuildings: BuildingTemplate[],
    presetLinks: BuildingLink<string>[]
  ) => {
    setBuildings(presetBuildings);
    setLinks(presetLinks);
    setRegenerateKey((prev) => prev + 1);
  };

  const handleAddPresetBuilding = (building: BuildingTemplate) => {
    setBuildings((prev) => [...prev, building]);
  };

  const handleImport = (
    importedBuildings: BuildingTemplate[],
    importedLinks: BuildingLink<string>[],
    importedSeed: number
  ) => {
    setBuildings(importedBuildings);
    setLinks(importedLinks);
    setSeed(importedSeed);
    setRegenerateKey((prev) => prev + 1);
  };

  const handleRegenerate = () => {
    setSeed(Math.floor(Math.random() * 1000000));
    setRegenerateKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-rw-primary-500 to-rw-primary-800 text-rw-primary-100">
      <div className="px-3 py-2">
        {/* Header */}
        <div className="text-center mb-2">
          <h1 className="text-2xl font-bold text-rw-primary-100 mb-1 text-shadow">
            RimWorld Base Generator
          </h1>
          <p className="text-rw-surface-300 text-xs">
            Generate distance optimized base layouts
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
          {/* Left Panel - Controls, Building Editor, Links, and Export */}
          <div className="lg:col-span-1 space-y-2">
            {/* Preset Selector */}
            <PresetSelector
              onLoadPreset={handleLoadPreset}
              onAddPresetBuilding={handleAddPresetBuilding}
            />

            <BuildingEditor
              buildings={buildings}
              onBuildingsChange={(newBuildings) => {
                setBuildings(newBuildings);
                setRegenerateKey((prev) => prev + 1);
              }}
            />
            <LinkEditor
              buildings={buildings}
              links={links}
              onLinksChange={(newLinks) => {
                setLinks(newLinks);
                setRegenerateKey((prev) => prev + 1);
              }}
            />

            {/* Controls */}
            <div className="bg-rw-surface-900 border border-rw-surface-600 rounded-lg p-2">
              <div className="flex flex-wrap gap-2 items-center justify-between">
                <div className="flex flex-wrap gap-3 items-center">
                  <label className="flex items-center gap-1 text-xs">
                    <input
                      type="checkbox"
                      checked={fastGeneration}
                      onChange={(e) => setFastGeneration(e.target.checked)}
                      className="w-3 h-3"
                    />
                    <span className="text-rw-surface-200">Fast Gen</span>
                  </label>
                  <label className="flex items-center gap-1 text-xs">
                    <span className="text-rw-surface-200">Seed:</span>
                    <input
                      type="text"
                      value={seed}
                      onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
                      className="w-20 px-1 py-0.5 bg-rw-surface-700 border border-rw-surface-500 rounded text-rw-surface-100 focus:outline-none focus:ring-1 focus:ring-rw-surface-400 text-xs"
                    />
                  </label>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={handleRegenerate}
                    className="text-xs py-1 px-2 bg-rw-surface-600 text-rw-surface-100 border border-rw-surface-500 rounded hover:bg-rw-surface-500 transition-colors"
                  >
                    🔄 Regenerate
                  </button>
                  <button
                    onClick={() => {
                      setBuildings([]);
                      setLinks([]);
                      setRegenerateKey((prev) => prev + 1);
                    }}
                    className="text-xs py-1 px-2 bg-rw-surface-600 text-rw-surface-100 border border-rw-surface-500 rounded hover:bg-rw-surface-500 transition-colors"
                  >
                    🗑️ Clear
                  </button>
                </div>
              </div>
            </div>

            <ExportImport
              buildings={buildings}
              links={links}
              seed={seed}
              onImport={handleImport}
            />
          </div>

          {/* Right Panel - Base Generator */}
          <div className="lg:col-span-2">
            <BaseGenerator
              key={regenerateKey}
              buildings={buildingNodes}
              links={allLinks}
              fastGeneration={fastGeneration}
              seed={seed}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
