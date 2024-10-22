import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import prisma from "./db/connectToDB.js";

dotenv.config();
const app = express();
app.use(cookieParser());
app.use(express.json());

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

const server = app.listen(process.env.PORT, async () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});

// Handle graceful shutdown
const gracefulShutdown = () => {
  console.log("Received kill signal, shutting down gracefully");
  server.close(() => {
    console.log("Closed out remaining connections");
    prisma.$disconnect().then(() => {
      console.log("Disconnected from database");
      process.exit(0);
    });
  });
};

// Listen for termination signals
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
