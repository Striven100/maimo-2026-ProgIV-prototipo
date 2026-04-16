"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createNotificacion } from "./notificaciones";
import { XP_REWARDS } from "@/lib/utils";

export async function createTarea(data: {
  titulo: string;
  descripcion?: string;
  fechaLimite?: string;
  prioridad?: string;
  materiaId: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "No autorizado" };
    }

    if (!data.titulo.trim()) {
      return { success: false, error: "El título es requerido" };
    }

    const materia = await prisma.materia.findUnique({
      where: { id: data.materiaId },
      include: { miembros: true },
    });

    if (!materia) {
      return { success: false, error: "Materia no encontrada" };
    }

    const isMember = materia.miembros.some(m => m.userId === session.user.id);
    if (!isMember) {
      return { success: false, error: "No tienes acceso a esta materia" };
    }

    const tarea = await prisma.tarea.create({
      data: {
        titulo: data.titulo.trim(),
        descripcion: data.descripcion?.trim(),
        fechaLimite: data.fechaLimite ? new Date(data.fechaLimite) : null,
        prioridad: data.prioridad || "MEDIA",
        materiaId: data.materiaId,
        ownerId: session.user.id,
      },
    });

    const otherMembers = materia.miembros.filter(m => m.userId !== session.user.id);
    for (const member of otherMembers) {
      await createNotificacion({
        tipo: "TAREA_AGREGADA",
        mensaje: `${session.user.name} agregó la tarea "${tarea.titulo}" en ${materia.nombre}`,
        userId: member.userId,
        data: { tareaId: tarea.id, materiaId: data.materiaId },
      });
    }

    await addXP(session.user.id, XP_REWARDS.TAREA_CREADA);

    revalidatePath("/tareas");
    revalidatePath(`/materias/${data.materiaId}`);
    revalidatePath("/");

    return { success: true, data: tarea };
  } catch (error) {
    console.error("Error al crear tarea:", error);
    return { success: false, error: "Error al crear la tarea" };
  }
}

export async function getTareas(filters?: {
  materiaId?: string;
  completada?: boolean;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "No autorizado" };
    }

    const where: Record<string, unknown> = {
      materia: {
        OR: [
          { ownerId: session.user.id },
          { miembros: { some: { userId: session.user.id } } },
        ],
      },
    };

    if (filters?.materiaId) {
      where.materiaId = filters.materiaId;
    }

    if (filters?.completada !== undefined) {
      where.completada = filters.completada;
    }

    const tareas = await prisma.tarea.findMany({
      where,
      include: {
        materia: {
          select: { id: true, nombre: true, color: true },
        },
        owner: {
          select: { id: true, username: true },
        },
      },
      orderBy: [
        { completada: "asc" },
        { fechaLimite: "asc" },
        { createdAt: "desc" },
      ],
    });

    return { success: true, data: tareas };
  } catch (error) {
    console.error("Error al obtener tareas:", error);
    return { success: false, error: "Error al obtener las tareas" };
  }
}

export async function getTareaById(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "No autorizado" };
    }

    const tarea = await prisma.tarea.findUnique({
      where: { id },
      include: {
        materia: true,
        owner: {
          select: { id: true, username: true },
        },
      },
    });

    if (!tarea) {
      return { success: false, error: "Tarea no encontrada" };
    }

    const materia = await prisma.materia.findUnique({
      where: { id: tarea.materiaId },
      include: { miembros: true },
    });

    if (!materia) {
      return { success: false, error: "Materia no encontrada" };
    }

    const isMember = materia.miembros.some(m => m.userId === session.user.id);
    if (!isMember) {
      return { success: false, error: "No tienes acceso a esta tarea" };
    }

    return { success: true, data: tarea };
  } catch (error) {
    console.error("Error al obtener tarea:", error);
    return { success: false, error: "Error al obtener la tarea" };
  }
}

export async function updateTarea(id: string, data: {
  titulo?: string;
  descripcion?: string;
  fechaLimite?: string | null;
  prioridad?: string;
  completada?: boolean;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "No autorizado" };
    }

    const tarea = await prisma.tarea.findUnique({
      where: { id },
      include: { materia: { include: { miembros: true } } },
    });

    if (!tarea) {
      return { success: false, error: "Tarea no encontrada" };
    }

    const isMember = tarea.materia.miembros.some(m => m.userId === session.user.id);
    if (!isMember) {
      return { success: false, error: "No tienes acceso a esta tarea" };
    }

    const wasCompleted = tarea.completada;
    const willBeCompleted = data.completada ?? tarea.completada;

    const updated = await prisma.tarea.update({
      where: { id },
      data: {
        titulo: data.titulo?.trim(),
        descripcion: data.descripcion?.trim(),
        fechaLimite: data.fechaLimite === null ? null : data.fechaLimite ? new Date(data.fechaLimite) : undefined,
        prioridad: data.prioridad,
        completada: data.completada,
      },
    });

    if (!wasCompleted && willBeCompleted) {
      await addXP(session.user.id, XP_REWARDS.TAREA_COMPLETADA);
    }

    revalidatePath("/tareas");
    revalidatePath(`/materias/${tarea.materiaId}`);

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error al actualizar tarea:", error);
    return { success: false, error: "Error al actualizar la tarea" };
  }
}

export async function toggleTareaCompletada(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "No autorizado" };
    }

    const tarea = await prisma.tarea.findUnique({
      where: { id },
      include: { materia: { include: { miembros: true } } },
    });

    if (!tarea) {
      return { success: false, error: "Tarea no encontrada" };
    }

    const isMember = tarea.materia.miembros.some(m => m.userId === session.user.id);
    if (!isMember) {
      return { success: false, error: "No tienes acceso a esta tarea" };
    }

    const updated = await prisma.tarea.update({
      where: { id },
      data: { completada: !tarea.completada },
    });

    if (!tarea.completada) {
      await addXP(session.user.id, XP_REWARDS.TAREA_COMPLETADA);
    }

    revalidatePath("/tareas");
    revalidatePath(`/materias/${tarea.materiaId}`);
    revalidatePath("/");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error al togglear tarea:", error);
    return { success: false, error: "Error al actualizar la tarea" };
  }
}

export async function deleteTarea(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "No autorizado" };
    }

    const tarea = await prisma.tarea.findUnique({
      where: { id },
    });

    if (!tarea) {
      return { success: false, error: "Tarea no encontrada" };
    }

    if (tarea.ownerId !== session.user.id) {
      return { success: false, error: "Solo el creador puede eliminar la tarea" };
    }

    await prisma.tarea.delete({
      where: { id },
    });

    revalidatePath("/tareas");
    revalidatePath(`/materias/${tarea.materiaId}`);
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error al eliminar tarea:", error);
    return { success: false, error: "Error al eliminar la tarea" };
  }
}

async function addXP(userId: string, amount: number) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return;

    const newXP = user.xp + amount;
    const newLevel = calculateLevel(newXP);

    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: newXP,
        nivel: newLevel,
      },
    });

    if (newLevel > user.nivel) {
      await createNotificacion({
        tipo: "NIVEL_SUBIDO",
        mensaje: `¡Subiste al nivel ${newLevel}!`,
        userId,
        data: { nuevoNivel: newLevel },
      });
    }
  } catch (error) {
    console.error("Error al agregar XP:", error);
  }
}

function calculateLevel(xp: number): number {
  if (xp < 100) return 1;
  let level = 1;
  let xpRequired = 100;
  let totalXp = 0;
  
  while (totalXp + xpRequired <= xp) {
    totalXp += xpRequired;
    level++;
    xpRequired = level * 100;
  }
  
  return level;
}
