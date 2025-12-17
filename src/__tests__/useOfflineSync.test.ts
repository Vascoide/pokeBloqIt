import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useOfflineSync } from "../hooks/useOfflineSync";
import type { OfflineAction } from "../types/offline";

/* ------------------------------------------------------------------ */
/* Mocks */
/* ------------------------------------------------------------------ */

vi.mock("../libs/offlineQueue", () => ({
  getOfflineActions: vi.fn(),
  clearOfflineActions: vi.fn(),
}));

vi.mock("../hooks/usePokeQuery", () => ({
  fetchPokemon: vi.fn(),
}));

vi.mock("../libs/pokemonData", () => ({
  savePokemonData: vi.fn(),
}));

vi.mock("../queryClient", () => ({
  queryClient: {
    ensureQueryData: vi.fn(),
  },
}));

import { getOfflineActions, clearOfflineActions } from "../libs/offlineQueue";
import { fetchPokemon } from "../hooks/usePokeQuery";
import { savePokemonData } from "../libs/pokemonData";
import { queryClient } from "../queryClient";

/* ------------------------------------------------------------------ */
/* Test */
/* ------------------------------------------------------------------ */

describe("useOfflineSync", () => {
  const dex = {
    catchPokemon: vi.fn(),
    releasePokemon: vi.fn(),
    updateNote: vi.fn(),
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("syncs offline CATCH actions when coming online", async () => {
    const actions: OfflineAction[] = [
      {
        type: "CATCH",
        pokemonId: 25,
        pokemonName: "pikachu",
        timestamp: Date.now(),
      },
    ];

    vi.mocked(getOfflineActions).mockResolvedValue(actions);
    vi.mocked(fetchPokemon).mockResolvedValue({
      height: 25,
      weight: 60,
      types: [
        {
          slot: 1,
          type: { name: "electric", url: "https://pokeapi.co/api/v2/type/13/" },
        },
      ],
      stats: [
        {
          base_stat: 35,
          effort: 0,
          stat: { name: "hp", url: "https://pokeapi.co/api/v2/stat/1/" },
        },
        {
          base_stat: 55,
          effort: 0,
          stat: { name: "attack", url: "https://pokeapi.co/api/v2/stat/2/" },
        },
        {
          base_stat: 40,
          effort: 0,
          stat: { name: "defense", url: "https://pokeapi.co/api/v2/stat/3/" },
        },
        {
          base_stat: 50,
          effort: 0,
          stat: {
            name: "special-attack",
            url: "https://pokeapi.co/api/v2/stat/4/",
          },
        },
        {
          base_stat: 50,
          effort: 0,
          stat: {
            name: "special-defense",
            url: "https://pokeapi.co/api/v2/stat/5/",
          },
        },
        {
          base_stat: 90,
          effort: 2,
          stat: { name: "speed", url: "https://pokeapi.co/api/v2/stat/6/" },
        },
      ],
    });
    vi.mocked(queryClient.ensureQueryData).mockResolvedValue({
      id: 25,
      name: "pikachu",
    });

    renderHook(() => useOfflineSync(dex));

    await act(async () => {
      window.dispatchEvent(new Event("online"));
    });

    expect(getOfflineActions).toHaveBeenCalled();
    expect(queryClient.ensureQueryData).toHaveBeenCalledWith({
      queryKey: ["pokemon", 25],
      queryFn: expect.any(Function),
    });

    expect(savePokemonData).toHaveBeenCalledWith(25, {
      id: 25,
      name: "pikachu",
    });

    expect(dex.catchPokemon).toHaveBeenCalledWith({
      id: 25,
      name: "pikachu",
      data: { id: 25, name: "pikachu" },
    });

    expect(clearOfflineActions).toHaveBeenCalled();
  });

  it("handles RELEASE and NOTE actions", async () => {
    const actions: OfflineAction[] = [
      { type: "RELEASE", pokemonName: "bulbasaur", timestamp: Date.now() },
      {
        type: "NOTE",
        pokemonName: "charmander",
        note: "Spicy",
        timestamp: Date.now(),
      },
    ];

    vi.mocked(getOfflineActions).mockResolvedValue(actions);

    renderHook(() => useOfflineSync(dex));

    await act(async () => {
      window.dispatchEvent(new Event("online"));
    });

    expect(dex.releasePokemon).toHaveBeenCalledWith("bulbasaur");
    expect(dex.updateNote).toHaveBeenCalledWith("charmander", "Spicy");
    expect(clearOfflineActions).toHaveBeenCalled();
  });

  it("cleans up event listener on unmount", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() => useOfflineSync(dex));

    expect(addSpy).toHaveBeenCalledWith("online", expect.any(Function));

    unmount();

    expect(removeSpy).toHaveBeenCalledWith("online", expect.any(Function));
  });
});
