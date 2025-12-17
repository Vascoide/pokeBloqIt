import { PokemonTableViewProps, SortDir, SortKey } from "../../types/ui";
import { formatPokemonName, getTypeColor } from "../../libs/helper";
import { formatHeight, formatWeight } from "../../libs/pokemonUnits";

export default function PokemonTable({
  items,
  sortBy,
  sortDir,
  onSort,
  onOpen,
  onCatch,
  onRelease,
}: PokemonTableViewProps) {
  return (
    <div className="overflow-x-auto rounded-xl bg-white/5 p-2 border border-white/10">
      <table className="w-full table-fixed">
        <thead>
          <tr className="text-left text-sm text-white/80 border-b border-white/10">
            <SortableHeader
              label="ID"
              keyName="id"
              {...{ sortBy, sortDir, onSort }}
            />
            <SortableHeader
              label="Name"
              keyName="name"
              {...{ sortBy, sortDir, onSort }}
            />
            <SortableHeader
              label="Type"
              keyName="type"
              {...{ sortBy, sortDir, onSort }}
            />
            <SortableHeader
              label="Height"
              keyName="height"
              {...{ sortBy, sortDir, onSort }}
            />
            <SortableHeader
              label="Weight"
              keyName="weight"
              {...{ sortBy, sortDir, onSort }}
            />
            <SortableHeader
              label="Caught"
              keyName="caughtAt"
              {...{ sortBy, sortDir, onSort }}
            />
            <th className="py-2 px-3 w-[100px]">Actions</th>
          </tr>
        </thead>

        <tbody>
          {items.map((pokemon) => {
            const isCaught = pokemon.caughtAt !== null;

            return (
              <tr
                key={pokemon.name}
                className="border-b border-white/5 hover:bg-white/10 transition cursor-pointer"
                onClick={(e) => {
                  if ((e.target as HTMLElement).tagName !== "BUTTON") {
                    onOpen(pokemon);
                  }
                }}
              >
                <td className="py-2 px-3">{pokemon.id}</td>
                <td className="py-2 px-3 capitalize font-medium">
                  {formatPokemonName(pokemon.name)}
                </td>
                <td className="py-2 px-3 flex gap-1">
                  {pokemon.data?.types?.map((t) => {
                    const typeName = t.type.name;
                    const color = getTypeColor(typeName);

                    return (
                      <span
                        key={typeName}
                        className="px-3 py-1 rounded-full text-sm capitalize text-black font-semibold"
                        style={{ backgroundColor: color }}
                      >
                        {typeName}
                      </span>
                    );
                  }) ?? "-"}
                </td>
                <td className="py-2 px-3">
                  {pokemon.data?.height
                    ? formatHeight(pokemon.data.height)
                    : "-"}
                </td>
                <td className="py-2 px-3">
                  {pokemon.data?.weight
                    ? formatWeight(pokemon.data.weight)
                    : "-"}
                </td>
                <td className="py-2 px-3">
                  {isCaught ? (
                    <span className="text-green-400">Caught</span>
                  ) : (
                    <span className="text-red-400">No</span>
                  )}
                </td>
                <td className="py-2 px-3">
                  {!isCaught ? (
                    <button
                      className="px-3 py-1 bg-green-500 rounded text-white"
                      onClick={() => onCatch(pokemon)}
                    >
                      Catch
                    </button>
                  ) : (
                    <button
                      className="px-3 py-1 bg-red-500 rounded text-white"
                      onClick={() => onRelease(pokemon.name)}
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

      {items.length === 0 && (
        <div className="w-full flex justify-center py-12 text-gray-300">
          No Pokémon match your filters.
        </div>
      )}
    </div>
  );
}

interface SortableHeaderProps {
  label: string;
  keyName: SortKey;
  sortBy: SortKey;
  sortDir: SortDir;
  onSort: (key: SortKey) => void;
}

function SortableHeader({
  label,
  keyName,
  sortBy,
  sortDir,
  onSort,
}: SortableHeaderProps) {
  return (
    <th
      className="py-2 px-3 cursor-pointer select-none hover:text-white"
      onClick={() => onSort(keyName)}
    >
      {label}{" "}
      {sortBy === keyName && (
        <span className="opacity-60">{sortDir === "asc" ? "▲" : "▼"}</span>
      )}
    </th>
  );
}
