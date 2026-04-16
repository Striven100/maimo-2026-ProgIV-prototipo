const { ObjectId } = require("mongodb");
const { getDB } = require("@/lib/db");
const { getSession } = require("@/lib/session");

export async function GET(request) {
  const session = await getSession(request);
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });

  try {
    const db = await getDB();
    const users = db.collection("users");
    
    const user = await users.findOne(
      { _id: new ObjectId(session.id) },
      { projection: { passwordHash: 0 } }
    );

    if (!user) {
      return Response.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return Response.json({
      ...user,
      id: user._id.toString()
    });
  } catch (error) {
    console.error("User error:", error);
    return Response.json({ error: "Error al obtener usuario" }, { status: 500 });
  }
}
