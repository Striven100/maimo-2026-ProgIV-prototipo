const { verifyToken } = require("@/lib/auth");

function getSession(request) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

module.exports = { getSession };
