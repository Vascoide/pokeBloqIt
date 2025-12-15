import { PokemonTypeName } from "../libs/helper";

export interface Filters {
  name: string;
  types: PokemonTypeName[];
  onlyCaught?: boolean;
}

export type ViewMode = "grid" | "table";
