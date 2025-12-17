import { useEffect, useState, useCallback } from "react";
import { getDB, POKE_STORE } from "../libs/idb";
import type { PokemonListItem, PokemonData } from "../types/pokemon";

/* ------------------------------------------------------------------ */
/* Hook */
/* ------------------------------------------------------------------ */

export function useDex() {
  const [dex, setDex] = useState<PokemonListItem[]>([]);
  const [ready, setReady] = useState(false);

  /* Load dex on mount */
  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const db = await getDB();
      const all = await db.getAll(POKE_STORE);

      if (!cancelled) {
        setDex(all);
        setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /* ------------------------------------------------------------------ */
  /* Actions */
  /* ------------------------------------------------------------------ */

  const catchPokemon = useCallback(
    async ({
      id,
      name,
      data,
    }: {
      id: number;
      name: string;
      data?: PokemonData | null;
    }) => {
      const db = await getDB();
      const existing = await db.get(POKE_STORE, name);

      const entry: PokemonListItem = existing ?? {
        id,
        name,
        caughtAt: Date.now(),
        note: "",
        data: {
          height: data?.height ?? 0,
          weight: data?.weight ?? 0,
          types: data?.types ?? [],
          stats: data?.stats ?? [],
        },
      };

      await db.put(POKE_STORE, entry);

      setDex((prev) => {
        const filtered = prev.filter((p) => p.name !== name);
        return [...filtered, entry].sort((a, b) => a.id - b.id);
      });
    },
    []
  );

  const releasePokemon = useCallback(async (name: string) => {
    const db = await getDB();
    await db.delete(POKE_STORE, name);
    setDex((prev) => prev.filter((p) => p.name !== name));
  }, []);

  const releaseMany = useCallback(async (names: string[] = []) => {
    const db = await getDB();

    for (const name of names) {
      await db.delete(POKE_STORE, name);
    }

    setDex((prev) => prev.filter((p) => !names.includes(p.name)));
  }, []);

  const updateNote = useCallback(async (name: string, note: string) => {
    const db = await getDB();
    const entry = await db.get(POKE_STORE, name);

    if (!entry) return;

    const updated: PokemonListItem = { ...entry, note };
    await db.put(POKE_STORE, updated);

    setDex((prev) => prev.map((p) => (p.name === name ? updated : p)));
  }, []);

  /* ------------------------------------------------------------------ */
  /* Derived helpers */
  /* ------------------------------------------------------------------ */

  return {
    ready,
    dex,

    caughtNames: dex.map((d) => d.name),

    getEntry: (name: string) => dex.find((d) => d.name === name),

    isCaught: (name: string) => dex.some((d) => d.name === name),

    // actions
    catchPokemon,
    releasePokemon,
    releaseMany,
    updateNote,
  };
}
