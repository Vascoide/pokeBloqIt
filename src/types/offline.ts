export type OfflineAction =
  | {
      type: "CATCH";
      pokemonId: number;
      pokemonName: string;
      timestamp: number;
    }
  | {
      type: "RELEASE";
      pokemonName: string;
      timestamp: number;
    }
  | {
      type: "NOTE";
      pokemonName: string;
      note: string;
      timestamp: number;
    };
