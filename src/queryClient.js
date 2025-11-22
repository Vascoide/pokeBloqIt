import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { persistQueryClient } from "@tanstack/react-query-persist-client";

export function setupQueryPersistence(queryClient) {
  const persister = createSyncStoragePersister({
    storage: window.localStorage,
  });

  persistQueryClient({
    queryClient,
    persister,
    maxAge: 1000 * 60 * 60 * 24, // keep cache 24h
  });
}
