import { useQuery, useQueries } from "@tanstack/react-query";

const BASE_URL = "https://pokeapi.co/api/v2";

async function fetchPokemonTypes() {
  const res = await fetch(`${BASE_URL}/type`);
  if (!res.ok) throw new Error("Failed to fetch Pokémon types");
  const json = await res.json();
  return json.results.sort((a, b) => a.name.localeCompare(b.name)); // <-- sort alphabetically
}

async function fetchPokemonList(limit = 2000) {
  const res = await fetch(`${BASE_URL}/pokemon?limit=${limit}`);
  if (!res.ok) throw new Error("Failed to fetch Pokémon list");
  const json = await res.json();
  return json.results; // [{ name, url }]
}

async function fetchPokemonDetails(name) {
  const res = await fetch(`${BASE_URL}/pokemon/${name}`);
  if (!res.ok) throw new Error("Failed to fetch details for " + name);
  return await res.json();
}

export function usePokemonList() {
  const query = useQuery({
    queryKey: ["pokemon-list"],
    queryFn: () => fetchPokemonList(),
    staleTime: 1000 * 60 * 10,
  });
  return query;
}

export function usePokemonTypes() {
  const query = useQuery({
    queryKey: ["pokemon-types"],
    queryFn: fetchPokemonTypes,
    staleTime: 1000 * 60 * 60,
  });
  return query;
}

export function usePokemonDetails(name) {
  return useQuery({
    queryKey: ["pokemon-details", name],
    queryFn: () => fetchPokemonDetails(name),
    enabled: !!name,
    staleTime: 1000 * 60 * 30,
  });
}

/**
 * Optional: Fetch multiple pokémon details in parallel
 * Useful for Dex view if you need details for all caught mons
 */
export function useManyPokemonDetails(names = []) {
  return useQueries({
    queries: names.map((name) => ({
      queryKey: ["pokemon-details", name],
      queryFn: () => fetchPokemonDetails(name),
      enabled: !!name,
    })),
  });
}
