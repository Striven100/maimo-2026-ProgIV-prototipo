const { getDB } = require("@/lib/db");
const { getSession } = require("@/lib/session");

export async function PUT(request, { params }) {
  const session = await getSession(request);
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });

  try {
    const { completada } = await request.json();
    const db = await getDB();
    const { ObjectId } = require("mongodb");
    
    const tareas = db.collection("tareas");
    const tarea = await tareas.findOne({ _id: new ObjectId(params.id) });

    if (!tarea) return Response.json({ error: "No encontrada" }, { status: 404 });

    const wasCompleted = tarea.completada;
    
    await tareas.updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { completada } }
    );

    if (!wasCompleted && completada) {
      await db.collection("users").updateOne(
        { _id: new ObjectId(session.id) },
        { $inc: { xp: 10 } }
      );
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Tarea update error:", error);
    return Response.json({ error: "Error al actualizar tarea" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const session = await getSession(request);
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });

  try {
    const db = await getDB();
    const { ObjectId } = require("mongodb");
    
    const tareas = db.collection("tareas");
    await tareas.deleteOne({
      _id: new ObjectId(params.id),
      ownerId: session.id
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Tarea delete error:", error);
    return Response.json({ error: "Error al eliminar tarea" }, { status: 500 });
  }
}
