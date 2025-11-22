import { get, set } from "idb-keyval";

export async function loadCachedImage(url) {
  // Try to load blob from cache
  const cachedBlob = await get(url);
  if (cachedBlob instanceof Blob) {
    return URL.createObjectURL(cachedBlob);
  }

  // Not cached → fetch
  const response = await fetch(url);
  const blob = await response.blob();

  // Store the blob itself
  await set(url, blob);

  // Return object URL (valid this session)
  return URL.createObjectURL(blob);
}
