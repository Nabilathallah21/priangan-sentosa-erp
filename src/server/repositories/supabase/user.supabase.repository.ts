import "server-only";
import bcrypt from "bcryptjs";
import { UserRepository } from "../contracts/user.repository";
import { UserDTO, UserRole } from "@/types/dto";
import { PaginatedQuery, PaginatedResult } from "@/types/pagination";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { AppError } from "@/lib/errors";

interface UserRow {
  id: string;
  name: string;
  username: string;
  email: string;
  password_hash: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

function mapUser(row: UserRow): UserDTO {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    email: row.email,
    role: row.role,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

export class SupabaseUserRepository implements UserRepository {
  async findByIdentifier(identifier: string): Promise<UserDTO | null> {
    const sb = getSupabaseAdmin();
    const clean = identifier.trim().toLowerCase();
    const { data, error } = await sb
      .from("users")
      .select("*")
      .or(`username.ilike.${clean},email.ilike.${clean}`)
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    return mapUser(data as UserRow);
  }

  async verifyCredentials(identifier: string, plainPassword: string): Promise<UserDTO | null> {
    const sb = getSupabaseAdmin();
    const clean = identifier.trim().toLowerCase();
    const { data, error } = await sb
      .from("users")
      .select("*")
      .or(`username.ilike.${clean},email.ilike.${clean}`)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;
    const row = data as UserRow;
    const valid = await bcrypt.compare(plainPassword, row.password_hash);
    if (!valid) return null;
    return mapUser(row);
  }

  async listUsers(query: PaginatedQuery<{ role?: UserRole; isActive?: boolean }>): Promise<PaginatedResult<UserDTO>> {
    const sb = getSupabaseAdmin();
    const page = Math.max(1, query.page || 1);
    const pageSize = Math.max(1, query.pageSize || 20);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    let req = sb.from("users").select("*", { count: "exact" }).order("created_at", { ascending: false });
    if (query.search) {
      req = req.or(`name.ilike.%${query.search}%,username.ilike.%${query.search}%,email.ilike.%${query.search}%`);
    }
    if (query.filters?.role) req = req.eq("role", query.filters.role);
    if (typeof query.filters?.isActive === "boolean") req = req.eq("is_active", query.filters.isActive);

    const { data, count, error } = await req.range(from, to);
    if (error) throw new AppError("INTERNAL_ERROR", error.message);

    return {
      items: ((data ?? []) as UserRow[]).map(mapUser),
      total: count ?? 0,
      page,
      pageSize,
    };
  }

  async createUser(data: { name: string; username: string; email: string; passwordHash: string; role: UserRole }): Promise<UserDTO> {
    const sb = getSupabaseAdmin();
    const { data: inserted, error } = await sb
      .from("users")
      .insert({
        name: data.name,
        username: data.username.trim().toLowerCase(),
        email: data.email.trim().toLowerCase(),
        password_hash: data.passwordHash,
        role: data.role,
        is_active: true,
      })
      .select("*")
      .single();

    if (error) throw new AppError("INTERNAL_ERROR", error.message);
    return mapUser(inserted as UserRow);
  }

  async updateUserStatus(id: string, isActive: boolean): Promise<UserDTO> {
    const sb = getSupabaseAdmin();
    const { data: updated, error } = await sb
      .from("users")
      .update({ is_active: isActive })
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw new AppError("INTERNAL_ERROR", error.message);
    return mapUser(updated as UserRow);
  }
}