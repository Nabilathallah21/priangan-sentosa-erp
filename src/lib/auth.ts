import NextAuth, { DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { getContainer } from "@/server/container";
import { UserRole } from "@/types/dto";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      username: string;
    } & DefaultSession["user"];
  }
  interface User {
    id: string;
    role: UserRole;
    username: string;
  }
}

const loginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        identifier: { label: "Username / Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;
        const { userRepository } = getContainer();
        const user = await userRepository.verifyCredentials(parsed.data.identifier, parsed.data.password);
        if (!user) return null;
        return { id: user.id, name: user.name, email: user.email, role: user.role, username: user.username };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
});
