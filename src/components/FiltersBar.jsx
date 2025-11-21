import React from "react";
import { usePokemonTypes } from "../hooks/usePokeQuery";
import { capitalize } from "../libs/helper";

export default function FiltersBar({
  filters,
  onChange,
  viewMode,
  onViewModeChange,
}) {
  const update = (key, value) => {
    onChange({ ...filters, [key]: value });
  };

  const { data: types = [], isLoading, error } = usePokemonTypes();

  return (
    <div className="bg-white/10 border border-white/20 p-4 rounded-xl mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      {/* Left side – filters */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
        {/* Search by name */}
        <div className="flex flex-col">
          <label className="text-sm mb-1">Search</label>
          <input
            type="text"
            value={filters.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Search by name..."
            className="px-3 py-2 rounded bg-black/20 border border-white/10"
          />
        </div>

        {/* Type filter */}
        <div className="flex flex-col">
          <label className="text-sm mb-1">Type</label>
          <select
            value={filters.type}
            onChange={(e) => update("type", e.target.value)}
            className="px-3 py-2 rounded bg-black/20 border border-white/10"
          >
            <option value="">All Types</option>
            {types?.map((t) => (
              <option key={t.name} value={t.name}>
                {capitalize(t.name)}
              </option>
            ))}
          </select>
        </div>

        {/* Reset */}
        <button
          className="px-3 py-2 bg-red-500 hover:bg-red-600 rounded text-white text-sm h-fit"
          onClick={() => onChange({ name: "", type: "", onlyCaught: false })}
        >
          Reset
        </button>
      </div>

      {/* Right side – view mode */}
      <div className="flex gap-2 justify-end">
        <button
          className={`px-3 py-2 rounded text-sm border ${
            viewMode === "grid"
              ? "bg-blue-500 border-blue-400"
              : "bg-black/20 border-white/20"
          }`}
          onClick={() => onViewModeChange("grid")}
        >
          Grid
        </button>

        <button
          className={`px-3 py-2 rounded text-sm border ${
            viewMode === "table"
              ? "bg-blue-500 border-blue-400"
              : "bg-black/20 border-white/20"
          }`}
          onClick={() => onViewModeChange("table")}
        >
          Table
        </button>
      </div>
    </div>
  );
}
