export interface PokemonType {
    name: string;
    url: string;
}

export interface PokemonTypeSlot {
  slot: number;
  type: PokemonType;
}

export interface PokemonListAPIItem {
    name: string;
    url: string;
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokemonData {
  height: number;
  weight: number;
  types: PokemonTypeSlot[];
  stats: PokemonStat[];
}

export interface PokemonListItem {
  name: string;
  id: number;
  data?: PokemonData | null;
  caughtAt?: number | null;
  note: string;
}
