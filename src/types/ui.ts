import type { PokemonListItem } from "./pokemon";

export interface PokemonListViewProps {
  items: PokemonListItem[];
  onOpen: (pokemon: PokemonListItem) => void;
  onCatch: (pokemon: PokemonListItem) => void;
  onRelease: (name: string) => void;
}
