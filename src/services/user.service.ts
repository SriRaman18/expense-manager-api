import prisma from "../config/database";
import { CreateUserDto, UserResponse } from "../types/user.types";
import { AppError } from "../types/error.types";

class UserService {
  async createUser(data: CreateUserDto): Promise<UserResponse> {
    // Validate email
    if (!data.email || !data.email.trim()) {
      throw new AppError("Email is required", 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new AppError("Invalid email format", 400);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.trim().toLowerCase() },
    });

    if (existingUser) {
      throw new AppError("User with this email already exists", 409);
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email.trim().toLowerCase(),
        name: data.name?.trim() || null,
      },
    });

    return user;
  }

  async getAllUsers(): Promise<UserResponse[]> {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return users;
  }

  async getUserById(id: string): Promise<UserResponse> {
    if (!id || !id.trim()) {
      throw new AppError("User ID is required", 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: id.trim() },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  }
}

export default new UserService();
