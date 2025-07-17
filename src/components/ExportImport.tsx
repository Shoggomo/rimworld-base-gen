import { useState, useRef } from "react";
import type { BuildingTemplate, BuildingLink } from "../types";
import {
  exportLayout,
  importLayout,
  generateShareableLink,
  type ExportData,
} from "../utils/export";

interface ExportImportProps {
  buildings: BuildingTemplate[];
  links: BuildingLink<string>[];
  seed: number;
  onImport: (
    buildings: BuildingTemplate[],
    links: BuildingLink<string>[],
    seed: number
  ) => void;
}

export default function ExportImport({
  buildings,
  links,
  seed,
  onImport,
}: ExportImportProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shareableLink, setShareableLink] = useState("");
  const [showShareLink, setShowShareLink] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    exportLayout(buildings, links, seed);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const data: ExportData = await importLayout(file);
      onImport(data.buildings, data.links, data.seed);

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      alert("Failed to import layout. Please check the file format.");
      console.error("Import error:", error);
    }
  };

  const handleGenerateLink = () => {
    const link = generateShareableLink(buildings, links, seed);
    setShareableLink(link);
    setShowShareLink(true);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink);
      alert("Link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  return (
    <div className="bg-rw-surface-900 border border-rw-surface-600 rounded-lg p-2">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-base font-bold text-rw-surface-100">Export & Share</h2>
          <p className="text-xs text-rw-surface-300">
            Save and share your base layouts
          </p>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-rw-surface-300 hover:text-rw-surface-100 transition-colors text-xs bg-transparent border-none"
        >
          {isExpanded ? "▲" : "▼"}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-2">
          {/* Export/Import */}
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={handleExport}
              disabled={buildings.length === 0}
              className="text-xs py-1 px-2 bg-rw-surface-600 text-rw-surface-100 border border-rw-surface-500 rounded hover:bg-rw-surface-500 transition-colors disabled:opacity-50"
            >
              📥 Download
            </button>
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-xs py-1 px-2 bg-rw-surface-600 text-rw-surface-100 border border-rw-surface-500 rounded hover:bg-rw-surface-500 transition-colors"
              >
                📤 Upload
              </button>
            </div>
          </div>

          {/* Share Link */}
          <div className="space-y-1">
            <button
              onClick={handleGenerateLink}
              disabled={buildings.length === 0}
              className="w-full text-xs py-1 px-2 bg-rw-surface-600 text-rw-surface-100 border border-rw-surface-500 rounded hover:bg-rw-surface-500 transition-colors disabled:opacity-50"
            >
              🔗 Share Link
            </button>

            {showShareLink && (
              <div className="bg-rw-surface-800 rounded p-1 space-y-1">
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={shareableLink}
                    readOnly
                    className="flex-1 px-1 py-1 bg-rw-surface-700 border border-rw-surface-500 rounded text-rw-surface-100 text-xs"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-1 py-1 text-xs bg-rw-surface-600 text-rw-surface-100 border border-rw-surface-500 rounded hover:bg-rw-surface-500 transition-colors"
                  >
                    📋
                  </button>
                </div>
                <p className="text-rw-surface-300 text-xs">
                  Share this link to let others view your layout.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
