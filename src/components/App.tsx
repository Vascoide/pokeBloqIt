import { useState, useMemo } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { queueOfflineAction } from "../libs/offlineQueue";
import { fetchPokemon, usePokemonList } from "../hooks/usePokeQuery";
import { useDex } from "../hooks/useDex";

import PokemonDetailsModal from "./modals/PokemonDetailsModal";
import ReleaseManyModal from "./modals/ReleaseManyModal";
import ExportButtons from "./ExportButtons";
import FiltersBar from "./filter/FiltersBar";
import Pokedex from "./Pokedex";

import type { Filters, ViewMode } from "../types/filters";
import type { PokemonListItem, PokemonAPIListItem } from "../types/pokemon";
import { PokemonTypeName } from "../libs/helper";
import { useOfflineSync } from "../hooks/useOfflineSync";
import { queryClient } from "../queryClient";

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

  const sort = searchParams.get("sort") ?? "id";

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

  const handlePageChange = (nextPage: number) => {
    updateParams({ page: String(nextPage) });
  };

  const handleViewModeChange = (mode: ViewMode) => {
    updateParams({
      view: mode,
      page: "1",
    });
  };

  /* ---------------- Data ---------------- */
  const { data, isLoading, error } = usePokemonList(page, pageSize);

  const pokemonList = data?.results ?? [];
  const total = data?.count ?? 0;

  const dex = useDex();

  useOfflineSync(dex);

  /* ---------------- Helpers ---------------- */
  function getIdFromUrl(url: string): number {
    const parts = url.split("/").filter(Boolean);
    return Number(parts[parts.length - 1]);
  }

  /* ---------------- Combine API + Dex ---------------- */
  const combinedList: PokemonListItem[] = useMemo(() => {
    return (pokemonList as PokemonAPIListItem[]).map((item) => {
      const id = getIdFromUrl(item.url);
      const entry = dex.dex.find((d) => d.name === item.name);

      return entry
        ? { ...entry, id }
        : {
            id,
            name: item.name,
            caughtAt: null,
            data: null,
            note: "",
          };
    });
  }, [pokemonList, dex.dex]);

  /* ---------------- Actions ---------------- */
  const handleOpen = async (pokemon: PokemonListItem | null) => {
    if (!pokemon) return;

    if (pokemon.data) {
      setSelectedPokemon(pokemon);
      return;
    }

    try {
      const res = await fetch(
        `https://pokeapi.co/api/v2/pokemon/${pokemon.id}`
      );
      const full = await res.json();

      setSelectedPokemon({
        ...pokemon,
        data: full,
      });
    } catch (err) {
      console.error("Failed to load detailed pokemon data:", err);
    }
  };

  const handleCatch = async (pokemon: PokemonListItem) => {
    const data = await queryClient.fetchQuery({
      queryKey: ["pokemon", pokemon.id],
      queryFn: () => fetchPokemon(pokemon.id),
    });

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
            `px-4 py-2 rounded-full border transition-all ${
              isActive
                ? "bg-blue-600 text-white border-blue-600 shadow"
                : "text-blue-700 border-blue-400"
            }`
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
            `px-4 py-2 rounded-full border transition-all ${
              isActive
                ? "bg-blue-600 text-white border-blue-600 shadow"
                : "text-blue-700 border-blue-400"
            }`
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
              total={total}
              page={page}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              viewMode={viewMode}
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
              total={dex.dex.length}
              page={page}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              viewMode={viewMode}
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
          pokemon={selectedPokemon}
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
