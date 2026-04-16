const { getDB } = require("@/lib/db");
const { getSession } = require("@/lib/session");

export async function GET(request) {
  const session = await getSession(request);
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  
  if (!query || query.length < 3) {
    return Response.json([]);
  }

  const db = await getDB();
  const users = db.collection("users");
  
  const result = await users.find({
    username: { $regex: query, $options: "i" },
    _id: { $ne: { $type: "objectId", value: session.id } }
  }, { projection: { passwordHash: 0 } }).limit(10).toArray();

  return Response.json(result);
}

export async function POST(request) {
  const session = await getSession(request);
  if (!session) return Response.json({ error: "No autorizado" }, { status: 401 });

  const { amigoId } = await request.json();
  
  if (amigoId === session.id) {
    return Response.json({ error: "No puedes agregarte a ti mismo" }, { status: 400 });
  }

  const db = await getDB();
  const amigos = db.collection("amigos");
  
  const existing = await amigos.findOne({
    $or: [
      { userId: session.id, amigoId },
      { userId: amigoId, amigoId: session.id }
    ]
  });

  if (existing) {
    return Response.json({ error: "Ya son amigos" }, { status: 400 });
  }

  await amigos.insertMany([
    { userId: session.id, amigoId, createdAt: new Date() },
    { userId: amigoId, amigoId: session.id, createdAt: new Date() }
  ]);

  await db.collection("users").updateOne(
    { _id: { $type: "objectId" } },
    { $inc: { xp: 20 } }
  );

  return Response.json({ success: true });
}
