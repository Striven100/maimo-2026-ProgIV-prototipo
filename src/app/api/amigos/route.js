const { getDB } = require("@/lib/db");
const { getSession } = require("@/lib/session");

export async function GET(request) {
  const session = await getSession(request);
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });

  try {
    const db = await getDB();
    const { ObjectId } = require("mongodb");
    const amigos = db.collection("amigos");
    
    const result = await amigos.find({ userId: session.id }).toArray();
    const friendIds = result.map(a => new ObjectId(a.amigoId));
    
    if (friendIds.length === 0) {
      return Response.json([]);
    }

    const users = db.collection("users");
    const friends = await users.find(
      { _id: { $in: friendIds } },
      { projection: { passwordHash: 0 } }
    ).toArray();

    return Response.json(friends);
  } catch (error) {
    console.error("Get friends error:", error);
    return Response.json([]);
  }
}
