const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "secret-progiv-2024";

export function createToken(user) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email, username: user.username },
    SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}
