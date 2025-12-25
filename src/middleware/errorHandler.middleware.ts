import { Request, Response, NextFunction } from "express";
import { AppError } from "../types/error.types";

export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // If it's an AppError, use its status code
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
    });
    return;
  }

  // Log unexpected errors
  console.error("Unexpected error:", err);

  // Default to 500 for unexpected errors
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
};
