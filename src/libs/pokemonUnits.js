// src/libs/pokemonUnits.js

// Convert height from decimetres → meters
export function heightToMeters(dm) {
  return dm / 10;
}

// Convert height from meters → feet + inches
export function metersToFeetInches(m) {
  const totalInches = m * 39.3701;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

// Format height for UI (e.g. "1.7 m (5'7\")")
export function formatHeight(dm) {
  const meters = heightToMeters(dm);
  const { feet, inches } = metersToFeetInches(meters);
  return `${meters.toFixed(1)} m (${feet}′${inches}″)`;
}

// Convert weight from hectograms → kilograms
export function weightToKg(hg) {
  return hg / 10;
}

// Convert kilograms → pounds
export function kgToLbs(kg) {
  return kg * 2.20462;
}

// Format weight for UI (e.g. "90.5 kg (199.5 lbs)")
export function formatWeight(hg) {
  const kg = weightToKg(hg);
  const lbs = kgToLbs(kg);
  return `${kg.toFixed(1)} kg (${lbs.toFixed(1)} lbs)`;
}
