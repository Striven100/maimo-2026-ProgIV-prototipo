export async function POST() {
  const response = Response.json({ success: true });
  response.cookies.delete("token");
  return response;
}
