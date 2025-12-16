import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, it, expect, beforeEach, vi } from "vitest";

import {
  usePokemonTypes,
  usePokemonList,
  useManyPokemonDetails,
} from "../hooks/usePokeQuery";

/* ------------------------------------------------------------------ */
/* React Query wrapper */
/* ------------------------------------------------------------------ */

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

/* ------------------------------------------------------------------ */
/* Global fetch mock */
/* ------------------------------------------------------------------ */

beforeEach(() => {
  vi.restoreAllMocks();

  global.fetch = vi.fn() as unknown as typeof fetch;
});

/* ------------------------------------------------------------------ */
/* usePokemonTypes */
/* ------------------------------------------------------------------ */

describe("usePokemonTypes", () => {
  it("returns sorted Pokémon types", async () => {
    const mockData = {
      results: [{ name: "fire" }, { name: "grass" }, { name: "bug" }],
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    const { result } = renderHook(() => usePokemonTypes(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([
      { name: "bug" },
      { name: "fire" },
      { name: "grass" },
    ]);
  });

  it("returns an error when API fails", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
    } as Response);

    const { result } = renderHook(() => usePokemonTypes(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain(
      "Failed to fetch Pokémon types"
    );
  });
});

/* ------------------------------------------------------------------ */
/* usePokemonList */
/* ------------------------------------------------------------------ */

describe("usePokemonList", () => {
  it("returns a Pokémon list", async () => {
    const mockData = {
      results: [{ name: "bulbasaur" }, { name: "charmander" }],
      count: 2,
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    const { result } = renderHook(() => usePokemonList(1, 20), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.results).toEqual([
      { name: "bulbasaur" },
      { name: "charmander" },
    ]);
  });

  it("handles API failures", async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
    } as Response);

    const { result } = renderHook(() => usePokemonList(1, 20), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toContain(
      "Failed to fetch Pokémon list"
    );
  });
});

/* ------------------------------------------------------------------ */
/* useManyPokemonDetails */
/* ------------------------------------------------------------------ */

describe("useManyPokemonDetails", () => {
  it("fetches details for multiple Pokémon", async () => {
    const pikachu = { name: "pikachu", id: 25 };
    const eevee = { name: "eevee", id: 133 };

    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => pikachu,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => eevee,
      } as Response);

    const { result } = renderHook(
      () => useManyPokemonDetails(["pikachu", "eevee"]),
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(result.current[0].isSuccess).toBe(true);
      expect(result.current[1].isSuccess).toBe(true);
    });

    expect(result.current[0].data).toEqual(pikachu);
    expect(result.current[1].data).toEqual(eevee);
  });

  it("skips empty names", () => {
    const { result } = renderHook(() => useManyPokemonDetails([""]), {
      wrapper: createWrapper(),
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(result.current[0].data).toBeUndefined();
  });
});
