const { getDB } = require("@/lib/db");
const { getSession } = require("@/lib/session");

export async function GET(request) {
  const session = await getSession(request);
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });

  const db = await getDB();
  const users = db.collection("users");
  
  const user = await users.findOne(
    { _id: { $type: "objectId", value: session.id } },
    { projection: { passwordHash: 0 } }
  );

  return Response.json(user);
}
