import express from "express";
import dotenv from "dotenv";
import routes from "./routes/index.routes";
import { errorHandler } from "./middleware/errorHandler.middleware";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/", routes); // Root, health, and API routes

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
