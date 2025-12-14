import { PokemonStatName } from "../libs/helper";
export interface PokemonType {
    name: string;
    url: string;
}

export interface PokemonTypeSlot {
  slot: number;
  type: PokemonType;
}

export interface PokemonAPIListItem {
    name: string;
    url: string;
}

export interface PokemonStat {
  base_stat: number;
  effort: number;
  stat: {
    name: PokemonStatName;
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
