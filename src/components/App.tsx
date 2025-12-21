import { useState, useMemo, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { queueOfflineAction } from "../libs/offlineQueue";
import {
  getAllPokemonData,
  getPokemonData,
  savePokemonData,
} from "../libs/pokemonData";
import {
  fetchPokemon,
  usePokemon,
  usePokemonList,
} from "../hooks/usePokeQuery";
import { useDex } from "../hooks/useDex";

import PokemonDetailsModal from "./modals/PokemonDetailsModal";
import ReleaseManyModal from "./modals/ReleaseManyModal";
import ExportButtons from "./ExportButtons";
import FiltersBar from "./filter/FiltersBar";
import Pokedex from "./pokedex/Pokedex";

import type { Filters, ViewMode } from "../types/filters";
import type { PokemonListItem } from "../types/pokemon";
import { PokemonTypeName } from "../libs/helper";
import { useOfflineSync } from "../hooks/useOfflineSync";
import { queryClient } from "../queryClient";
import { cn } from "../libs/tailwindHelper";
import { SortDir, SortKey } from "../types/ui";

export default function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}

function MainApp() {
  const [selectedPokemon, setSelectedPokemon] =
    useState<PokemonListItem | null>(null);

  const {
    data: pokemonData,
    isLoading: isPokemonLoading,
    isError,
  } = usePokemon(selectedPokemon?.id ?? null);

  const [knownData, setKnownData] = useState<
    Record<number, PokemonListItem["data"]>
  >({});

  useEffect(() => {
    let cancelled = false;

    getAllPokemonData()
      .then((allData) => {
        if (!cancelled) {
          setKnownData(allData);
        }
      })
      .catch((err) => {
        console.error("Failed to load cached Pokémon data", err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedPokemon?.id || !pokemonData) return;

    const id = selectedPokemon.id;

    // Defer state update
    void Promise.resolve().then(() => {
      setKnownData((prev) => {
        if (prev[id]) return prev;
        return { ...prev, [id]: pokemonData };
      });
    });

    // Fire-and-forget save to IndexedDB
    savePokemonData(id, pokemonData).catch((err) => {
      console.error("Failed to persist pokemon data", err);
    });
  }, [pokemonData, selectedPokemon?.id]);

  const [showReleaseMany, setShowReleaseMany] = useState<boolean>(false);

  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page") ?? 1);

  const filters: Filters = {
    name: searchParams.get("name") ?? "",
    types: (searchParams.get("types")?.split(",") ?? []) as PokemonTypeName[],
    onlyCaught: searchParams.get("caught") === "true",
  };

  const viewMode: ViewMode =
    searchParams.get("view") === "table" ? "table" : "grid";

  const sortByParam = searchParams.get("sortBy") as SortKey | null;
  const sortDirParam = searchParams.get("sortDir") as SortDir | null;

  // Defaults
  const sortBy: SortKey = sortByParam ?? "id";
  const sortDir: SortDir = sortDirParam ?? "asc";

  const lastTableSort = useRef<{ by: SortKey; dir: SortDir }>({
    by: "id",
    dir: "asc",
  });

  const pageSize = 20;

  const location = useLocation();

  function updateParams(updates: Record<string, string | null>) {
    const next = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });

    setSearchParams(next);
  }

  const handleSortChange = (nextBy: SortKey, nextDir: SortDir) => {
    lastTableSort.current = { by: nextBy, dir: nextDir };
    updateParams({
      sortBy: nextBy,
      sortDir: nextDir,
    });
  };

  const handlePageChange = (nextPage: number) => {
    updateParams({ page: String(nextPage) });
  };

  const handleViewModeChange = (mode: ViewMode) => {
    if (mode === "grid") {
      updateParams({
        view: "grid",
        sortBy: null,
        sortDir: null,
      });
    } else {
      updateParams({
        view: "table",
        sortBy: lastTableSort.current.by,
        sortDir: lastTableSort.current.dir,
      });
    }
  };

  /* ---------------- Data ---------------- */
  const { data, isLoading } = usePokemonList(1);

  const pokemonList = useMemo(() => {
    return data?.results ?? [];
  }, [data]);

  const dex = useDex();

  useOfflineSync(dex);

  /* ---------------- Helpers ---------------- */
  function getIdFromUrl(url: string): number {
    const parts = url.split("/").filter(Boolean);
    return Number(parts[parts.length - 1]);
  }

  /* ---------------- Combine API + Dex ---------------- */
  const combinedList: PokemonListItem[] = useMemo(() => {
    return pokemonList.map((item) => {
      const id = getIdFromUrl(item.url);
      const entry = dex.dex.find((d) => d.name === item.name);

      const storedData = knownData[id];

      return entry
        ? { ...entry, id }
        : {
            id,
            name: item.name,
            caughtAt: null,
            data: storedData ?? null,
            note: "",
          };
    });
  }, [pokemonList, dex.dex, knownData]);

  /* ---------------- Actions ---------------- */
  const handleOpen = async (pokemon: PokemonListItem | null) => {
    if (!pokemon) return;

    // 1️⃣ Already has data
    if (pokemon.data) {
      setSelectedPokemon(pokemon);
      return;
    }

    // 2️⃣ Try stored Pokédex data
    if (knownData[pokemon.id]) {
      setSelectedPokemon({
        ...pokemon,
        data: knownData[pokemon.id],
      });
      return;
    }

    // 3️⃣ Let React Query fetch (fallback)
    setSelectedPokemon(pokemon);
  };

  const handleCatch = async (pokemon: PokemonListItem) => {
    const data = await queryClient.fetchQuery({
      queryKey: ["pokemon", pokemon.id],
      queryFn: () => fetchPokemon(pokemon.id),
    });

    await savePokemonData(pokemon.id, data);

    setKnownData((prev) => ({
      ...prev,
      [pokemon.id]: data,
    }));

    if (!navigator.onLine) {
      // 1️⃣ Queue the action
      await queueOfflineAction({
        type: "CATCH",
        pokemonId: pokemon.id,
        pokemonName: pokemon.name,
        timestamp: Date.now(),
      });

      // 2️⃣ Optimistically mark as caught (UX win)
      await dex.catchPokemon({
        id: pokemon.id,
        name: pokemon.name,
      });

      return;
    }

    // Online → normal behavior
    await dex.catchPokemon({
      id: pokemon.id,
      name: pokemon.name,
      data,
    });
  };

  const handleRelease = async (name: string) => {
    if (!navigator.onLine) {
      // 1️⃣ Queue the action
      await queueOfflineAction({
        type: "RELEASE",
        pokemonName: name,
        timestamp: Date.now(),
      });

      // 2️⃣ Optimistically mark as caught (UX win)
      await dex.releasePokemon(name);

      return;
    }

    await dex.releasePokemon(name);
  };

  /* ---------------- Render ---------------- */
  return (
    <div className="px-4 py-6 m-5 mx-auto max-w-6xl w-full">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">PokéBloqIt</h1>
        <ExportButtons pokedex={dex.dex} />
      </header>

      {/* Navigation */}
      <nav className="flex gap-3 mb-6 text-lg">
        <NavLink
          to={{
            pathname: "/",
            search: (() => {
              const next = new URLSearchParams(location.search);
              next.delete("page");
              return next.toString();
            })(),
          }}
          end
          className={({ isActive }) =>
            cn(
              "px-4 py-2 rounded-full border transition-all",
              isActive
                ? "bg-blue-600 text-white border-blue-600 shadow"
                : "text-blue-700 border-blue-400"
            )
          }
        >
          All Pokémon
        </NavLink>

        <NavLink
          to={{
            pathname: "/pokedex",
            search: (() => {
              const next = new URLSearchParams(location.search);
              next.delete("page");
              return next.toString();
            })(),
          }}
          className={({ isActive }) =>
            cn(
              "px-4 py-2 rounded-full border transition-all",
              isActive
                ? "bg-blue-600 text-white border-blue-600 shadow"
                : "text-blue-700 border-blue-400"
            )
          }
        >
          My Pokédex ({dex.dex.length})
        </NavLink>
      </nav>

      {/* Filters */}
      <FiltersBar
        dex={dex.dex}
        filters={filters}
        onChange={(next) =>
          updateParams({
            name: next.name || null,
            types: next.types.length ? next.types.join(",") : null,
            caught: next.onlyCaught ? "true" : null,
            page: "1", // reset page on filter change
          })
        }
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onOpenReleaseMany={() => setShowReleaseMany(true)}
      />

      {/* Routes */}
      <Routes>
        <Route
          path="/"
          element={
            <Pokedex
              isLoading={isLoading}
              items={combinedList}
              page={page}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              viewMode={viewMode}
              sortBy={sortBy}
              sortDir={sortDir}
              onSortChange={handleSortChange}
              onOpen={handleOpen}
              onCatch={handleCatch}
              onRelease={handleRelease}
              filters={filters}
            />
          }
        />

        <Route
          path="/pokedex"
          element={
            <Pokedex
              isLoading={false}
              items={dex.dex}
              page={page}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              viewMode={viewMode}
              sortBy={sortBy}
              sortDir={sortDir}
              onSortChange={handleSortChange}
              onOpen={handleOpen}
              onCatch={handleCatch}
              onRelease={handleRelease}
              filters={filters}
            />
          }
        />
      </Routes>

      {/* Modals */}
      {selectedPokemon && (
        <PokemonDetailsModal
          pokemon={{
            ...selectedPokemon,
            data: selectedPokemon.data ?? pokemonData ?? null,
          }}
          isLoading={isPokemonLoading}
          isError={isError}
          onUpdateNote={dex.updateNote}
          onClose={() => setSelectedPokemon(null)}
        />
      )}

      {showReleaseMany && (
        <ReleaseManyModal
          dex={dex.dex}
          onConfirm={dex.releaseMany}
          onClose={() => setShowReleaseMany(false)}
        />
      )}
    </div>
  );
}
