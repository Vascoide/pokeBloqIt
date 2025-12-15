import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./components/App";

import { QueryClientProvider } from "@tanstack/react-query";
import { setupQueryPersistence, queryClient } from "./queryClient";

// Enable offline persistence
setupQueryPersistence();

// Register service worker (from Vite PWA plugin)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then(() => console.log("Service Worker registered"))
    .catch(() => {});
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
