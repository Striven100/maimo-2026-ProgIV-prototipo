import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const tareas = await prisma.tarea.findMany({
      where: {
        OR: [
          { ownerId: session.user.id },
          { materia: { miembros: { some: { userId: session.user.id } } } },
        ],
      },
      include: {
        materia: {
          select: { nombre: true, color: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json(tareas);
  } catch (error) {
    console.error("Error al obtener tareas recientes:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
