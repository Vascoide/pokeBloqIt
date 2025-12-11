import React, { useState, useEffect } from "react";
import PokemonGrid from "./PokemonGrid";
import PokemonTable from "./PokemonTable";
import Pagination from "./Pagination";

export default function Pokedex({
  isLoading,
  combinedList,
  viewMode,
  onOpen,
  onCatch,
  onRelease,
  filters,
}) {
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // --- Filtering logic centralized here ---
  const applyFilters = (list, filters) => {
    return list.filter((pokemon) => {
      if (filters.name && !pokemon.name.includes(filters.name.toLowerCase())) {
        return false;
      }

      if (filters.types?.length) {
        const pokemonTypes =
          pokemon?.data?.types?.map((t) => t.type.name) || [];

        const matchesAll = filters.types.some((fType) =>
          pokemonTypes.includes(fType)
        );

        if (!matchesAll) return false;
      }

      return true;
    });
  };

  const filtered = applyFilters(combinedList, filters);

  const start = (page - 1) * pageSize;
  const paginatedList = filtered.slice(start, start + pageSize);

  useEffect(() => {
    setPage(1);
  }, [filters, viewMode, combinedList]);

  if (isLoading)
    return (
      <div className="w-full flex justify-center py-12 text-center text-gray-300">
        <p>Loading Pokémon...</p>
      </div>
    );

  return (
    <div className="w-full max-w-6xl mx-auto">
      {viewMode === "grid" ? (
        <PokemonGrid
          list={paginatedList}
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
