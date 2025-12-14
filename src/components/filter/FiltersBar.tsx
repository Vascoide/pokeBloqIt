import { useLocation } from "react-router-dom";
import { usePokemonTypes } from "../../hooks/usePokeQuery";
import TypeFilter from "./TypeFilter";

import type { Filters, ViewMode } from "../../types/filters";
import type { PokemonListItem } from "../../types/pokemon";

interface FiltersBarProps {
  dex: PokemonListItem[];
  filters: Filters;
  onChange: (filters: Filters) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenReleaseMany: () => void;
}

export default function FiltersBar({
  dex,
  filters,
  onChange,
  viewMode,
  onViewModeChange,
  onOpenReleaseMany,
}: FiltersBarProps) {
  const location = useLocation();
  const onPokedexRoute = location.pathname === "/pokedex";

  const update = <K extends keyof Filters>(
    key: K,
    value: Filters[K]
  ) => {
    onChange({ ...filters, [key]: value });
  };

  const {
    data: types = [],
    isLoading,
    error,
  } = usePokemonTypes();

  return (
    <div className="bg-white/10 border border-white/20 p-4 rounded-xl mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      {/* Left side – filters */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
        {/* Search */}
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
        <TypeFilter
          filters={filters}
          update={update}
          types={types}
        />

        {/* Reset */}
        <button
          className="px-3 py-2 bg-red-500 hover:bg-red-600 rounded text-white"
          onClick={() =>
            onChange({
              name: "",
              types: [],
              onlyCaught: false,
            })
          }
        >
          Reset
        </button>
      </div>

      {/* Right side – view mode */}
      <div className="flex gap-2 justify-end">
        {onPokedexRoute && (
          <button
            onClick={onOpenReleaseMany}
            disabled={dex.length <= 1}
            className="px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700 disabled:opacity-40"
          >
            Release Multiple
          </button>
        )}

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
