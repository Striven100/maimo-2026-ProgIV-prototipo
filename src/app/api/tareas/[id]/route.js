const { getDB } = require("@/lib/db");
const { getSession } = require("@/lib/session");

export async function PUT(request, { params }) {
  const session = await getSession(request);
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });

  const { completada } = await request.json();
  const db = await getDB();
  const { ObjectId } = require("mongodb");
  
  const tareas = db.collection("tareas");
  const tarea = await tareas.findOne({ _id: new ObjectId(params.id) });

  if (!tarea) return Response.json({ error: "No encontrada" }, { status: 404 });

  const wasCompleted = tarea.completada;
  
  const result = await tareas.updateOne(
    { _id: new ObjectId(params.id) },
    { $set: { completada } }
  );

  if (result.modifiedCount > 0 && !wasCompleted && completada) {
    await db.collection("users").updateOne(
      { _id: { $type: "objectId" } },
      { $inc: { xp: 10 } }
    );
  }

  return Response.json({ success: true });
}

export async function DELETE(request, { params }) {
  const session = await getSession(request);
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });

  const db = await getDB();
  const { ObjectId } = require("mongodb");
  
  const tareas = db.collection("tareas");
  await tareas.deleteOne({
    _id: new ObjectId(params.id),
    ownerId: session.id
  });

  return Response.json({ success: true });
}
