import React from "react";
import { capitalize } from "../libs/helper";
import type { PokemonListItem } from "../types/pokemon";

interface ExportButtonsProps {
  pokedex: PokemonListItem[];
}

interface ExportRow {
  id: number;
  name: string;
  height: number | "";
  weight: number | "";
  hp: number | "";
  attack: number | "";
  defense: number | "";
  specialAttack: number | "";
  specialDefense: number | "";
  speed: number | "";
  types: string;
  caughtAt: string;
  note: string;
}

export default function ExportButtons({ pokedex }: ExportButtonsProps) {
  const exportCSV = () => {
    const rows: ExportRow[] = pokedex
      .filter((pk) => pk.caughtAt)
      .map((pk) => {
        const stats = pk.data?.stats ?? [];

        const getStat = (name: string): number | "" =>
          stats.find((s) => s.stat.name === name)?.base_stat ?? "";

        return {
          id: pk.id,
          name: capitalize(pk.name),
          height: pk.data?.height ?? "",
          weight: pk.data?.weight ?? "",
          hp: getStat("hp"),
          attack: getStat("attack"),
          defense: getStat("defense"),
          specialAttack: getStat("special-attack"),
          specialDefense: getStat("special-defense"),
          speed: getStat("speed"),
          types: pk.data?.types?.map((t) => t.type.name).join(", ") ?? "",
          caughtAt: pk.caughtAt ? new Date(pk.caughtAt).toISOString() : "",
          note: pk.note ?? "",
        };
      });

    if (rows.length === 0) {
      alert("You have not caught any Pokémon to export.");
      return;
    }

    const headers = Object.keys(rows[0]) as (keyof ExportRow)[];

    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((key) => `"${String(row[key]).replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "pokedex_export.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex justify-end mb-6">
      <button
        disabled={pokedex.length === 0}
        onClick={exportCSV}
        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded font-semibold disabled:opacity-40"
      >
        Export to CSV
      </button>
    </div>
  );
}
