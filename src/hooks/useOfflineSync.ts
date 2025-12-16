import { useEffect } from "react";
import { clearOfflineActions, getOfflineActions } from "../libs/offlineQueue";
import { useDex } from "./useDex";
import type { OfflineAction } from "../types/offline";
import { queryClient } from "../queryClient";
import { fetchPokemon } from "./usePokeQuery";
import { savePokemonData } from "../libs/pokemonData";

export function useOfflineSync(dex: ReturnType<typeof useDex>) {
  useEffect(() => {
    async function sync() {
      const actions: OfflineAction[] = await getOfflineActions();

      for (const action of actions) {
        switch (action.type) {
          case "CATCH": {
            const data = await queryClient.ensureQueryData({
              queryKey: ["pokemon", action.pokemonId],
              queryFn: () => fetchPokemon(action.pokemonId),
            });

            await savePokemonData(action.pokemonId, data);

            await dex.catchPokemon({
              id: action.pokemonId,
              name: action.pokemonName,
              data,
            });
            break;
          }

          case "RELEASE": {
            await dex.releasePokemon(action.pokemonName);
            break;
          }

          case "NOTE": {
            await dex.updateNote(action.pokemonName, action.note);
            break;
          }
        }
      }

      await clearOfflineActions();
    }

    const handleOnline = () => {
      sync().catch(console.error);
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [dex]);
}
