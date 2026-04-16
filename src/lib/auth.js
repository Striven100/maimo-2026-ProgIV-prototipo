const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "progiv-secret-key-2024-minimo-32-caracteres";

function createToken(user) {
  const id = user._id ? user._id.toString() : user.id;
  return jwt.sign(
    { id, email: user.email, username: user.username },
    SECRET,
    { expiresIn: "7d" }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

module.exports = { createToken, verifyToken };
