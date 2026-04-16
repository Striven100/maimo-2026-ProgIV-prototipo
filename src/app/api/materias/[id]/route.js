const { getDB } = require("@/lib/db");
const { getSession } = require("@/lib/session");

export async function GET(request, { params }) {
  const session = await getSession(request);
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });

  const db = await getDB();
  const { ObjectId } = require("mongodb");
  
  const materias = db.collection("materias");
  const materia = await materias.findOne({ _id: new ObjectId(params.id) });

  if (!materia) return Response.json({ error: "No encontrada" }, { status: 404 });

  return Response.json(materia);
}

export async function DELETE(request, { params }) {
  const session = await getSession(request);
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });

  const db = await getDB();
  const { ObjectId } = require("mongodb");
  
  const materias = db.collection("materias");
  const result = await materias.deleteOne({
    _id: new ObjectId(params.id),
    ownerId: session.id
  });

  if (result.deletedCount === 0) {
    return Response.json({ error: "No eliminada" }, { status: 400 });
  }

  return Response.json({ success: true });
}

export async function PUT(request, { params }) {
  const session = await getSession(request);
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });

  const { nombre, descripcion, color } = await request.json();
  const db = await getDB();
  const { ObjectId } = require("mongodb");
  
  const materias = db.collection("materias");
  const result = await materias.updateOne(
    { _id: new ObjectId(params.id), ownerId: session.id },
    { $set: { nombre, descripcion, color } }
  );

  if (result.modifiedCount === 0) {
    return Response.json({ error: "No actualizada" }, { status: 400 });
  }

  return Response.json({ success: true });
}
