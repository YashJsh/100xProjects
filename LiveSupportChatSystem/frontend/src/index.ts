import { serve } from "bun";
import index from "./index.html";

const server = serve({
  port: 5173,
  routes: {
    // Serve index.html for all SPA routes
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Frontend server running at ${server.url}`);
