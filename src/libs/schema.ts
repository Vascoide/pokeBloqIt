import type { DBSchema } from "idb";
import type { PokemonListItem, PokemonData } from "../types/pokemon";
import type { OfflineAction } from "../types/offline";

/**
 * IndexedDB schema for PokéBloqIt
 */
export interface PokeBloqitDB extends DBSchema {
  dex: {
    key: string; // pokemon name
    value: PokemonListItem;
    indexes: {
      caughtAt: number;
    };
  };

  "api-cache": {
    key: string;
    value: {
      key: string;
      data: unknown;
      updatedAt: number;
    };
  };

  "offline-actions": {
    key: number;
    value: OfflineAction;
  };

  "pokemon-data": {
    key: number; // pokemon id
    value: {
      id: number;
      data: PokemonData;
    };
  };
}
