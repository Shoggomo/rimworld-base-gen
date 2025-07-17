import { useState } from "react";
import type { BuildingTemplate, BuildingLink } from "../types";
import {
  RIMWORLD_BUILDING_PRESETS,
  RIMWORLD_PRESET_CONFIGURATIONS,
} from "../data/presets";

interface PresetSelectorProps {
  onLoadPreset: (
    buildings: BuildingTemplate[],
    links: BuildingLink<string>[]
  ) => void;
  onAddPresetBuilding: (building: BuildingTemplate) => void;
}

export default function PresetSelector({
  onLoadPreset,
  onAddPresetBuilding,
}: PresetSelectorProps) {
  const [selectedPreset, setSelectedPreset] = useState(
    Object.keys(RIMWORLD_PRESET_CONFIGURATIONS)[0]
  );
  const [showBuildingPresets, setShowBuildingPresets] = useState(false);

  const loadConfiguration = () => {
    if (!selectedPreset) return;

    const config =
      RIMWORLD_PRESET_CONFIGURATIONS[
        selectedPreset as keyof typeof RIMWORLD_PRESET_CONFIGURATIONS
      ];
    if (config) {
      onLoadPreset(config.buildings, config.links);
    }
  };

  const addPresetBuilding = (building: BuildingTemplate) => {
    const newBuilding = {
      ...building,
      id: `${building.id}-${Date.now()}`,
    };
    onAddPresetBuilding(newBuilding);
  };

  return (
    <div className="bg-rw-surface-900 border border-rw-surface-600 rounded-lg p-2 space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-rw-surface-100">Quick Start</h2>
        <button
          onClick={() => setShowBuildingPresets(!showBuildingPresets)}
          className="text-rw-surface-300 hover:text-rw-surface-100 transition-colors text-xs bg-transparent border-none"
        >
          {showBuildingPresets ? "▲" : "▼"} Templates
        </button>
      </div>

      {/* Configuration Presets */}
      <div className="space-y-1">
        <div className="grid grid-cols-2 gap-1">
          <select
            value={selectedPreset}
            onChange={(e) => setSelectedPreset(e.target.value)}
            className="px-2 py-1 bg-rw-surface-700 border border-rw-surface-500 rounded text-rw-surface-100 focus:outline-none focus:ring-1 focus:ring-rw-surface-400 text-xs"
          >
            <option value="">Select preset...</option>
            {Object.keys(RIMWORLD_PRESET_CONFIGURATIONS).map((preset) => (
              <option key={preset} value={preset}>
                {preset}
              </option>
            ))}
          </select>
          <button
            onClick={loadConfiguration}
            disabled={!selectedPreset}
            className="text-xs py-1 px-2 bg-rw-surface-600 text-rw-surface-100 border border-rw-surface-500 rounded hover:bg-rw-surface-500 transition-colors disabled:opacity-50"
          >
            Load
          </button>
        </div>

        {selectedPreset && (
          <div className="bg-rw-surface-800 rounded p-1">
            <p className="text-rw-surface-300 text-xs">
              {selectedPreset === "Basic Colony" &&
                "Essential buildings for a new colony."}
              {selectedPreset === "Industrial Base" &&
                "Production and research focused."}
              {selectedPreset === "Defensive Outpost" &&
                "Fortified defense layout."}
              {selectedPreset === "Self-Sufficient Farm" &&
                "Agricultural focus with food production."}
            </p>
          </div>
        )}
      </div>

      {/* Building Presets */}
      {showBuildingPresets && (
        <div className="space-y-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
            {RIMWORLD_BUILDING_PRESETS.map((building) => (
              <button
                key={building.id}
                onClick={() => addPresetBuilding(building)}
                className="flex items-center gap-1 p-1 bg-rw-surface-800 hover:bg-rw-surface-700 rounded transition-colors text-left"
              >
                <div
                  className="w-3 h-3 rounded border border-rw-surface-600 flex-shrink-0"
                  style={{ backgroundColor: building.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-rw-surface-100 font-medium text-xs truncate">
                    {building.name}
                  </div>
                  <div className="text-rw-surface-300 text-xs">
                    {building.shape === "circle"
                      ? `⭕${building.width}`
                      : `⬜${building.width}×${building.height}`}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
