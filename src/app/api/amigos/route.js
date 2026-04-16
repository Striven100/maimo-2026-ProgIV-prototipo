const { getDB } = require("@/lib/db");
const { getSession } = require("@/lib/session");

export async function GET(request) {
  const session = await getSession(request);
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });

  const db = await getDB();
  const amigos = db.collection("amigos");
  
  const result = await amigos.find({ userId: session.id }).toArray();
  const friendIds = result.map(a => a.amigoId);
  
  const users = db.collection("users");
  const friends = await users.find(
    { _id: { $in: friendIds.map(id => ({ $type: "objectId", value: id })) } },
    { projection: { passwordHash: 0 } }
  ).toArray();

  return Response.json(friends);
}
