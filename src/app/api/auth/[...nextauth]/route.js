import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/db";
import { compare } from "bcrypt";
import { signIn } from "next-auth/react";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Usuario", type: "text" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        const { username, password } = credentials;

        // Busca el usuario en la tabla usuario
        const user = await prisma.usuario.findUnique({
          where: { username: username }
        });

        if (!user) {
          return null;
        }

        // Si la contraseña está hasheada en la base de datos:
        const isValid = await compare(password, user.password);
        if (!isValid) {
          return null;
        }

        return { id: user.usuario_id, name: user.username, email: null };
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Consulta para obtener toda la información del asesor
        const asesor = await prisma.asesor.findFirst({
          where: { usuario_id: user.id },
          select: {
            asesor_id: true,
            nombre: true,
            primer_apellido: true,
            segundo_apellido: true,
            celular: true,
            usuario_id: true,
          },
        });
        if (asesor) {
          token.asesor = asesor; // Guarda toda la información en el token
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.asesor) {
        session.user.asesor = token.asesor; // Guarda toda la información en la sesión
      }
      return session;
    }
  },
  pages:{
    signIn: "/login", // Página para iniciar sesión
    signOut: "/login", // Página después de cerrar sesión
    error: "/login", // Página para errores de autenticación
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
