const { getDB } = require("@/lib/db");
const { getSession } = require("@/lib/session");

export async function GET(request) {
  const session = await getSession(request);
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });

  const db = await getDB();
  const tareas = db.collection("tareas");
  
  const result = await tareas.find({
    $or: [
      { ownerId: session.id },
      { materiaId: { $in: [] } }
    ]
  }).sort({ createdAt: -1 }).toArray();

  return Response.json(result);
}

export async function POST(request) {
  const session = await getSession(request);
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });

  const { titulo, descripcion, fechaLimite, prioridad, materiaId } = await request.json();
  
  if (!titulo || !materiaId) {
    return Response.json({ error: "Título y materia requeridos" }, { status: 400 });
  }

  const db = await getDB();
  const tareas = db.collection("tareas");
  
  const tarea = {
    titulo,
    descripcion: descripcion || "",
    fechaLimite: fechaLimite ? new Date(fechaLimite) : null,
    prioridad: prioridad || "MEDIA",
    materiaId,
    ownerId: session.id,
    completada: false,
    createdAt: new Date()
  };

  const result = await tareas.insertOne(tarea);
  tarea._id = result.insertedId;

  await db.collection("users").updateOne(
    { _id: { $type: "objectId" } },
    { $inc: { xp: 5 } }
  );

  return Response.json(tarea);
}
