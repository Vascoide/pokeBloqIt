import React from "react";
import { capitalize } from "../libs/helper";

export default function ExportButtons({ pokedex }) {
  const exportCSV = () => {
    const rows = pokedex
      .filter((pk) => pk.caughtAt) // Only caught Pokémon
      .map((pk) => {
        const stats = pk.data?.stats || [];
        const get = (name) =>
          stats.find((s) => s.stat.name === name)?.base_stat ?? "";

        return {
          id: pk.id,
          name: capitalize(pk.name),
          height: pk.data?.height ?? "",
          weight: pk.data?.weight ?? "",
          hp: get("hp"),
          attack: get("attack"),
          defense: get("defense"),
          specialAttack: get("special-attack"),
          specialDefense: get("special-defense"),
          speed: get("speed"),
          types: pk.data?.types?.map((t) => t.type.name).join(", ") ?? "",
          caughtAt: pk.caughtAt ? new Date(pk.caughtAt).toISOString() : "",
          note: pk.note || "",
        };
      });

    if (rows.length === 0) {
      alert("You have not caught any Pokémon to export.");
      return;
    }

    const header = Object.keys(rows[0]);
    const csv = [
      header.join(","),
      ...rows.map((row) =>
        header.map((h) => `"${String(row[h]).replace(/"/g, '""')}"`).join(",")
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
        className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded font-semibold"
      >
        Export to CSV
      </button>
    </div>
  );
}
