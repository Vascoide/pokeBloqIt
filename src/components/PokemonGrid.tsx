import PokemonCard from "./PokemonCard";
import type { PokemonListViewProps } from "../types/ui";

export default function PokemonGrid({
  items,
  onOpen,
  onCatch,
  onRelease,
}: PokemonListViewProps) {
  if (items.length === 0) {
    return (
      <div className="w-full flex justify-center py-12 text-center text-gray-300">
        No Pokémon match your filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {items.map((pk) => (
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
