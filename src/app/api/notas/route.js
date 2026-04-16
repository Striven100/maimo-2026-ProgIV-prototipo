const { getDB } = require("@/lib/db");
const { getSession } = require("@/lib/session");

export async function GET(request) {
  const session = await getSession(request);
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });

  const db = await getDB();
  const notas = db.collection("notas");
  
  const result = await notas.find({
    ownerId: session.id
  }).sort({ createdAt: -1 }).toArray();

  return Response.json(result);
}

export async function POST(request) {
  const session = await getSession(request);
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });

  const { titulo, contenido, materiaId } = await request.json();
  
  if (!titulo || !materiaId) {
    return Response.json({ error: "Título y materia requeridos" }, { status: 400 });
  }

  const db = await getDB();
  const notas = db.collection("notas");
  
  const nota = {
    titulo,
    contenido: contenido || "",
    materiaId,
    ownerId: session.id,
    createdAt: new Date()
  };

  const result = await notas.insertOne(nota);
  nota._id = result.insertedId;

  return Response.json(nota);
}
