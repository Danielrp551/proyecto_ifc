/**
 * Version del sello de sesion.
 *
 * Cada sesion se firma con este numero (`token.v`) al iniciar sesion, y el middleware
 * solo acepta las que lo traen igual. Subir este numero y desplegar **cierra todas las
 * sesiones vivas de golpe**, sin tocar variables de entorno ni la base de datos.
 *
 * Por que hacia falta: la sesion es un JWT de 30 dias que se renueva sola y solo se
 * consultaba la base al iniciar sesion. Poner `activo = 0` en `usuario` impedia entrar
 * de nuevo, pero **no echaba a quien ya estaba dentro**.
 *
 * Historial:
 *   1  (implicito) — sesiones anteriores al 2026-09-09, sin sello.
 *   2  2026-09-09 — primer sello. Al desplegarlo, todo el mundo vuelve a iniciar sesion.
 */
export const SESSION_VERSION = 2;
