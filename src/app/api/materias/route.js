const { getDB } = require("@/lib/db");
const { getSession } = require("@/lib/session");

export async function GET(request) {
  const session = await getSession(request);
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });

  const db = await getDB();
  const materias = db.collection("materias");
  
  const result = await materias.find({
    $or: [
      { ownerId: session.id },
      { "miembros.userId": session.id }
    ]
  }).toArray();

  return Response.json(result);
}

export async function POST(request) {
  const session = await getSession(request);
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });

  const { nombre, descripcion, color } = await request.json();
  
  if (!nombre) return Response.json({ error: "Nombre requerido" }, { status: 400 });

  const db = await getDB();
  const materias = db.collection("materias");
  
  const materia = {
    nombre,
    descripcion: descripcion || "",
    color: color || "#3B82F6",
    ownerId: session.id,
    miembros: [{ userId: session.id, rol: "CREADOR" }],
    createdAt: new Date()
  };

  const result = await materias.insertOne(materia);
  materia._id = result.insertedId;

  return Response.json(materia);
}
