// Singleton Firestore client (Native mode, database 'chatbot-sofia').
//
// Modelo de datos:
//   /clientes/{cliente_id}
//     fields: cliente_id, nombre, celular, email, fecha_creacion
//     /conversaciones/{conversacion_id}
//       fields: conversacion_id, estado, fecha_inicio, ultima_interaccion
//       /interacciones/{auto_id}
//         fields: fecha, mensaje_cliente, mensaje_chatbot
//
// Credenciales:
//   - Vercel / prod: GOOGLE_APPLICATION_CREDENTIALS_JSON con el JSON completo de la SA
//   - Local: gcloud auth application-default login → SDK auto-detecta

import { Firestore } from '@google-cloud/firestore';

let _db;

function buildFirestore() {
  const databaseId = process.env.FIRESTORE_DATABASE_ID || 'chatbot-sofia';
  const opts = { databaseId };

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    const creds = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
    opts.projectId = creds.project_id;
    opts.credentials = {
      client_email: creds.client_email,
      private_key: creds.private_key,
    };
  } else if (process.env.GCP_PROJECT_ID) {
    opts.projectId = process.env.GCP_PROJECT_ID;
  }

  return new Firestore(opts);
}

function getFirestore() {
  if (process.env.NODE_ENV === 'development') {
    if (!global._firestoreSingleton) {
      global._firestoreSingleton = buildFirestore();
    }
    _db = global._firestoreSingleton;
  } else {
    if (!_db) _db = buildFirestore();
  }
  return _db;
}

export default getFirestore;

// --- Helpers de acceso a documentos ---

/** Encuentra el doc cliente por celular. Devuelve `null` si no existe. */
export async function findClienteDocByCelular(celular) {
  const db = getFirestore();
  const snap = await db
    .collection('clientes')
    .where('celular', '==', celular)
    .limit(1)
    .get();
  return snap.empty ? null : snap.docs[0];
}

/** Devuelve todas las conversaciones (con sus interacciones) de un cliente. */
export async function listConversacionesConInteracciones(clienteDoc) {
  const convsSnap = await clienteDoc.ref
    .collection('conversaciones')
    .orderBy('ultima_interaccion', 'desc')
    .get();

  const out = [];
  for (const convDoc of convsSnap.docs) {
    const conv = convDoc.data();
    const interSnap = await convDoc.ref.collection('interacciones').orderBy('fecha').get();
    conv.interacciones = interSnap.docs.map((d) => normalizeInteraccion(d.data()));
    out.push(conv);
  }
  return out;
}

/** Devuelve sólo la última conversación (con sus interacciones). */
export async function getUltimaConversacion(clienteDoc) {
  const convsSnap = await clienteDoc.ref
    .collection('conversaciones')
    .orderBy('ultima_interaccion', 'desc')
    .limit(1)
    .get();
  if (convsSnap.empty) return null;
  const convDoc = convsSnap.docs[0];
  const conv = convDoc.data();
  const interSnap = await convDoc.ref.collection('interacciones').orderBy('fecha').get();
  conv.interacciones = interSnap.docs.map((d) => normalizeInteraccion(d.data()));
  return conv;
}

/** Cuenta interacciones en un rango de fechas (collection group query). */
export async function countInteraccionesEnRango(fechaInicio, fechaFin) {
  const db = getFirestore();
  const snap = await db
    .collectionGroup('interacciones')
    .where('fecha', '>=', fechaInicio)
    .where('fecha', '<=', fechaFin)
    .count()
    .get();
  return snap.data().count;
}

/** Cuenta interacciones en rango pero sólo para clientes cuya celular esté en `celulares`. */
export async function countInteraccionesEnRangoParaCelulares(fechaInicio, fechaFin, celulares) {
  if (!celulares || celulares.length === 0) return 0;
  const db = getFirestore();

  // Firestore no tiene join: tomamos los clientes en chunks de 30 (límite where-in)
  const CHUNK = 30;
  let total = 0;
  for (let i = 0; i < celulares.length; i += CHUNK) {
    const chunk = celulares.slice(i, i + CHUNK);
    const clientesSnap = await db
      .collection('clientes')
      .where('celular', 'in', chunk)
      .get();

    // Para cada cliente, count interacciones en rango (collection group filtered)
    // Como collection group no se puede filtrar por cliente raíz, iteramos manual.
    await Promise.all(
      clientesSnap.docs.map(async (clienteDoc) => {
        const convsSnap = await clienteDoc.ref.collection('conversaciones').get();
        await Promise.all(
          convsSnap.docs.map(async (convDoc) => {
            const cnt = await convDoc.ref
              .collection('interacciones')
              .where('fecha', '>=', fechaInicio)
              .where('fecha', '<=', fechaFin)
              .count()
              .get();
            total += cnt.data().count;
          })
        );
      })
    );
  }
  return total;
}

/** Convierte Timestamp de Firestore en Date / ISO según corresponda. */
export function normalizeInteraccion(i) {
  return {
    fecha: i.fecha?.toDate?.() ?? (i.fecha ? new Date(i.fecha) : null),
    mensaje_cliente: i.mensaje_cliente ?? null,
    mensaje_chatbot: i.mensaje_chatbot ?? null,
  };
}
