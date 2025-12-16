import { useMemo } from "react";
import PokemonGrid from "./PokemonGrid";
import PokemonTable from "./PokemonTable";
import Pagination from "./Pagination";

import type { PokemonListItem } from "../types/pokemon";
import type { Filters, ViewMode } from "../types/filters";

interface PokedexProps {
  isLoading: boolean;
  items: PokemonListItem[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  viewMode: ViewMode;
  onOpen: (pokemon: PokemonListItem) => void;
  onCatch: (pokemon: PokemonListItem) => void;
  onRelease: (name: string) => void;
  filters: Filters;
}

export default function Pokedex({
  isLoading,
  items,
  total,
  page,
  pageSize,
  onPageChange,
  viewMode,
  onOpen,
  onCatch,
  onRelease,
  filters,
}: PokedexProps) {
  /* ---------------- Filtering ---------------- */
  const filtered = useMemo(() => {
    return items.filter((pokemon) => {
      if (
        filters.name &&
        !pokemon.name.toLowerCase().includes(filters.name.toLowerCase())
      ) {
        return false;
      }

      if (filters.types.length) {
        const pokemonTypes = pokemon.data?.types?.map((t) => t.type.name) ?? [];

        const matchesAny = filters.types.some((type) =>
          pokemonTypes.includes(type)
        );

        if (!matchesAny) return false;
      }

      if (filters.onlyCaught && !pokemon.caughtAt) {
        return false;
      }

      return true;
    });
  }, [items, filters]);

  /* ---------------- Pagination ---------------- */
  const isClientPaginated = items.length === total;

  const paginatedItems = useMemo(() => {
    if (!isClientPaginated) {
      // Server-side pagination already applied
      return filtered;
    }

    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, isClientPaginated, page, pageSize]);

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
          items={paginatedItems}
          onOpen={onOpen}
          onCatch={onCatch}
          onRelease={onRelease}
        />
      ) : (
        <PokemonTable
          items={paginatedItems}
          onOpen={onOpen}
          onCatch={onCatch}
          onRelease={onRelease}
        />
      )}

      <Pagination
        page={page}
        pageSize={pageSize}
        total={filtered.length}
        onPageChange={onPageChange}
        isLoading={isLoading}
      />
    </div>
  );
}
