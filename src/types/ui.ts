import type { PokemonListItem } from "./pokemon";

export type SortKey = "id" | "name" | "height" | "weight" | "type" | "caughtAt";
export type SortDir = "asc" | "desc";

export interface PokemonListViewProps {
  items: PokemonListItem[];
  onOpen: (pokemon: PokemonListItem) => void;
  onCatch: (pokemon: PokemonListItem) => void;
  onRelease: (name: string) => void;
}

export interface PokemonTableViewProps extends PokemonListViewProps {
  sortBy: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}
