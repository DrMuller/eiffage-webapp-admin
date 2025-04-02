import type { User } from './auth'

export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface CreateUserWithoutPasswordRequest {
  firstName: string;
  lastName: string;
  email: string;
}

export interface GetAllUsersResponse {
  users: User[];
}
