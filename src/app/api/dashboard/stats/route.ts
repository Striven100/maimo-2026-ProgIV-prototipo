import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const [materiasCount, tareasStats, notasCount, amigosCount] = await Promise.all([
      prisma.materia.count({
        where: {
          OR: [
            { ownerId: session.user.id },
            { miembros: { some: { userId: session.user.id } } },
          ],
        },
      }),
      prisma.tarea.findMany({
        where: {
          OR: [
            { ownerId: session.user.id },
            { materia: { miembros: { some: { userId: session.user.id } } } },
          ],
        },
        select: { completada: true },
      }),
      prisma.nota.count({
        where: {
          OR: [
            { ownerId: session.user.id },
            { materia: { miembros: { some: { userId: session.user.id } } } },
          ],
        },
      }),
      prisma.amigo.count({
        where: { userId: session.user.id },
      }),
    ]);

    const tareasCompletadas = tareasStats.filter(t => t.completada).length;
    const tareasPendientes = tareasStats.length - tareasCompletadas;

    return NextResponse.json({
      totalMaterias: materiasCount,
      tareasPendientes,
      tareasCompletadas,
      notasTotal: notasCount,
      amigos: amigosCount,
    });
  } catch (error) {
    console.error("Error al obtener estadísticas:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
