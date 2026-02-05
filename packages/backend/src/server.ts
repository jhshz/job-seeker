import { app } from "./app";
import { config, connectDB } from "@configs";

const PORT = config.PORT;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`
      Server started!
      Port: ${PORT}
      Environment: ${config.NODE_ENV}
      URL: http://localhost:${PORT}
      `);
    });

    // Graceful shutdown
    const shutdown = (signal: string) => {
      console.log(`${signal} received. Shutting down...`);
      server.close(() => {
        console.log("Server closed");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

// Handle uncaught errors
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Rejection:", reason);
  process.exit(1);
});
