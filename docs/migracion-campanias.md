# Migración de campañas (AWS API Gateway/Lambda → Cloud Run + GCP)

**Fase 3.** Reemplaza el código borrado que llamaba a:
- `POST https://pdcgrsx8x0.execute-api.us-east-2.amazonaws.com/enviarMensaje`
- `POST https://pdcgrsx8x0.execute-api.us-east-2.amazonaws.com/lambdaA`

## Cambio en proyecto_ifc

| Archivo | Cambio |
|---|---|
| `src/app/api/messages/send/route.js` | NUEVO. Proxy server-side a Cloud Run `/messages/send` con API key |
| `src/app/api/campaigns/run/route.js` | NUEVO. Proxy server-side a Cloud Run `/campaigns/run` con API key |
| `src/components/chat-window.jsx` | URL cambiada de API Gateway a `/api/messages/send` (relativa, mismo dominio) |
| `src/app/campaigns/page.js` | URL cambiada de API Gateway a `/api/campaigns/run` |
| `.env` / `.env.local` | + `CHATBOT_API_URL`, `CHATBOT_API_KEY` |

El browser ya **no** habla directo con AWS ni con Cloud Run — siempre va por el proxy `/api/...` de Next.js, que es quien tiene la API key.

## Env vars de Vercel a agregar

| Env Var | Valor | Environments |
|---|---|---|
| `CHATBOT_API_URL` | `https://chatbot-sofia-87449178744.us-central1.run.app` | Production + Preview + Development |
| `CHATBOT_API_KEY` | (valor del secret `chatbot-api-key` en GCP Secret Manager) | Production + Preview + Development |

Para obtener el `CHATBOT_API_KEY`:

```bash
gcloud secrets versions access latest --secret=chatbot-api-key --project=proyecto-ifc-497317
```

Cópialo en Vercel → Settings → Environment Variables → Add new.

## Backend correspondiente

Ver [chatbot_sofia_v2/docs/recursos/10-campaigns-cloud-tasks-scheduler.md](../../chatbot_sofia_v2/docs/recursos/10-campaigns-cloud-tasks-scheduler.md)
para el detalle de los endpoints, Cloud Tasks queue, Cloud Scheduler y SAs.

## Tras el deploy a Vercel

Probar:
1. Abrir chat de un cliente y enviar un mensaje manual desde la UI → debe llegar al WhatsApp.
2. Crear una campaña OUT con `activation_type=now` y pocos clientes (5-10) → deben recibir el template.
3. Verificar en `gcloud logging` que aparecen las llamadas `/messages/send` y `/campaigns/run` con `X-API-Key`.

Si en Vercel ves `401`, revisa que la env var `CHATBOT_API_KEY` esté seteada con el valor exacto del secret (sin comillas, sin espacios, sin BOM).
