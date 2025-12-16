import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { useDex } from "../hooks/useDex";
import type { PokemonData, PokemonTypeSlot } from "../types/pokemon";

/* ------------------------------------------------------------------ */
/* Mock ../libs/idb */
/* ------------------------------------------------------------------ */

let store = new Map<string, any>();

vi.mock("../libs/idb", () => {
  return {
    POKE_STORE: "poke",

    getDB: vi.fn(async () => ({
      getAll: vi.fn(async () => Array.from(store.values())),
      get: vi.fn(async (_store: string, key: string) => store.get(key)),
      put: vi.fn(async (_store: string, value: any) => {
        store.set(value.name, value);
      }),
      delete: vi.fn(async (_store: string, key: string) => {
        store.delete(key);
      }),
    })),

    __reset: () => {
      store = new Map();
    },
  };
});

/* ------------------------------------------------------------------ */
/* Tests */
/* ------------------------------------------------------------------ */

describe("useDex hook", () => {
  beforeEach(() => {
    store = new Map();
  });

  test("loads initial dex from DB", async () => {
    const { result } = renderHook(() => useDex());

    expect(result.current.ready).toBe(false);

    await waitFor(() => {
      expect(result.current.ready).toBe(true);
    });

    expect(result.current.dex).toEqual([]);
  });

  test("catchPokemon adds a pokemon", async () => {
    const { result } = renderHook(() => useDex());
    await waitFor(() => result.current.ready);

    const bulba = {
      id: 1,
      name: "bulbasaur",
      data: {
        height: 7,
        weight: 69,
        types: [{ slot: 1, type: { name: "grass" } }] as PokemonTypeSlot[],
        stats: [],
      } as PokemonData,
    };

    await act(async () => {
      await result.current.catchPokemon(bulba);
    });

    expect(result.current.dex.length).toBe(1);
    expect(result.current.isCaught("bulbasaur")).toBe(true);
    expect(result.current.getEntry("bulbasaur")?.data?.height).toBe(7);
  });

  test("releasePokemon removes a pokemon", async () => {
    const { result } = renderHook(() => useDex());
    await waitFor(() => result.current.ready);

    await act(async () => {
      await result.current.catchPokemon({
        id: 4,
        name: "charmander",
      });
    });

    expect(result.current.isCaught("charmander")).toBe(true);

    await act(async () => {
      await result.current.releasePokemon("charmander");
    });

    expect(result.current.isCaught("charmander")).toBe(false);
    expect(result.current.dex.length).toBe(0);
  });

  test("releaseMany removes multiple Pokémon", async () => {
    const { result } = renderHook(() => useDex());
    await waitFor(() => result.current.ready);

    await act(async () => {
      await result.current.catchPokemon({ id: 25, name: "pikachu" });
      await result.current.catchPokemon({
        id: 39,
        name: "jigglypuff",
      });
      await result.current.catchPokemon({ id: 10, name: "caterpie" });
    });

    expect(result.current.dex.length).toBe(3);

    await act(async () => {
      await result.current.releaseMany(["pikachu", "caterpie"]);
    });

    expect(result.current.dex.length).toBe(1);
    expect(result.current.isCaught("jigglypuff")).toBe(true);
    expect(result.current.isCaught("pikachu")).toBe(false);
    expect(result.current.isCaught("caterpie")).toBe(false);
  });

  test("updateNote updates a Pokémon's note", async () => {
    const { result } = renderHook(() => useDex());
    await waitFor(() => result.current.ready);

    await act(async () => {
      await result.current.catchPokemon({
        id: 7,
        name: "squirtle",
      });
    });

    await act(async () => {
      await result.current.updateNote("squirtle", "A cute turtle!");
    });

    const entry = result.current.getEntry("squirtle");

    expect(entry?.note).toBe("A cute turtle!");
  });

  test("caughtNames returns only names", async () => {
    const { result } = renderHook(() => useDex());
    await waitFor(() => result.current.ready);

    await act(async () => {
      await result.current.catchPokemon({ id: 150, name: "mewtwo" });
      await result.current.catchPokemon({ id: 151, name: "mew" });
    });

    expect(result.current.caughtNames).toEqual(["mewtwo", "mew"]);
  });
});
