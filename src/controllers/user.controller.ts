import { Request, Response } from "express";
import userService from "../services/user.service";
import {
  CreateUserResponse,
  GetUsersResponse,
  GetUserResponse,
} from "../types/user.types";

class UserController {
  async createUser(req: Request, res: Response): Promise<void> {
    const user = await userService.createUser(req.body);

    const response: CreateUserResponse = {
      message: "User created successfully",
      user,
    };

    res.status(201).json(response);
  }

  async getAllUsers(_req: Request, res: Response): Promise<void> {
    const users = await userService.getAllUsers();

    const response: GetUsersResponse = {
      count: users.length,
      users,
    };

    res.status(200).json(response);
  }

  async getUserById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const user = await userService.getUserById(id);

    const response: GetUserResponse = {
      user,
    };

    res.status(200).json(response);
  }
}

export default new UserController();
