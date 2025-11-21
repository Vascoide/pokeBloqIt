import React from "react";

export default function PokemonCard({ pokemon, onOpen, onCatch, onRelease }) {
  const { name, data, id, caughtAt } = pokemon;

  const image =
    data?.sprites?.front_default ||
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${
      id || ""
    }.png`;

  const formattedName = name.charAt(0).toUpperCase() + name.slice(1);

  return (
    <div
      onClick={(e) => {
        // Avoid opening modal when clicking a button
        if (e.target.tagName !== "BUTTON") {
          onOpen();
        }
      }}
      className="cursor-pointer bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex flex-col items-center hover:bg-white/20 transition shadow"
    >
      <img
        src={image}
        alt={name}
        className="w-20 h-20 object-contain mb-3"
        loading="lazy"
      />

      <p className="font-semibold text-center mb-2">{formattedName}</p>

      {caughtAt ? (
        <p className="text-green-400 text-xs mb-3">Caught</p>
      ) : (
        <p className="text-red-400 text-xs mb-3">Not caught</p>
      )}

      <div className="flex gap-2 mt-auto">
        {!caughtAt && (
          <button
            className="px-3 py-1 text-sm bg-green-500 hover:bg-green-600 rounded text-white"
            onClick={onCatch}
          >
            Catch
          </button>
        )}

        {caughtAt && (
          <button
            className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 rounded text-white"
            onClick={onRelease}
          >
            Release
          </button>
        )}
      </div>
    </div>
  );
}
