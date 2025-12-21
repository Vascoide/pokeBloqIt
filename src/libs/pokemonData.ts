// src/libs/pokemonData.ts
import { getDB, POKE_DATA_STORE } from "./idb";
import type { PokemonData } from "../types/pokemon";

/* ------------------ Read ------------------ */

export async function getAllPokemonData(): Promise<
  Record<number, PokemonData>
> {
  const db = await getDB();
  const entries = await db.getAll(POKE_DATA_STORE);

  return Object.fromEntries(entries.map((entry) => [entry.id, entry.data]));
}

/* ------------------ Write ------------------ */

export async function savePokemonData(
  id: number,
  data: PokemonData
): Promise<void> {
  const db = await getDB();
  await db.put(POKE_DATA_STORE, {
    id,
    data,
  });
}

/* ------------------ Exists helper ------------------ */

export async function hasPokemonData(id: number): Promise<boolean> {
  const db = await getDB();
  return Boolean(await db.getKey(POKE_DATA_STORE, id));
}
