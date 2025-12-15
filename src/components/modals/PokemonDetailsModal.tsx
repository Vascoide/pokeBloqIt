import React, { useEffect, useState } from "react";
import {
  capitalize,
  getTypeColor,
  getStatColor,
  PokemonTypeName,
  PokemonStatName,
} from "../../libs/helper";
import { formatHeight, formatWeight } from "../../libs/pokemonUnits";
import { loadCachedImage } from "../../libs/imageCache";
import { usePokemon } from "../../hooks/usePokeQuery";
import type { PokemonListItem } from "../../types/pokemon";

interface PokemonDetailsModalProps {
  pokemon: PokemonListItem;
  onClose: () => void;
  onUpdateNote: (name: string, note: string) => void;
}

export default function PokemonDetailsModal({
  pokemon,
  onClose,
  onUpdateNote,
}: PokemonDetailsModalProps) {
  const [note, setNote] = useState<string>(pokemon.note);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isClosing, setIsClosing] = useState<boolean>(false);
  const [spriteURL, setSpriteURL] = useState<string>();

  /* ---------------- React Query Pokémon data ---------------- */
  const { data, isLoading, isError } = usePokemon(pokemon.id);

  useEffect(() => {
    setNote(pokemon.note || "");
  }, [pokemon]);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const startClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 200);
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") startClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const firstType = (data?.types?.[0]?.type?.name ??
    "normal") satisfies PokemonTypeName;

  const typeColor = getTypeColor(firstType);
  const gradientEnd = `${typeColor}CC`;

  const sprite = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;

  useEffect(() => {
    loadCachedImage(sprite).then(setSpriteURL);
  }, [sprite]);

  /* ---------------- Loading / error states ---------------- */
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="bg-black/80 p-6 rounded-xl text-white">
          Loading Pokémon details…
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
        <div className="bg-red-900/80 p-6 rounded-xl text-white">
          Failed to load Pokémon data
        </div>
      </div>
    );
  }

  const title = capitalize(pokemon.name);

  const sharePokemon = () => {
    if (!data) return;

    const isCaught = Boolean(pokemon.caughtAt);
    const caughtText = isCaught
      ? `Caught on: ${new Date(pokemon.caughtAt!).toLocaleString()}`
      : "Not caught yet";

    const types = data.types.map((t) => t.type.name).join(", ");
    const height = formatHeight(data.height);
    const weight = formatWeight(data.weight);
    const totalStats = data.stats.reduce((s, v) => s + v.base_stat, 0);

    const message = `
${title} — #${pokemon.id}
Type: ${types}
Height: ${height}
Weight: ${weight}
Base Stat Total: ${totalStats}
Status: ${caughtText}
`.trim();

    if (navigator.share) {
      navigator.share({ title: `${title} info`, text: message });
    } else {
      navigator.clipboard.writeText(message);
      alert("Pokémon info copied to clipboard!");
    }
  };

  return (
    <div
      className={`
    fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50
    transition-opacity duration-300
    ${isClosing ? "opacity-0" : isVisible ? "opacity-100" : "opacity-0"}
  `}
      onClick={startClose}
    >
      <div
        className={`
    border border-white/20 p-6 rounded-xl shadow-xl w-full max-w-md relative
    transform transition-all duration-300
    ${
      isClosing
        ? "scale-95 opacity-0"
        : isVisible
          ? "scale-100 opacity-100"
          : "scale-95 opacity-0"
    }
  `}
        style={{
          background: `linear-gradient(180deg, ${typeColor} 0%, ${gradientEnd} 10%)`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          className="absolute top-2 right-2 text-white text-xl border-2 border-white/30 hover:text-red-300"
          style={{
            background: `linear-gradient(180deg, ${typeColor} 0%, ${gradientEnd} 100%)`,
          }}
          onClick={startClose}
        >
          ✕
        </button>
        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-3">{title}</h2>
        <div className="flex flex-col items-center mb-4">
          <img
            src={spriteURL}
            alt={pokemon.name}
            className="w-32 h-32 object-contain mb-3"
          />

          {/* Types */}
          <div className="flex gap-2 mb-2">
            {data?.types.map((t) => {
              const typeName = t.type.name;
              const color = getTypeColor(typeName);

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
            })}
          </div>

          {/* Caught status */}
          {pokemon.caughtAt ? (
            <p className="text-black-800 text-md">
              Caught: {new Date(pokemon.caughtAt).toLocaleString()}
            </p>
          ) : (
            <p className="text-black-800 text-md">Not yet caught</p>
          )}
        </div>
        {/* Stats */}
        {data && (
          <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
            <Stat label="Height" value={formatHeight(data.height)} />
            <Stat label="Weight" value={formatWeight(data.weight)} />

            {data.stats?.map((s) => (
              <StatBar
                key={s.stat.name}
                statName={s.stat.name}
                value={s.base_stat}
              />
            ))}

            <div className="col-span-2 bg-white/10 border border-white/10 p-2 rounded flex justify-between">
              <span className="font-semibold">BST</span>
              <span className="opacity-80">
                {data.stats.reduce((sum, s) => sum + s.base_stat, 0)}
              </span>
            </div>
          </div>
        )}
        {/* Note */}
        <div className="mb-4">
          <label className="block text-sm mb-1">Trainer Note:</label>
          <textarea
            className="w-full p-2 rounded bg-black/20 border border-white/10"
            rows={3}
            value={note}
            disabled={!pokemon.caughtAt}
            placeholder={
              pokemon.caughtAt
                ? "Add your note here..."
                : "Catch this Pokémon to add a note."
            }
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => onUpdateNote(pokemon.name, note)}
          />
        </div>
        {/* Actions */}
        <div className="flex justify-end mt-4">
          <button
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
            onClick={sharePokemon}
          >
            Share
          </button>
        </div>
      </div>
    </div>
  );
}

interface StatProps {
  label: PokemonStatName | "Height" | "Weight";
  value: string | number;
}

function Stat({ label, value }: StatProps) {
  return (
    <div className="bg-white/10 border border-white/10 p-2 rounded">
      <p className="text-xs opacity-70">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}

interface StatBarProps {
  statName: PokemonStatName;
  value: number;
}

function StatBar({ statName, value }: StatBarProps) {
  const maxStat = 255;
  const percent = Math.min((value / maxStat) * 100, 100);

  const barColor = getStatColor(statName);

  return (
    <div className="flex flex-col gap-1 mb-2">
      <div className="flex justify-between text-xs">
        <span className="font-semibold capitalize">
          {formatStatName(statName)}
        </span>
        <span className="opacity-80">{value}</span>
      </div>

      <div className="h-3 w-full bg-white/10 rounded">
        <div
          className="h-full rounded"
          style={{ width: `${percent}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}

function formatStatName(name: string): string {
  return name.replace("-", " ");
}
