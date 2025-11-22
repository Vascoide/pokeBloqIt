import React, { useState, useMemo } from "react";
import { capitalize, TYPE_COLORS } from "../libs/helper";
import { formatHeight, formatWeight } from "../libs/pokemonUnits";

export default function PokemonTable({ items, onOpen, onCatch, onRelease }) {
  const [sortBy, setSortBy] = useState("id");
  const [sortDir, setSortDir] = useState("asc");

  const toggleSort = (key) => {
    if (sortBy === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir("asc");
    }
  };

  const extractValue = (pk, key) => {
    switch (key) {
      case "id":
        return pk.id;
      case "name":
        return pk.name;
      case "height":
        return pk?.data?.height || 0;
      case "weight":
        return pk?.data?.weight || 0;
      case "type":
        return (pk?.data?.types || [])
          .map((t) => t.type.name)
          .join(" ")
          .toLowerCase();
      case "caughtAt":
        return pk.caughtAt || 0;
      default:
        return "";
    }
  };

  const sorted = useMemo(() => {
    const compare = (a, b) => {
      const valA = extractValue(a, sortBy);
      const valB = extractValue(b, sortBy);

      if (valA < valB) return sortDir === "asc" ? -1 : 1;
      if (valA > valB) return sortDir === "asc" ? 1 : -1;
      return 0;
    };

    const safeList = items;

    return [...safeList].sort(compare);
  }, [items, sortBy, sortDir]);

  return (
    <div className="overflow-x-auto rounded-xl bg-white/5 p-2 border border-white/10">
      <table className="w-full table-fixed">
        <thead>
          <tr className="text-left text-sm text-white/80 border-b border-white/10">
            <th className="py-2 px-3 w-[80px]">
              <SortableHeader
                label="ID"
                keyName="id"
                sortBy={sortBy}
                sortDir={sortDir}
                onSort={toggleSort}
              />
            </th>
            <th className="py-2 px-3 w-[180px]">
              <SortableHeader
                label="Name"
                keyName="name"
                sortBy={sortBy}
                sortDir={sortDir}
                onSort={toggleSort}
              />
            </th>
            <th className="py-2 w-[180px]">
              <SortableHeader
                label="Type"
                keyName="type"
                sortBy={sortBy}
                sortDir={sortDir}
                onSort={toggleSort}
              />
            </th>
            <th className="py-2 w-[180px]">
              <SortableHeader
                label="Height"
                keyName="height"
                sortBy={sortBy}
                sortDir={sortDir}
                onSort={toggleSort}
              />
            </th>

            <th className="py-2 w-[180px]">
              <SortableHeader
                label="Weight"
                keyName="weight"
                sortBy={sortBy}
                sortDir={sortDir}
                onSort={toggleSort}
              />
            </th>
            <th className="py-2 w-[120px]">
              <SortableHeader
                label="Caught"
                keyName="caughtAt"
                sortBy={sortBy}
                sortDir={sortDir}
                onSort={toggleSort}
              />
            </th>
            <th className="py-2 px-3 w-[100px]">Actions</th>
          </tr>
        </thead>

        <tbody>
          {sorted.map((pk) => {
            const isCaught = pk.caughtAt !== null;

            return (
              <tr
                key={pk.name}
                className="border-b border-white/5 hover:bg-white/10 transition cursor-pointer"
                onClick={(e) => {
                  if (e.target.tagName !== "BUTTON") onOpen(pk);
                }}
              >
                <td className="py-2 px-3">{pk.id}</td>
                <td className="py-2 px-3 font-medium">{capitalize(pk.name)}</td>
                <td className="py-2 px-3 flex items-center gap-1">
                  {pk.data?.types?.map((t) => {
                    const typeName = t.type.name;
                    const color = TYPE_COLORS[typeName] || "#AAA";

                    return (
                      <span
                        key={typeName}
                        className="px-3 py-1 rounded-full text-sm capitalize text-black font-semibold"
                        style={{
                          backgroundColor: color,
                          boxShadow: "0 0 6px rgba(0,0,0,0.2)",
                        }}
                      >
                        {typeName}
                      </span>
                    );
                  }) || "-"}
                </td>

                <td className="py-2 px-3">
                  {pk?.data?.height ? formatHeight(pk.data.height) : "-"}
                </td>
                <td className="py-2 px-3">
                  {pk?.data?.weight ? formatWeight(pk.data.weight) : "-"}
                </td>
                <td className="py-2 px-3">
                  {isCaught ? (
                    <span className="text-green-400 text-sm">Caught</span>
                  ) : (
                    <span className="text-red-400 text-sm">No</span>
                  )}
                </td>

                <td className="py-2 px-3">
                  {!isCaught && (
                    <button
                      className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 rounded text-white"
                      onClick={() => onCatch(pk)}
                    >
                      Catch
                    </button>
                  )}

                  {isCaught && (
                    <button
                      className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 rounded text-white"
                      onClick={() => onRelease(pk.name)}
                    >
                      Release
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {sorted.length === 0 && (
        <div className="w-full flex justify-center py-12 text-center text-gray-300">
          No Pokémon match your filters.
        </div>
      )}
    </div>
  );
}

function SortableHeader({ label, keyName, sortBy, sortDir, onSort }) {
  return (
    <th
      className="py-2 px-3 select-none cursor-pointer hover:text-white"
      onClick={() => onSort(keyName)}
    >
      {label}{" "}
      {sortBy === keyName && (
        <span className="opacity-60">{sortDir === "asc" ? "▲" : "▼"}</span>
      )}
    </th>
  );
}
