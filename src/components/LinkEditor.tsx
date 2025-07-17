import { useState } from "react";
import type { BuildingTemplate, BuildingLink } from "../types";

interface LinkEditorProps {
  buildings: BuildingTemplate[];
  links: BuildingLink<string>[];
  onLinksChange: (links: BuildingLink<string>[]) => void;
}

export default function LinkEditor({
  buildings,
  links,
  onLinksChange,
}: LinkEditorProps) {
  const [newLink, setNewLink] = useState({
    source: "",
    target: "",
    strength: 5,
  });

  const addLink = () => {
    if (!newLink.source || !newLink.target || newLink.source === newLink.target)
      return;

    // Check if link already exists
    const linkExists = links.some(
      (link) =>
        (link.source === newLink.source && link.target === newLink.target) ||
        (link.source === newLink.target && link.target === newLink.source)
    );

    if (linkExists) return;

    const link: BuildingLink<string> = {
      source: newLink.source,
      target: newLink.target,
      strength: newLink.strength,
    };

    onLinksChange([...links, link]);
    setNewLink({
      source: "",
      target: "",
      strength: 5,
    });
  };

  const removeLink = (index: number) => {
    onLinksChange(links.filter((_, i) => i !== index));
  };

  const updateLinkStrength = (index: number, strength: number) => {
    const updatedLinks = links.map((link, i) =>
      i === index ? { ...link, strength } : link
    );
    onLinksChange(updatedLinks);
  };

  const getBuildingName = (buildingId: string) => {
    return (
      buildings.find((building) => building.id === buildingId)?.name ||
      buildingId
    );
  };

  const getStrengthLabel = (strength: number) => {
    if (strength >= 8) return "Very Strong";
    if (strength >= 6) return "Strong";
    if (strength >= 4) return "Medium";
    if (strength >= 2) return "Weak";
    return "Very Weak";
  };

  const getStrengthColor = (strength: number) => {
    if (strength >= 8) return "text-rw-error";
    if (strength >= 6) return "text-orange-400";
    if (strength >= 4) return "text-yellow-400";
    if (strength >= 2) return "text-green-400";
    return "text-rw-surface-400";
  };

  return (
    <div className="bg-rw-surface-900 border border-rw-surface-600 rounded-lg p-2 space-y-2">
      <h2 className="text-base font-bold text-rw-surface-100">
        Building Connections
      </h2>
      <p className="text-xs text-rw-surface-300">
        Define relationships between buildings to control their proximity
      </p>

      {/* Add New Link */}
      <div className="bg-rw-surface-800 rounded-lg p-2 space-y-2">
        <h3 className="text-sm font-semibold text-rw-surface-100">Add Connection</h3>

        <div className="grid grid-cols-2 gap-1">
          <select
            value={newLink.source}
            onChange={(e) => setNewLink({ ...newLink, source: e.target.value })}
            className="px-2 py-1 bg-rw-surface-700 border border-rw-surface-500 rounded text-rw-surface-100 focus:outline-none focus:ring-1 focus:ring-rw-surface-400 text-xs"
          >
            <option value="">From...</option>
            {buildings.map((building) => (
              <option key={building.id} value={building.id}>
                {building.name}
              </option>
            ))}
          </select>

          <select
            value={newLink.target}
            onChange={(e) => setNewLink({ ...newLink, target: e.target.value })}
            className="px-2 py-1 bg-rw-surface-700 border border-rw-surface-500 rounded text-rw-surface-100 focus:outline-none focus:ring-1 focus:ring-rw-surface-400 text-xs"
          >
            <option value="">To...</option>
            {buildings.map((building) => (
              <option
                key={building.id}
                value={building.id}
                disabled={building.id === newLink.source}
              >
                {building.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={addLink}
          disabled={
            !newLink.source ||
            !newLink.target ||
            newLink.source === newLink.target
          }
          className="w-full py-1 px-2 text-xs font-medium bg-rw-surface-600 text-rw-surface-100 border border-rw-surface-500 rounded hover:bg-rw-surface-500 transition-colors disabled:opacity-50"
        >
          ➕ Add Connection
        </button>
      </div>

      {/* Existing Links */}
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-rw-surface-100">
          Connections ({links.length})
        </h3>
        <p className="text-xs text-rw-surface-300">
          Adjust strength: higher values = closer placement
        </p>
        {links.length === 0 ? (
          <div className="text-center py-2 text-rw-surface-300">
            <div className="text-lg mb-1">🔗</div>
            <p className="text-xs">No connections added yet</p>
          </div>
        ) : (
          <div className="space-y-1">
            {links.map((link, index) => (
              <div key={index} className="bg-rw-surface-800 rounded p-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-rw-surface-100 font-medium text-xs">
                      {getBuildingName(link.source)} ↔{" "}
                      {getBuildingName(link.target)}
                    </span>
                    <span
                      className={`text-xs ${getStrengthColor(link.strength)}`}
                    >
                      {getStrengthLabel(link.strength)}
                    </span>
                  </div>
                  <button
                    onClick={() => removeLink(index)}
                    className="text-rw-surface-300 hover:text-rw-error transition-colors text-xs bg-transparent border-none"
                  >
                    ✕
                  </button>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={link.strength}
                  onChange={(e) =>
                    updateLinkStrength(index, parseInt(e.target.value))
                  }
                  className="w-full mt-1 h-2"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
