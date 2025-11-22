import React from "react";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useDex } from "../hooks/useDex";
import { openDB, __reset } from "idb";

describe("useDex hook", () => {
  beforeEach(() => {
    __reset();
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
      data: { height: 7, weight: 69, types: ["grass"], stats: [] },
    };

    await act(async () => {
      await result.current.catchPokemon(bulba);
    });

    expect(result.current.dex.length).toBe(1);
    expect(result.current.isCaught("bulbasaur")).toBe(true);
    expect(result.current.getEntry("bulbasaur").data.height).toBe(7);
  });

  test("releasePokemon removes a pokemon", async () => {
    const { result } = renderHook(() => useDex());
    await waitFor(() => result.current.ready);

    await act(async () => {
      await result.current.catchPokemon({
        id: 4,
        name: "charmander",
        data: {},
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
      await result.current.catchPokemon({ id: 25, name: "pikachu", data: {} });
      await result.current.catchPokemon({
        id: 39,
        name: "jigglypuff",
        data: {},
      });
      await result.current.catchPokemon({ id: 10, name: "caterpie", data: {} });
    });

    expect(result.current.dex.length).toBe(3);

    await act(async () => result.current.releaseMany(["pikachu", "caterpie"]));

    expect(result.current.dex.length).toBe(1);
    expect(result.current.isCaught("jigglypuff")).toBe(true);
    expect(result.current.isCaught("pikachu")).toBe(false);
    expect(result.current.isCaught("caterpie")).toBe(false);
  });

  test("updateNote updates a Pokémon's note", async () => {
    const { result } = renderHook(() => useDex());
    await waitFor(() => result.current.ready);

    await act(async () =>
      result.current.catchPokemon({
        id: 7,
        name: "squirtle",
        data: {},
      })
    );

    await act(async () => {
      await result.current.updateNote("squirtle", "A cute turtle!");
    });

    const entry = result.current.getEntry("squirtle");

    expect(entry.note).toBe("A cute turtle!");
  });

  test("caughtNames returns only names", async () => {
    const { result } = renderHook(() => useDex());
    await waitFor(() => result.current.ready);

    await act(async () =>
      result.current.catchPokemon({ id: 150, name: "mewtwo", data: {} })
    );
    await act(async () =>
      result.current.catchPokemon({ id: 151, name: "mew", data: {} })
    );

    expect(result.current.caughtNames).toEqual(["mewtwo", "mew"]);
  });
});

// Mock idb
vi.mock("idb", () => {
  let store = new Map();

  return {
    openDB: vi.fn(() =>
      Promise.resolve({
        getAll: vi.fn(() => Array.from(store.values())),
        get: vi.fn((storeName, key) => store.get(key)),
        put: vi.fn((storeName, value) => {
          store.set(value.name, value);
        }),
        delete: vi.fn((storeName, key) => {
          store.delete(key);
        }),
      })
    ),
    __store: () => store, // for inspection
    __reset: () => (store = new Map()),
  };
});
