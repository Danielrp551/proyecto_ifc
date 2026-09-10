import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/db";
import { compare } from "bcrypt";
import { signIn } from "next-auth/react";
import { SESSION_VERSION } from "@/lib/session-version";

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
          where: { username: username },
          select: {
            usuario_id: true,
            username: true,
            password: true,
            activo: true,
            roles: {
              select: {
                nombre_rol: true,
              },
            },
          },
        });
        console.log("Usuario" , user);

        if (!user) {
          return null;
        }

        if(user.activo === 0)
          return null;

        const isValid = await compare(password, user.password);
        if (!isValid) {
          return null;
        }

        return { id: user.usuario_id, name: user.username, email: null, rol: user.roles.nombre_rol };
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (!user) {
        // Lecturas posteriores de la sesión: se vuelve a preguntar por el usuario para que
        // un `activo = 0` surta efecto sin esperar a que caduque el JWT. Si deja de estar
        // activo se le quita el sello y el middleware deja de aceptar la sesión.
        //
        // Falla ABIERTO a propósito: si la base no responde, se conserva el token. Este
        // control es una comodidad; la palanca dura es subir SESSION_VERSION.
        try {
          const usuarioId = Number(token.sub);
          if (Number.isFinite(usuarioId)) {
            const vigente = await prisma.usuario.findUnique({
              where: { usuario_id: usuarioId },
              select: { activo: true },
            });
            if (!vigente || vigente.activo === 0) {
              delete token.v;
            }
          }
        } catch (error) {
          console.error("No se pudo revalidar el usuario de la sesión:", error);
        }
        return token;
      }

      token.rol = user.rol;
      // Sello de versión de sesión: el middleware sólo acepta las que lo traen igual,
      // así que subir SESSION_VERSION y desplegar cierra todas las sesiones vivas.
      token.v = SESSION_VERSION;

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
      return token;
    },
    async session({ session, token }) {
      if (token.asesor) {
        session.user.asesor = token.asesor; // Guarda toda la información en la sesión
      }
      if(token.rol){
        session.user.rol = token.rol;
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
