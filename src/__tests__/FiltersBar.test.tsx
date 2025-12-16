import { screen } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import FiltersBar from "../components/filter/FiltersBar";
import { renderWithAppProviders } from "./test-utils";
import type { Filters } from "../types/filters";
import type { PokemonListItem } from "../types/pokemon";

/* ---------------- Mocks ---------------- */

// Mock react-router
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<any>("react-router-dom");
  return {
    ...actual,
    useLocation: () => ({
      pathname: "/pokedex",
    }),
  };
});

// Mock pokemon types hook
vi.mock("../hooks/usePokeQuery", () => ({
  usePokemonTypes: () => ({
    data: ["fire", "water"],
    isLoading: false,
    error: null,
  }),
}));

/* ---------------- Test ---------------- */

describe("FiltersBar", () => {
  test("renders FiltersBar correctly", () => {
    const filters: Filters = {
      name: "",
      types: [],
      onlyCaught: false,
    };

    const dex: PokemonListItem[] = [];

    renderWithAppProviders(
      <FiltersBar
        dex={dex}
        filters={filters}
        onChange={vi.fn()}
        viewMode="grid"
        onViewModeChange={vi.fn()}
        onOpenReleaseMany={vi.fn()}
      />
    );

    expect(screen.getByText(/reset/i)).toBeInTheDocument();
    expect(screen.getByText(/grid/i)).toBeInTheDocument();
    expect(screen.getByText(/table/i)).toBeInTheDocument();
  });
});
