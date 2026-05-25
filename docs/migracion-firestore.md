# Migración a Firestore — proyecto_ifc

**Fase 2: Mongo Atlas → Cloud Firestore (Native mode).** Después de Fase 1 (Cloud SQL).

Fecha: 2026-05-25.

## Qué cambió

Los 8 endpoints que leían MongoDB Atlas ahora leen Cloud Firestore (database
`chatbot-sofia` en `proyecto-ifc-497317`). Mismo modelo de datos que el chatbot
v2 — comparten subcollections.

### Endpoints refactorizados

| Endpoint | Antes (Mongo) | Después (Firestore) |
|---|---|---|
| `api/clients/route.js` POST | `insertOne` + `updateOne $push` | `clienteRef.set()` + `subcoll.doc().set()` |
| `api/clients/[id]/route.js` GET | `findOne projection conversaciones` | `findClienteDocByCelular()` + `listConversacionesConInteracciones()` |
| `api/clients/conversations/route.js` | `aggregate $arrayElemAt[-1]` | `getUltimaConversacion()` paralelo |
| `api/clients/conversations/[phone]/route.js` | `findOne projection` | mismo helper |
| `api/dashboard/conversaciones/route.js` | `aggregate $unwind+match+count` | `countInteraccionesEnRangoParaCelulares()` |
| `api/dashboard/conversaciones/[id]/route.js` | `findOne projection` | helpers Firestore |
| `api/dashboard/interacciones/route.js` | `aggregate count` | `countInteraccionesEnRango()` (collection group) |
| `api/dashboard/nuevas-conversaciones/route.js` | `aggregate count` | `countInteraccionesEnRangoParaCelulares()` |

### Archivos nuevos / modificados

| Archivo | Cambio |
|---|---|
| `src/lib/firestore.js` | NUEVO. Cliente singleton + helpers de queries comunes |
| `src/lib/mongodb.js` | ELIMINADO |
| `package.json` | `@google-cloud/firestore` agregado, `mongodb` removido |
| `.env` / `.env.local` | `MONGODB_*` eliminadas, `FIRESTORE_DATABASE_ID` + `GOOGLE_APPLICATION_CREDENTIALS_JSON` agregadas |
| `.gitignore` | Agrega `.vercel-sa-key.json` y `*-sa-key.json` |

## Vercel — env vars a actualizar

En el dashboard de Vercel (Project Settings → Environment Variables):

### 1. ELIMINAR estas variables
- `MONGODB_URI`
- `MONGODB_DB`

### 2. AGREGAR estas dos nuevas

| Env Var | Valor | Notas |
|---|---|---|
| `FIRESTORE_DATABASE_ID` | `chatbot-sofia` | Texto plano |
| `GOOGLE_APPLICATION_CREDENTIALS_JSON` | (JSON completo de la SA, una sola línea) | Ver instrucciones abajo |

### Cómo obtener el valor de `GOOGLE_APPLICATION_CREDENTIALS_JSON`

El JSON se generó como `proyecto_ifc/.vercel-sa-key.json` (archivo gitignored,
sólo en tu máquina local). Para pegarlo en Vercel:

```bash
# Opción 1: copy al clipboard directo
cat proyecto_ifc/.vercel-sa-key.json | clip  # Windows
cat proyecto_ifc/.vercel-sa-key.json | pbcopy  # Mac

# Opción 2: imprimir y copiar manual
cat proyecto_ifc/.vercel-sa-key.json
```

En Vercel → Add New Environment Variable:
- Key: `GOOGLE_APPLICATION_CREDENTIALS_JSON`
- Value: pega el JSON completo (Vercel acepta multilínea, pero compactalo si
  prefieres: `cat ... | tr -d '\n'`)
- Environments: Production + Preview + Development

Después: Deployments → Redeploy la última.

## Service Account y permisos

| Campo | Valor |
|---|---|
| SA | `proyecto-ifc-vercel-sa@proyecto-ifc-497317.iam.gserviceaccount.com` |
| Rol | `roles/datastore.user` (sólo Firestore, nada más) |
| Display name | proyecto_ifc Vercel SA |
| Key generada | `proyecto_ifc/.vercel-sa-key.json` (gitignored) |

La SA es distinta de la que usa el chatbot Sofia v2 (`chatbot-sofia-sa`). Esa
sigue intacta. Separamos identidades para no compartir credenciales entre apps.

## Modelo de datos Firestore (referencia)

```
chatbot-sofia (DB)
└── clientes/{cliente_id}                    fields: nombre, celular, email, fecha_creacion
    └── conversaciones/{conversacion_id}     fields: estado, fecha_inicio, ultima_interaccion
        └── interacciones/{auto_id}          fields: fecha, mensaje_cliente, mensaje_chatbot
```

## Helpers disponibles en `lib/firestore.js`

```js
import getFirestore, {
  findClienteDocByCelular,           // → DocumentSnapshot | null
  listConversacionesConInteracciones, // (clienteDoc) → conversaciones[] con interacciones
  getUltimaConversacion,              // (clienteDoc) → ultima conversacion con interacciones
  countInteraccionesEnRango,          // (fechaInicio, fechaFin) → count total via collection group
  countInteraccionesEnRangoParaCelulares, // filtrado por lista de celulares
} from '@/lib/firestore';
```

Para queries custom: `getFirestore()` devuelve la instancia `Firestore` directa.

## Costos Firestore (operacional mensual estimado)

| Concepto | Estimado |
|---|---|
| Storage (~50 MB) | <$0.01 |
| Reads (~10k/día tráfico admin) | ~$0.20 |
| Writes (sólo POST clientes y endpoints write) | ~$0.05 |
| **Total** | **<$1/mes** |

Comparado con el Mongo Atlas M0 saturado: similar/mejor. Sin límite de 512 MB.

## Verificación local previa al deploy

Antes de actualizar Vercel, validar local:

```bash
# 1. Build pasa
npm run build

# 2. Dev server arranca
npm run dev

# 3. Endpoints responden 200
curl http://localhost:3000/api/dashboard/interacciones?fechaInicio=2025-01-01&fechaFin=2025-12-31
# → {"totalInteracciones": ~50000, ...}

curl "http://localhost:3000/api/clients/conversations/+51XXXXXXXXX"
# → {"conversaciones": [...]}
```

Para que funcione local:
- `gcloud auth application-default login` ejecutado una vez (provee credenciales para el SDK)
- O `GOOGLE_APPLICATION_CREDENTIALS_JSON` ya está en `.env.local` con el JSON completo

## Si algo falla post-deploy en Vercel

1. **`Cannot find module '@google-cloud/firestore'`** → la dependencia no se instaló. Verificar que `package.json` tiene `@google-cloud/firestore` (sí) y que Vercel ejecutó `npm install`.
2. **`PERMISSION_DENIED` o `403`** → la SA no tiene `roles/datastore.user`. Verificar con `gcloud projects get-iam-policy proyecto-ifc-497317 --filter=members:proyecto-ifc-vercel-sa@*`.
3. **`Could not load the default credentials`** → falta `GOOGLE_APPLICATION_CREDENTIALS_JSON` en Vercel. Volver a agregar la env var.
4. **`Firestore database 'chatbot-sofia' not found`** → falta `FIRESTORE_DATABASE_ID=chatbot-sofia` en Vercel. La default `(default)` NO existe.
5. **Queries muy lentas (>30s)** → considerar índices compuestos. Firestore emite warning con un link directo para crear el índice. Seguirlo y reintentar.

## Optimizaciones futuras

- **Counters precalculados** en cliente doc para evitar N+1 (`num_interacciones`, `ultima_interaccion`)
- **Composite indexes** para queries combinadas (`estado` + `fecha_ultima_interaccion`)
- **Pagination con cursors** (`startAfter()`) en vez de `skip+take` para listas grandes
- **Cache de connection del Firestore SDK** entre invocaciones serverless (Vercel ya lo hace con globalThis)
