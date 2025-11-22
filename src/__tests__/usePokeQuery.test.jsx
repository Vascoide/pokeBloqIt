import React from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  usePokemonTypes,
  usePokemonList,
  usePokemonDetails,
  useManyPokemonDetails,
} from "../hooks/usePokeQuery";

// Utility wrapper for react-query
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false }, // avoids retry delays in tests
    },
  });

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

beforeEach(() => {
  global.fetch = vi.fn();
});

//
// ─────────────────────────────────────────────
//   TEST usePokemonTypes
// ─────────────────────────────────────────────
//
test("usePokemonTypes returns sorted pokemon types", async () => {
  const mockData = {
    results: [{ name: "fire" }, { name: "grass" }, { name: "bug" }],
  };

  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockData,
  });

  const { result } = renderHook(() => usePokemonTypes(), {
    wrapper: createWrapper(),
  });

  await waitFor(() => {
    expect(result.current.data).toEqual([
      { name: "bug" },
      { name: "fire" },
      { name: "grass" },
    ]);
  });
});

test("usePokemonTypes returns an error when the API fails", async () => {
  global.fetch.mockResolvedValueOnce({ ok: false });

  const { result } = renderHook(() => usePokemonTypes(), {
    wrapper: createWrapper(),
  });

  await waitFor(() => {
    expect(result.current.error).toBeTruthy();
    expect(result.current.error.message).toContain(
      "Failed to fetch Pokémon types"
    );
  });
});

//
// ─────────────────────────────────────────────
//   TEST usePokemonList
// ─────────────────────────────────────────────
//
test("usePokemonList returns a pokemon list", async () => {
  const mockData = {
    results: [{ name: "bulbasaur" }, { name: "charmander" }],
  };

  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockData,
  });

  const { result } = renderHook(() => usePokemonList(), {
    wrapper: createWrapper(),
  });

  await waitFor(() => {
    expect(result.current.data).toEqual([
      { name: "bulbasaur" },
      { name: "charmander" },
    ]);
  });
});

test("usePokemonList handles API failures", async () => {
  global.fetch.mockResolvedValueOnce({ ok: false });

  const { result } = renderHook(() => usePokemonList(), {
    wrapper: createWrapper(),
  });

  await waitFor(() => {
    expect(result.current.error).toBeTruthy();
    expect(result.current.error.message).toContain(
      "Failed to fetch Pokémon list"
    );
  });
});

//
// ─────────────────────────────────────────────
//   TEST usePokemonDetails(name)
// ─────────────────────────────────────────────
//
test("usePokemonDetails returns details for a pokemon", async () => {
  const mockDetails = { name: "pikachu", id: 25 };

  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => mockDetails,
  });

  const { result } = renderHook(() => usePokemonDetails("pikachu"), {
    wrapper: createWrapper(),
  });

  await waitFor(() => {
    expect(result.current.data).toEqual(mockDetails);
  });
});

test("usePokemonDetails is disabled when name is empty", async () => {
  const { result } = renderHook(() => usePokemonDetails(""), {
    wrapper: createWrapper(),
  });

  // It should never call fetch
  expect(global.fetch).not.toHaveBeenCalled();
  expect(result.current.isLoading).toBe(false);
  expect(result.current.data).toBeUndefined();
});

test("usePokemonDetails handles errors", async () => {
  global.fetch.mockResolvedValueOnce({ ok: false });

  const { result } = renderHook(() => usePokemonDetails("pikaxu"), {
    wrapper: createWrapper(),
  });

  await waitFor(() => {
    expect(result.current.error).toBeTruthy();
    expect(result.current.error.message).toContain(
      "Failed to fetch details for pikaxu"
    );
  });
});

//
// ─────────────────────────────────────────────
//   TEST useManyPokemonDetails(names)
// ─────────────────────────────────────────────
//
test("useManyPokemonDetails fetches details for multiple pokemon", async () => {
  const mockPikachu = { name: "pikachu", id: 25 };
  const mockEevee = { name: "eevee", id: 133 };

  // two fetch calls because `useQueries` maps names
  global.fetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => mockPikachu,
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => mockEevee,
    });

  const { result } = renderHook(
    () => useManyPokemonDetails(["pikachu", "eevee"]),
    { wrapper: createWrapper() }
  );

  await waitFor(() => {
    expect(result.current[0].data).toEqual(mockPikachu);
    expect(result.current[1].data).toEqual(mockEevee);
  });
});

test("useManyPokemonDetails skips empty names", async () => {
  const { result } = renderHook(() => useManyPokemonDetails([""]), {
    wrapper: createWrapper(),
  });

  expect(global.fetch).not.toHaveBeenCalled();
  expect(result.current[0].data).toBeUndefined();
});
