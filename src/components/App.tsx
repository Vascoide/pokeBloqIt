import { useState, useMemo } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";

import { usePokemonList } from "../hooks/usePokeQuery";
import { useDex } from "../hooks/useDex";

import PokemonDetailsModal from "./modals/PokemonDetailsModal";
import ReleaseManyModal from "./modals/ReleaseManyModal";
import ExportButtons from "./ExportButtons";
import FiltersBar from "./filter/FiltersBar";
import Pokedex from "./Pokedex";

import type { Filters, ViewMode } from "../types/filters";
import type {
  PokemonListItem,
  PokemonAPIListItem,
} from "../types/pokemon";

export default function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}

function MainApp() {
  /* ---------------- View / modal state ---------------- */
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const [selectedPokemon, setSelectedPokemon] =
    useState<PokemonListItem | null>(null);

  const [showReleaseMany, setShowReleaseMany] =
    useState<boolean>(false);

  /* ---------------- Filters ---------------- */
  const [filters, setFilters] = useState<Filters>({
    name: "",
    types: [],
    onlyCaught: false,
  });

  /* ---------------- Data ---------------- */
  const {
    data: pokemonList = [],
    isLoading,
    error,
  } = usePokemonList();

  const dex = useDex();

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
    const res = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${pokemon.id}`
    );
    const full = await res.json();
    await dex.catchPokemon({
      id: pokemon.id,
      name: pokemon.name,
      data: full,
    });
  };

  const handleRelease = async (name: string) => {
    await dex.releasePokemon(name);
  };

  /* ---------------- Render ---------------- */
  return (
    <div className="px-4 py-6 mx-auto max-w-6xl w-full">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">PokéBloqIt</h1>
        <ExportButtons pokedex={dex.dex} />
      </header>

      {/* Navigation */}
      <nav className="flex gap-3 mb-6 text-lg">
        <NavLink
          to="/"
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
          to="/pokedex"
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
        onChange={setFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenReleaseMany={() => setShowReleaseMany(true)}
      />

      {/* Routes */}
      <Routes>
        <Route
          path="/"
          element={
            <Pokedex
              isLoading={isLoading}
              combinedList={combinedList}
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
              isLoading={isLoading}
              combinedList={dex.dex}
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
