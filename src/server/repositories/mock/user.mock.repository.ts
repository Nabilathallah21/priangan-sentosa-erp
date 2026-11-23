import "server-only";
import bcrypt from "bcryptjs";
import { UserRepository } from "../contracts/user.repository";
import { UserDTO, UserRole } from "@/types/dto";
import { PaginatedQuery, PaginatedResult } from "@/types/pagination";
import { getMockStore, simulateMockNetwork } from "@/mocks/store";
import { AppError } from "@/lib/errors";

export class MockUserRepository implements UserRepository {
  async findByIdentifier(identifier: string): Promise<UserDTO | null> {
    await simulateMockNetwork();
    const clean = identifier.trim().toLowerCase();
    const found = getMockStore().users.find(
      (u) => u.username.toLowerCase() === clean || u.email.toLowerCase() === clean
    );
    if (!found) return null;
    const { passwordHash: _pw, ...dto } = found;
    return dto;
  }

  async verifyCredentials(identifier: string, plainPassword: string): Promise<UserDTO | null> {
    await simulateMockNetwork();
    const clean = identifier.trim().toLowerCase();
    const found = getMockStore().users.find(
      (u) => u.isActive && (u.username.toLowerCase() === clean || u.email.toLowerCase() === clean)
    );
    if (!found) return null;
    const ok = await bcrypt.compare(plainPassword, found.passwordHash);
    if (!ok) return null;
    const { passwordHash: _pw, ...dto } = found;
    return dto;
  }

  async listUsers(query: PaginatedQuery<{ role?: UserRole; isActive?: boolean }>): Promise<PaginatedResult<UserDTO>> {
    await simulateMockNetwork();
    let rows = getMockStore().users.map(({ passwordHash: _pw, ...dto }) => dto);
    if (query.search) {
      const q = query.search.toLowerCase();
      rows = rows.filter((u) => u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q));
    }
    const page = Math.max(1, query.page || 1);
    const pageSize = Math.max(1, query.pageSize || 20);
    return { items: rows.slice((page - 1) * pageSize, page * pageSize), total: rows.length, page, pageSize };
  }

  async createUser(data: { name: string; username: string; email: string; passwordHash: string; role: UserRole }): Promise<UserDTO> {
    await simulateMockNetwork();
    const created = {
      id: `usr-${Date.now()}`,
      name: data.name,
      username: data.username,
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    getMockStore().users.unshift(created);
    const { passwordHash: _pw, ...dto } = created;
    return dto;
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<UserDTO> {
    await simulateMockNetwork();
    const found = getMockStore().users.find((u) => u.id === id);
    if (!found) throw new AppError("NOT_FOUND", "Pengguna tidak ditemukan.");
    found.isActive = isActive;
    const { passwordHash: _pw, ...dto } = found;
    return dto;
  }
}