import express from "express";
import { setupVite, serveStatic } from "./vite";
import { registerRoutes } from "./routes";

const PORT = process.env.PORT || 5000;

async function startServer() {
  const app = express();
  const server = await registerRoutes(app);

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    await setupVite(app, server);
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`ReCircle server running on port ${PORT}`);
  });
}

startServer();