# Migración a Cloud SQL — proyecto_ifc

**Fase 1: MySQL** (este doc). Fase 2 (Firestore) pendiente.

Fecha: 2026-05-25.

## Cambio realizado

`proyecto_ifc` ya **NO** apunta al RDS MySQL de AWS. Ahora va al Cloud SQL
recién creado en GCP `proyecto-ifc-497317`. La misma instancia que el chatbot
Sofia v2 está usando — comparten DB `chatbot_db`.

## Lo que cambió en código

| Archivo | Cambio |
|---|---|
| `.env` | `DATABASE_URL` apunta a `mysql://bot_user:***@34.172.33.166:3306/chatbot_db?sslaccept=accept_invalid_certs` |
| `.env.local` | mismo `DATABASE_URL` (override personal) y se eliminaron las legacy `DB_HOST/USER/PASSWORD` |
| Prisma schema | sin cambio — el schema es 1:1 |
| Código Next.js | sin cambio — Prisma client sigue igual |

Mongo Atlas sigue intacto hasta Fase 2.

## Verificación local

Desde `proyecto_ifc/`:

```bash
npx prisma db execute --schema=prisma/schema.prisma --stdin <<< 'SELECT COUNT(*) AS total FROM clientes;'
# → Script executed successfully.

# La app:
npm run dev
# y probar login + alguna ruta /clientes, /citas, /dashboard
```

## Vercel — variables de entorno a actualizar

En el dashboard de Vercel (Project Settings → Environment Variables), cambiar
**únicamente** estas dos. Las demás (NextAuth, Mongo, Google SA) **no cambian**
en Fase 1.

| Env Var | Antes (RDS) | Después (Cloud SQL) | Environments |
|---|---|---|---|
| `DATABASE_URL` | `mysql://admin:zQumSnUd9MNtjcsK@chatbot-mysql.c5yiocg6aj0e.us-east-2.rds.amazonaws.com:3306/chatbot_db` | `mysql://bot_user:<NEW_PASSWORD>@34.172.33.166:3306/chatbot_db?sslaccept=accept_invalid_certs` | Production + Preview + Development |

> **NEW_PASSWORD**: obtener desde Secret Manager:
> ```bash
> gcloud secrets versions access latest --secret=cloudsql-bot-password --project=proyecto-ifc-497317
> ```
> (o pedirla al admin del proyecto GCP — está sincronizada con el usuario
> `bot_user` en MySQL).

### Pasos exactos en Vercel

1. Ir al proyecto en https://vercel.com/dashboard
2. Settings → Environment Variables
3. Encontrar `DATABASE_URL` → click en los `…` → Edit
4. Pegar el nuevo valor (`mysql://bot_user:...@34.172.33.166:...`)
5. Marcar los 3 environments (Production, Preview, Development)
6. Save
7. Ir a Deployments → re-deployar la última (botón "Redeploy")

## Configuración Cloud SQL relevante

| Campo | Valor |
|---|---|
| Instancia | `chatbot-sofia-mysql` |
| Project | `proyecto-ifc-497317` |
| Versión | MySQL 8.0 |
| Region | `us-central1` |
| Tier | `db-f1-micro` |
| Public IP | `34.172.33.166` |
| Authorized networks | `0.0.0.0/0` (cualquier origen, requiere SSL + user/pass) |
| SSL mode | `ENCRYPTED_ONLY` (SSL obligatorio, sin client cert) |
| HA | no |
| Auto-backup | sí, 03:00 UTC |
| Bin-log (PITR-like) | sí |

## Seguridad

- **bot_user** tiene `GRANT ALL ON chatbot_db.*` (sólo esa DB, no las del root)
- Plugin de auth: `mysql_native_password` (compatible con Prisma + Vercel)
- SSL en tránsito obligatorio. La opción `sslaccept=accept_invalid_certs` solo
  desactiva validación del certificate chain (que en Cloud SQL es self-signed
  Google CA). La conexión SIGUE cifrada. Para Vercel es aceptable; si quieres
  cert validation estricta, bajar el server CA con
  `gcloud sql ssl server-ca-certs list` y montarlo como volume / env var.
- Password en Secret Manager (`cloudsql-bot-password`). Rotación: re-generar +
  `gcloud sql users set-password bot_user --instance=chatbot-sofia-mysql --password=...`
  + actualizar `DATABASE_URL` en Vercel.

## Si algo falla post-deploy

1. **Access denied**: revisa que pegaste la URL exacta (incluyendo `?sslaccept=...`).
   Verificar el password contra Secret Manager.
2. **Connection timeout**: Cloud SQL Public IP debe estar habilitada (sí lo
   está). Si Vercel rota IPs y deja de aceptar, ver authorized networks.
3. **SSL error**: la URL debe incluir `?sslaccept=accept_invalid_certs` o
   `?sslaccept=strict` con CA. Sin parámetro SSL, Prisma intenta sin TLS y
   Cloud SQL rechaza (porque `sslMode=ENCRYPTED_ONLY`).
4. **Schema drift**: si Prisma se queja de tablas faltantes, correr
   `npx prisma db pull` para confirmar que el schema local coincide con Cloud
   SQL (debería, porque migramos toda la data tabla por tabla).

## Pendiente — Fase 2 (Firestore)

Después de validar este deploy con Cloud SQL, viene el refactor de los 8
endpoints que aún leen de Mongo Atlas:

- `src/app/api/clients/conversations/route.js`
- `src/app/api/clients/conversations/[phone]/route.js`
- `src/app/api/clients/route.js`
- `src/app/api/clients/[id]/route.js`
- `src/app/api/dashboard/conversaciones/route.js`
- `src/app/api/dashboard/conversaciones/[id]/route.js`
- `src/app/api/dashboard/interacciones/route.js`
- `src/app/api/dashboard/nuevas-conversaciones/route.js`

Cambio: `@google-cloud/firestore` + colección `clientes/{id}/conversaciones/{id}/interacciones/{id}`
en la DB Firestore `chatbot-sofia`.
