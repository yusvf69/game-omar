import { createServer } from "node:http";
import app from "./app";
import { setupVoiceSignaling } from "./voice/signaling";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

// Only start the server when run directly (not imported by Vercel)
if (rawPort) {
  const port = Number(rawPort);

  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }

  const server = createServer(app);
  setupVoiceSignaling(server);

  server.listen(port, () => {
    logger.info({ port }, "Server listening");
  });

  server.on("error", (err) => {
    logger.error({ err }, "Error listening");
    process.exit(1);
  });
}

export { app };
export default app;
