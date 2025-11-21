// src/hooks/useDex.js
import { useEffect, useState, useCallback } from "react";
import { openDB } from "idb";

const DB_NAME = "pokedex-db";
const STORE_NAME = "pokemon";

async function getDB() {
  return await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "name" });
        store.createIndex("name", "name");
      }
    },
  });
}

export function useDex() {
  const [dex, setDex] = useState([]);
  const [ready, setReady] = useState(false);

  // Load on mount
  useEffect(() => {
    (async () => {
      const db = await getDB();
      const all = await db.getAll(STORE_NAME);
      setDex(all);
      setReady(true);
    })();
  }, []);

  // Add Pokémon to Dex
  const catchPokemon = useCallback(async ({ id, name, data }) => {
    const db = await getDB();
    const existing = await db.get(STORE_NAME, name);

    const entry = existing || {
      id,
      name,
      caughtAt: Date.now(),
      note: "",
      data: {
        height: data?.height || 0,
        weight: data?.weight || 0,
        types: data?.types || [],
        stats: data?.stats || [],
      },
    };

    await db.put(STORE_NAME, entry);
    setDex((prev) => {
      const filtered = prev.filter((p) => p.name !== name);
      return [...filtered, entry];
    });
  }, []);

  // Remove Pokémon
  const releasePokemon = useCallback(async (name) => {
    const db = await getDB();
    await db.delete(STORE_NAME, name);
    setDex((prev) => prev.filter((p) => p.name !== name));
  }, []);

  // Remove multiple Pokémon
  const releaseMany = useCallback(async (names = []) => {
    const db = await getDB();
    for (const n of names) await db.delete(STORE_NAME, n);
    setDex((prev) => prev.filter((p) => !names.includes(p.name)));
  }, []);

  // Add or update a note
  const updateNote = useCallback(async (name, note) => {
    const db = await getDB();
    const entry = await db.get(STORE_NAME, name);
    if (!entry) return;

    const updated = { ...entry, note };
    await db.put(STORE_NAME, updated);

    setDex((prev) => prev.map((p) => (p.name === name ? updated : p)));
  }, []);

  return {
    ready,
    dex,
    caughtNames: dex.map((d) => d.name),
    getEntry: (name) => dex.find((d) => d.name === name),
    isCaught: (name) => dex.some((d) => d.name === name),

    // actions
    catchPokemon,
    releasePokemon,
    releaseMany,
    updateNote,
  };
}
