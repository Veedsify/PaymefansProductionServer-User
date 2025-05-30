import { User as UserDb, UserRole } from "@prisma/client";
import type { User } from "@/types/NextAuth";
import "next-auth/jwt";

type Userid = string;

declare module "@/types/NextAuth" {
  interface Session {
    user: User & {
      id: Userid;
      username: string;
      image: string;
      role: UserRole;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: Userid;
    username: string;
    image: string;
    role: UserRole;
  }
}
