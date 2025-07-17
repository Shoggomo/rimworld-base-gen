import { useState } from "react";
import type { BuildingTemplate } from "../types";

interface BuildingEditorProps {
  buildings: BuildingTemplate[];
  onBuildingsChange: (buildings: BuildingTemplate[]) => void;
}

const BUILDING_COLORS = [
  "#8B4513", // saddle brown (wood/buildings)
  "#A0522D", // sienna (wood structures)
  "#696969", // dim gray (stone/metal)
  "#708090", // slate gray (steel)
  "#2F4F4F", // dark slate gray (advanced materials)
  "#556B2F", // dark olive green (nature/farming)
  "#8FBC8F", // dark sea green (hydroponics)
  "#CD853F", // peru (natural materials)
];

export default function BuildingEditor({
  buildings,
  onBuildingsChange,
}: BuildingEditorProps) {
  const [newBuilding, setNewBuilding] = useState<Omit<BuildingTemplate, "id">>({
    name: "",
    shape: "rectangle",
    width: 8,
    height: 8,
    color: BUILDING_COLORS[0],
  });

  const addBuilding = () => {
    if (!newBuilding.name.trim()) return;

    const building: BuildingTemplate = {
      ...newBuilding,
      id: `building-${Date.now()}`,
    };

    onBuildingsChange([...buildings, building]);
    setNewBuilding({
      name: "",
      shape: "rectangle",
      width: 8,
      height: 8,
      color: BUILDING_COLORS[0],
    });
  };

  const removeBuilding = (id: string) => {
    onBuildingsChange(buildings.filter((building) => building.id !== id));
  };

  return (
    <div className="bg-rw-surface-900 border border-rw-surface-600 rounded-lg p-2 space-y-2">
      <h2 className="text-base font-bold text-rw-surface-100">
        Building Editor
      </h2>
      <p className="text-xs text-rw-surface-300">
        Create and manage buildings for your base layout
      </p>

      {/* Add New Building */}
      <div className="bg-rw-surface-800 rounded-lg p-2 space-y-2">
        <h3 className="text-sm font-semibold text-rw-surface-100">
          Add New Building
        </h3>

        <div className="grid grid-cols-2 gap-1">
          <input
            type="text"
            value={newBuilding.name}
            onChange={(e) =>
              setNewBuilding({ ...newBuilding, name: e.target.value })
            }
            className="px-2 py-1 bg-rw-surface-700 border border-rw-surface-500 rounded text-rw-surface-100 focus:outline-none focus:ring-1 focus:ring-rw-surface-400 text-xs"
            placeholder="Building name"
          />

          <select
            value={newBuilding.shape}
            onChange={(e) =>
              setNewBuilding({
                ...newBuilding,
                shape: e.target.value as "circle" | "rectangle",
              })
            }
            className="px-2 py-1 bg-rw-surface-700 border border-rw-surface-500 rounded text-rw-surface-100 focus:outline-none focus:ring-1 focus:ring-rw-surface-400 text-xs"
          >
            <option value="rectangle">⬜ Rectangle</option>
            <option value="circle">⭕ Circle</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-1">
          <input
            type="number"
            value={newBuilding.width}
            onChange={(e) =>
              setNewBuilding({
                ...newBuilding,
                width: Math.max(3, parseInt(e.target.value) || 3),
              })
            }
            className="px-2 py-1 bg-rw-surface-700 border border-rw-surface-500 rounded text-rw-surface-100 focus:outline-none focus:ring-1 focus:ring-rw-surface-400 text-xs"
            min="3"
            max="30"
            placeholder="Width"
          />

          {newBuilding.shape === "rectangle" && (
            <input
              type="number"
              value={newBuilding.height}
              onChange={(e) =>
                setNewBuilding({
                  ...newBuilding,
                  height: Math.max(3, parseInt(e.target.value) || 3),
                })
              }
              className="px-2 py-1 bg-rw-surface-700 border border-rw-surface-500 rounded text-rw-surface-100 focus:outline-none focus:ring-1 focus:ring-rw-surface-400 text-xs"
              min="3"
              max="30"
              placeholder="Height"
            />
          )}
        </div>

        <div className="grid grid-cols-4 gap-1">
          {BUILDING_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setNewBuilding({ ...newBuilding, color })}
              className={`w-6 h-6 rounded border transition-all hover:scale-105 ${
                newBuilding.color === color
                  ? "border-rw-surface-200 ring-1 ring-rw-surface-400"
                  : "border-rw-surface-600 hover:border-rw-surface-400"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        <button
          onClick={addBuilding}
          disabled={!newBuilding.name.trim()}
          className="w-full py-1 px-2 text-xs font-medium bg-rw-surface-600 text-rw-surface-100 border border-rw-surface-500 rounded hover:bg-rw-surface-500 transition-colors disabled:opacity-50"
        >
          ➕ Add Building
        </button>
      </div>

      {/* Existing Buildings */}
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-rw-surface-100">
          Buildings ({buildings.length})
        </h3>
        {buildings.length === 0 ? (
          <div className="text-center py-2 text-rw-surface-300">
            <div className="text-lg mb-1">�️</div>
            <p className="text-xs">No buildings added yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {buildings.map((building) => (
              <div
                key={building.id}
                className="bg-rw-surface-800 rounded p-2 flex items-center justify-between hover:bg-rw-surface-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded border border-rw-surface-600 flex-shrink-0"
                    style={{ backgroundColor: building.color }}
                  />
                  <div>
                    <div className="text-rw-surface-100 font-medium text-xs">
                      {building.name}
                    </div>
                    <div className="text-rw-surface-300 text-xs">
                      {building.shape === "circle"
                        ? `⭕ ${building.width}`
                        : `⬜ ${building.width}×${building.height}`}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeBuilding(building.id)}
                  className="text-rw-surface-300 hover:text-rw-error transition-colors p-1 text-xs bg-transparent border-none"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
