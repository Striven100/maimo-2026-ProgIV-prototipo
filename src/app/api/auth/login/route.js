const bcrypt = require("bcryptjs");
const { getDB } = require("@/lib/db");
const { createToken } = require("@/lib/auth");

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return Response.json({ error: "Email y contraseña requeridos" }, { status: 400 });
    }

    const db = await getDB();
    const users = db.collection("users");
    
    const user = await users.findOne({ email });
    if (!user) {
      return Response.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return Response.json({ error: "Credenciales inválidas" }, { status: 401 });
    }

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
    console.error("Login error:", error);
    return Response.json({ error: "Error del servidor" }, { status: 500 });
  }
}
