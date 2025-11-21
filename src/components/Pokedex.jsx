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

  const start = (page - 1) * pageSize;
  const paginatedList = combinedList.slice(start, start + pageSize);

  useEffect(() => {
    setPage(1);
  }, [filters, viewMode, combinedList]);

  if (isLoading) return <p>Loading Pokémon...</p>;

  return (
    <div className="w-full max-w-6xl mx-auto">
      {viewMode === "grid" ? (
        <PokemonGrid
          list={paginatedList}
          onOpen={onOpen}
          onCatch={onCatch}
          onRelease={onRelease}
          filters={filters}
        />
      ) : (
        <PokemonTable
          items={paginatedList}
          onOpen={onOpen}
          onCatch={onCatch}
          onRelease={onRelease}
          filters={filters}
        />
      )}

      <Pagination
        page={page}
        pageSize={pageSize}
        total={combinedList.length}
        onPageChange={setPage}
      />
    </div>
  );
}
