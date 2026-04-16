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

    const userId = user._id.toString();
    const token = createToken({ _id: userId, email: user.email, username: user.username });
    
    const response = Response.json({
      success: true,
      user: { 
        id: userId, 
        username: user.username, 
        email: user.email, 
        nivel: user.nivel || 1, 
        xp: user.xp || 0 
      }
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
    return Response.json({ error: "Error del servidor: " + error.message }, { status: 500 });
  }
}
