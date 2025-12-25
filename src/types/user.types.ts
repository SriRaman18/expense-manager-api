export interface CreateUserDto {
  email: string;
  name?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserResponse {
  message: string;
  user: UserResponse;
}

export interface GetUsersResponse {
  count: number;
  users: UserResponse[];
}

export interface GetUserResponse {
  user: UserResponse;
}
