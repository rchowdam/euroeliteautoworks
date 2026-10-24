import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In development, calls to /api (and gallery files at /media) are forwarded to the backend, so the browser
// sees one address and no CORS setup is needed.
// Backend on another port?  API_PROXY_TARGET=http://127.0.0.1:9000 npm run dev
// (127.0.0.1, not "localhost": Node may resolve localhost to IPv6, which uvicorn doesn't listen on.)
const target = process.env.API_PROXY_TARGET || "http://127.0.0.1:8000";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Listen on the local network too, so a phone on the same Wi-Fi can open the Network URL.
    host: true,
    proxy: {
      "/api": target,
      "/media": target,
    },
  },
});
