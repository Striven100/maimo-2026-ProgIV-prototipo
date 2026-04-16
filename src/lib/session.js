export async function getSession(request) {
  const token = request.cookies.get("token")?.value;
  if (!token) return null;
  
  const { verifyToken } = await import("@/lib/auth");
  return verifyToken(token);
}

export function requireAuth(getData) {
  return async (request) => {
    const session = await getSession(request);
    if (!session) {
      return Response.json({ error: "No autorizado" }, { status: 401 });
    }
    return getData(session, request);
  };
}
