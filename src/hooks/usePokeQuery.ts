import { useQuery, useQueries, keepPreviousData } from "@tanstack/react-query";
import { PokemonType, PokemonAPIListItem, PokemonData } from "../types/pokemon";

const BASE_URL = "https://pokeapi.co/api/v2";
const PAGE_SIZE = 20;

async function fetchPokemonTypes(): Promise<PokemonType[]> {
  const res = await fetch(`${BASE_URL}/type`);
  if (!res.ok) throw new Error("Failed to fetch Pokémon types");

  const json = await res.json();

  return json.results.sort((a: PokemonType, b: PokemonType) =>
    a.name.localeCompare(b.name)
  );
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonAPIListItem[];
}

export async function fetchPokemonListPage(
  limit: number,
  offset: number
): Promise<PokemonListResponse> {
  const res = await fetch(
    `${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch Pokémon list");
  }

  return res.json();
}

async function fetchPokemonDetails(name: string): Promise<PokemonData> {
  const res = await fetch(`${BASE_URL}/pokemon/${name}`);
  if (!res.ok) throw new Error("Failed to fetch details for " + name);
  return await res.json();
}

export function usePokemonList(page: number, pageSize: number = PAGE_SIZE) {
  return useQuery({
    queryKey: ["pokemon-list", page],
    queryFn: () => fetchPokemonListPage(pageSize, (page - 1) * pageSize),
    placeholderData: keepPreviousData, // 🔑 smooth pagination
    staleTime: 1000 * 60 * 5,
  });
}

export function usePokemonTypes() {
  return useQuery<PokemonType[]>({
    queryKey: ["pokemon-types"],
    queryFn: fetchPokemonTypes,
    staleTime: 1000 * 60 * 60,
  });
}

export function usePokemonDetails(name?: string) {
  return useQuery<PokemonData>({
    queryKey: ["pokemon-details", name],
    queryFn: () => fetchPokemonDetails(name!),
    enabled: !!name,
    staleTime: 1000 * 60 * 30,
  });
}

export function useManyPokemonDetails(names: string[] = []) {
  return useQueries({
    queries: names.map((name) => ({
      queryKey: ["pokemon-details", name],
      queryFn: () => fetchPokemonDetails(name),
      enabled: !!name,
      staleTime: 1000 * 60 * 30,
    })),
  });
}
