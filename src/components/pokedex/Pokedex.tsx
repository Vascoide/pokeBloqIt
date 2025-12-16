import { useMemo, useState } from "react";
import PokemonGrid from "./PokemonGrid";
import PokemonTable from "./PokemonTable";
import Pagination from "./Pagination";

import type { PokemonListItem } from "../../types/pokemon";
import type { Filters, ViewMode } from "../../types/filters";
import { SortDir, SortKey } from "../../types/ui";

interface PokedexProps {
  isLoading: boolean;
  items: PokemonListItem[];
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

  /* ---------------- Sorting ---------------- */

  const [sortBy, setSortBy] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir("asc");
    }
  };

  const hasValue = (pokemon: PokemonListItem, key: SortKey): boolean => {
    switch (key) {
      case "height":
        return pokemon.data?.height != null;
      case "weight":
        return pokemon.data?.weight != null;
      case "type":
        return (pokemon.data?.types?.length ?? 0) > 0;
      case "caughtAt":
        return pokemon.caughtAt != null;
      default:
        return true; // id, name, caughtAt always considered present
    }
  };

  const sorted = useMemo(() => {
    const extractValue = (
      pokemon: PokemonListItem,
      key: SortKey
    ): string | number | null => {
      switch (key) {
        case "id":
          return pokemon.id;
        case "name":
          return pokemon.name;
        case "height":
          return pokemon.data?.height ?? null;
        case "weight":
          return pokemon.data?.weight ?? null;
        case "type":
          return (
            pokemon.data?.types
              ?.map((t) => t.type.name)
              .join(" ")
              .toLowerCase() ?? null
          );
        case "caughtAt":
          return pokemon.caughtAt ?? null;
      }
    };

    // No sorting for grid view
    if (viewMode === "grid") return filtered;

    return [...filtered].sort((a, b) => {
      const aHas = hasValue(a, sortBy);
      const bHas = hasValue(b, sortBy);

      // 1️⃣ Always push missing values to the bottom
      if (aHas && !bHas) return -1;
      if (!aHas && bHas) return 1;

      // 2️⃣ If both missing, consider equal
      if (!aHas && !bHas) return 0;

      // 3️⃣ Normal comparison
      const valA = extractValue(a, sortBy)!;
      const valB = extractValue(b, sortBy)!;

      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortBy, sortDir]);

  /* ---------------- Pagination ---------------- */

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

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
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={toggleSort}
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
