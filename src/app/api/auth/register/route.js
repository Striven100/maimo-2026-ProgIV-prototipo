const bcrypt = require("bcryptjs");
const { getDB } = require("@/lib/db");
const { createToken } = require("@/lib/auth");

export async function POST(request) {
  try {
    const { username, email, password } = await request.json();
    
    if (!username || !email || !password) {
      return Response.json({ error: "Todos los campos son requeridos" }, { status: 400 });
    }

    if (password.length < 6) {
      return Response.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
    }

    const db = await getDB();
    const users = db.collection("users");
    
    const existing = await users.findOne({ $or: [{ email }, { username }] });
    if (existing) {
      return Response.json({ error: "El email o username ya existe" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    const result = await users.insertOne({
      username,
      email,
      passwordHash,
      nivel: 1,
      xp: 0,
      createdAt: new Date()
    });

    const user = { _id: result.insertedId, username, email, nivel: 1, xp: 0 };
    const token = createToken(user);

    const response = Response.json({
      success: true,
      user: { id: user._id, username: user.username, email: user.email, nivel: user.nivel, xp: user.xp }
    });
    
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/"
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return Response.json({ error: "Error del servidor" }, { status: 500 });
  }
}
