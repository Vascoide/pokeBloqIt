import React, { useState, useMemo, useEffect } from "react";
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
import FiltersBar from "./FiltersBar";
import Pokedex from "./Pokedex";

export default function App() {
  return (
    <Router>
      <MainApp />
    </Router>
  );
}

function MainApp() {
  const [viewMode, setViewMode] = useState("grid"); // grid | table
  // modal toggle logic
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [showReleaseMany, setShowReleaseMany] = useState(false);

  const [filters, setFilters] = useState({
    name: "",
    type: "",
    onlyCaught: false,
  });

  const { data: pokemonList = [], isLoading, error } = usePokemonList();

  // Pokédex management
  const dex = useDex();

  function getIdFromUrl(url) {
    const parts = url.split("/").filter(Boolean); // removes empty strings
    return Number(parts[parts.length - 1]); // last segment is the ID
  }

  const combinedList = useMemo(() => {
    const listWithData = pokemonList.map((item) => {
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

    return listWithData;
  }, [pokemonList, dex.dex]);

  const handleOpen = async (pk) => {
    if (!pk) return;

    // If Pokémon already has full data (caught)
    if (pk.data) {
      setSelectedPokemon(pk);
      return;
    }

    // If Pokémon NOT caught → fetch temporary details
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pk.id}`);
      const full = await res.json();

      // Do NOT save to dex — just attach temp data
      setSelectedPokemon({
        ...pk,
        data: full,
      });
    } catch (err) {
      console.error("Failed to load detailed pokemon data:", err);
    }
  };

  const handleCatch = async (pk) => {
    if (!pk) return;

    // If detailed data isn't loaded, fetch before adding
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pk.name}`);
    const full = await res.json();
    await dex.catchPokemon({ id: pk.id, name: pk.name, data: full });
  };

  const handleRelease = async (name) => {
    await dex.releasePokemon(name);
  };

  const handleChangeMode = (mode) => {
    setViewMode(mode);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">PokéBloqIt</h1>

        <div className="flex gap-3">
          <ExportButtons pokedex={dex.dex} />
        </div>
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
        filters={filters}
        onChange={setFilters}
        viewMode={viewMode}
        onViewModeChange={handleChangeMode}
        onOpenReleaseMany={() => setShowReleaseMany(true)}
      />

      {/* Routes */}
      <Routes>
        {/* All Pokémon */}
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

      {/* Pokémon modal */}
      {selectedPokemon && (
        <PokemonDetailsModal
          pokemon={selectedPokemon}
          onUpdateNote={dex.updateNote}
          onClose={() => setSelectedPokemon(null)}
        />
      )}
      {/* Release Pokémon modal */}
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
