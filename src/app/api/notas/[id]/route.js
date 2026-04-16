const { getDB } = require("@/lib/db");
const { getSession } = require("@/lib/session");

export async function DELETE(request, { params }) {
  const session = await getSession(request);
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });

  const db = await getDB();
  const { ObjectId } = require("mongodb");
  
  const notas = db.collection("notas");
  await notas.deleteOne({
    _id: new ObjectId(params.id),
    ownerId: session.id
  });

  return Response.json({ success: true });
}

export async function PUT(request, { params }) {
  const session = await getSession(request);
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });

  const { titulo, contenido } = await request.json();
  const db = await getDB();
  const { ObjectId } = require("mongodb");
  
  const notas = db.collection("notas");
  await notas.updateOne(
    { _id: new ObjectId(params.id), ownerId: session.id },
    { $set: { titulo, contenido } }
  );

  return Response.json({ success: true });
}
