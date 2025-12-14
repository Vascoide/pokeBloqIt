import { useState, useEffect, useMemo } from "react";
import PokemonGrid from "./PokemonGrid";
import PokemonTable from "./PokemonTable";
import Pagination from "./Pagination";

import type { PokemonListItem } from "../types/pokemon";
import type { Filters } from "../types/filters";
import type { ViewMode } from "../types/filters";

interface PokedexProps {
  isLoading: boolean;
  combinedList: PokemonListItem[];
  viewMode: ViewMode;
  onOpen: (pokemon: PokemonListItem) => void;
  onCatch: (pokemon: PokemonListItem) => void;
  onRelease: (name: string) => void;
  filters: Filters;
}

export default function Pokedex({
  isLoading,
  combinedList,
  viewMode,
  onOpen,
  onCatch,
  onRelease,
  filters,
}: PokedexProps) {
  const [page, setPage] = useState<number>(1);
  const pageSize = 20;

  /* ---------------- Filtering ---------------- */
  const filtered = useMemo(() => {
    return combinedList.filter((pokemon) => {
      // Name filter (case-insensitive)
      if (
        filters.name &&
        !pokemon.name.toLowerCase().includes(filters.name.toLowerCase())
      ) {
        return false;
      }

      // Type filter (multi-select)
      if (filters.types.length) {
        const pokemonTypes =
          pokemon.data?.types?.map((t) => t.type.name) ?? [];

        const matchesAny = filters.types.some((type) =>
          pokemonTypes.includes(type)
        );

        if (!matchesAny) return false;
      }

      return true;
    });
  }, [combinedList, filters]);

  /* ---------------- Pagination ---------------- */
  const start = (page - 1) * pageSize;
  const paginatedList = filtered.slice(start, start + pageSize);

  /* ---------------- Reset page on changes ---------------- */
  useEffect(() => {
    setPage(1);
  }, [filters, viewMode, combinedList]);

  /* ---------------- Loading ---------------- */
  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-12 text-center text-gray-300">
        <p>Loading Pokémon...</p>
      </div>
    );
  }

  /* ---------------- Render ---------------- */
  return (
    <div className="w-full max-w-6xl mx-auto">
      {viewMode === "grid" ? (
        <PokemonGrid
          items={paginatedList}
          onOpen={onOpen}
          onCatch={onCatch}
          onRelease={onRelease}
        />
      ) : (
        <PokemonTable
          items={paginatedList}
          onOpen={onOpen}
          onCatch={onCatch}
          onRelease={onRelease}
        />
      )}

      <Pagination
        page={page}
        pageSize={pageSize}
        total={filtered.length}
        onPageChange={setPage}
      />
    </div>
  );
}
