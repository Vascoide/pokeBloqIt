import React, { useMemo } from "react";
import PokemonCard from "./PokemonCard";

export default function PokemonGrid({
  list,
  onOpen,
  onCatch,
  onRelease,
  filters,
}) {
  const filtered = useMemo(() => {
    return list.filter((pk) => {
      const nameMatch = pk.name
        .toLowerCase()
        .includes(filters.name.toLowerCase());

      // If type filter is enabled, we need type data
      const typeMatch = filters.type
        ? pk?.data?.types?.some((t) => t.type.name === filters.type)
        : true;

      return nameMatch && typeMatch;
    });
  }, [list, filters]);

  if (filtered.length === 0) {
    return (
      <div className="w-full flex justify-center py-12 text-center text-gray-300">
        No Pokémon match your filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {filtered.map((pk) => (
        <PokemonCard
          key={pk.name}
          pokemon={pk}
          onOpen={() => onOpen(pk)}
          onCatch={() => onCatch(pk)}
          onRelease={() => onRelease(pk.name)}
        />
      ))}
    </div>
  );
}
