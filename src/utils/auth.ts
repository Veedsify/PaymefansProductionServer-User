// import { AuthOptions } from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// // import { prismaQuery } from "./prisma";
// import type { User } from "next-auth";
// import { PrismaAdapter } from "@next-auth/prisma-adapter";
// import { Adapter } from "next-auth/adapters";
// import { JWT } from "next-auth/jwt";
// import { hashPassword } from "./passwordHasher";

// export const authOptions: AuthOptions = {
//   adapter: PrismaAdapter(prismaQuery) as Adapter,
//   pages: {
//     signIn: "/",
//   },
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(
//         credentials: Record<"email" | "password", string> | undefined
//       ): Promise<User | null> {
//         if (!credentials) {
//           return null; // Handle the case when credentials are undefined
//         }
//         const user = await prismaQuery.user.findFirst({
//           where: {
//             email: credentials.email,
//           },
//         });
//         if (user?.password === hashPassword(credentials.password)) {
//           if (user) {
//             return {
//               id: user.id.toString(),
//               email: user.email,
//               name: user.name,
//               role: user.role,
//               username: user.username,
//             } as User;
//           } else {
//             return null;
//           }
//         } else {
//           return null;
//         }
//       },
//     }),
//   ],
//   callbacks: {
//     async session({ token, session }) {
//       if (token) {
//         session.user.email = token.email;
//         session.user.name = token.name;
//         session.user.role = token.role;
//         session.user.image = token.image;
//         session.user.username = token.username;
//       }
//       return session;
//     },
//     async jwt({ token, user }) {
//       const thisUser = await prismaQuery.user.findFirst({
//         where: {
//           email: token.email as string,
//         },
//       });
//       if (!thisUser) {
//         return token;
//       }
//       return {
//         name: thisUser.name,
//         email: thisUser.email,
//         role: thisUser.role,
//         image: thisUser.profile_image,
//         username: thisUser.username,
//       } as JWT;
//     },
//   },
//   session: { strategy: "jwt" },
// };
