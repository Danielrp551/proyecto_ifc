import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

import { SESSION_VERSION } from "@/lib/session-version";

/**
 * Puerta unica del Portal.
 *
 * Antes este middleware solo miraba dos rutas (`/dashboard` y `/settings`) y las 25 rutas
 * de datos de `/api` no comprobaban la sesion en ningun sitio: un `GET /api/citas` sin
 * cookie devolvia 200 con la agenda entera. Ahora la regla se invierte: **todo exige
 * sesion salvo lo que esta explicitamente abierto**, que es solo la pantalla de acceso y
 * el propio NextAuth.
 *
 * Y la sesion tiene que traer el sello de version vigente (`token.v`), de modo que subir
 * `SESSION_VERSION` cierre todas las sesiones abiertas con un despliegue.
 *
 * Una peticion a `/api/*` sin sesion recibe **401 JSON**, no una redireccion: el cliente
 * espera JSON y una redireccion a `/login` le llegaria como HTML y reventaria al parsear.
 */

// Lo unico que se puede tocar sin sesion.
const RUTAS_ABIERTAS = ["/login", "/api/auth"];

function esAbierta(pathname) {
  return RUTAS_ABIERTAS.some((ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`));
}

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  if (esAbierta(pathname)) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const sesionValida = Boolean(token) && token.v === SESSION_VERSION;

  if (sesionValida) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  return NextResponse.redirect(new URL("/login", req.url));
}

export const config = {
  // Todo menos los estaticos de Next y los archivos de `public/`. Sin este matcher el
  // middleware correria tambien sobre los bundles y las imagenes.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpe?g|gif|svg|webp|ico|css|js|map|txt|xml|woff2?)$).*)",
  ],
};
