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

const CSV_HEADERS: (keyof ExportRow)[] = [
  "id",
  "name",
  "height",
  "weight",
  "hp",
  "attack",
  "defense",
  "specialAttack",
  "specialDefense",
  "speed",
  "types",
  "caughtAt",
  "note",
];

type CSVValue = string | number;

const csvEscape = (value: CSVValue): string => {
  const str = value.toString();
  const safe = /^[=+\-@]/.test(str) ? `'${str}` : str;
  return `"${safe.replace(/"/g, '""')}"`;
};

export default function ExportButtons({ pokedex }: ExportButtonsProps) {
  const exportCSV = () => {
    const rows: ExportRow[] = pokedex
      .filter((pk) => pk.caughtAt)
      .map((pk) => {
        const stats = pk.data?.stats ?? [];

        const statMap = Object.fromEntries(
          stats.map((s) => [s.stat.name, s.base_stat])
        );

        return {
          id: pk.id,
          name: capitalize(pk.name),
          height: pk.data?.height ?? "",
          weight: pk.data?.weight ?? "",
          hp: statMap["hp"] ?? "",
          attack: statMap["attack"] ?? "",
          defense: statMap["defense"] ?? "",
          specialAttack: statMap["special-attack"] ?? "",
          specialDefense: statMap["special-defense"] ?? "",
          speed: statMap["speed"] ?? "",
          types: pk.data?.types?.map((t) => t.type.name).join(", ") ?? "",
          caughtAt: pk.caughtAt ? new Date(pk.caughtAt).toISOString() : "",
          note: pk.note ?? "",
        };
      });

    if (rows.length === 0) {
      alert("You have not caught any Pokémon to export.");
      return;
    }

    const lines = [];
    lines.push(CSV_HEADERS.join(","));

    for (const row of rows) {
      lines.push(CSV_HEADERS.map((k) => csvEscape(row[k])).join(","));
    }

    const csv = lines.join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
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
