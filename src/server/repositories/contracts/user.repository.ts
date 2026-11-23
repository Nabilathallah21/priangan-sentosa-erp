import { UserDTO, UserRole } from "@/types/dto";
import { PaginatedQuery, PaginatedResult } from "@/types/pagination";

export interface UserRepository {
  findByIdentifier(identifier: string): Promise<UserDTO | null>;
  verifyCredentials(identifier: string, plainPassword: string): Promise<UserDTO | null>;
  listUsers(query: PaginatedQuery<{ role?: UserRole; isActive?: boolean }>): Promise<PaginatedResult<UserDTO>>;
  createUser(data: { name: string; username: string; email: string; passwordHash: string; role: UserRole }): Promise<UserDTO>;
  updateUserStatus(id: string, isActive: boolean): Promise<UserDTO>;
}