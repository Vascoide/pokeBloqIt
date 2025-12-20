export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const TYPE_COLORS = {
  normal: "#A8A77A",
  fire: "#EE8130",
  water: "#6390F0",
  electric: "#F7D02C",
  grass: "#7AC74C",
  ice: "#96D9D6",
  fighting: "#C22E28",
  poison: "#A33EA1",
  ground: "#E2BF65",
  flying: "#A98FF3",
  psychic: "#F95587",
  bug: "#A6B91A",
  rock: "#B6A136",
  ghost: "#735797",
  dragon: "#6F35FC",
  dark: "#705746",
  steel: "#B7B7CE",
  fairy: "#D685AD",
} as const;

export type PokemonTypeName = keyof typeof TYPE_COLORS;

export const STAT_COLORS = {
  hp: "#69DC12",
  attack: "#EFCC18",
  defense: "#E86412",
  "special-attack": "#14C3F1",
  "special-defense": "#4A6ADF",
  speed: "#D51DAD",
} as const;

export type PokemonStatName = keyof typeof STAT_COLORS;

export function getTypeColor(type: PokemonTypeName): string {
  return TYPE_COLORS[type] || "#AAA";
}

export function getStatColor(stat: PokemonStatName): string {
  return STAT_COLORS[stat];
}

const MEGA_STRING = "-mega";

export function formatPokemonName(name: string): string {
  if (name.includes(MEGA_STRING)) {
    // Remove "-mega" and prepend "Mega "
    return `Mega ${name.replace(MEGA_STRING, "")}`;
  }
  return name;
}

export const FALLBACK_IMAGE = "/pokeball.svg";
