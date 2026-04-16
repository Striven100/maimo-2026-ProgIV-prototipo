"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createNotificacion(data: {
  tipo: string;
  mensaje: string;
  userId: string;
  data?: Record<string, unknown>;
}) {
  try {
    await prisma.notificacion.create({
      data: {
        tipo: data.tipo,
        mensaje: data.mensaje,
        userId: data.userId,
        data: data.data ? JSON.stringify(data.data) : null,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Error al crear notificación:", error);
    return { success: false, error: "Error al crear la notificación" };
  }
}

export async function getNotificaciones() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "No autorizado" };
    }

    const notificacionesRaw = await prisma.notificacion.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    const notificaciones = notificacionesRaw.map((n) => ({
      ...n,
      data: n.data ? JSON.parse(n.data) : null,
    }));

    return { success: true, data: notificaciones };
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    return { success: false, error: "Error al obtener las notificaciones" };
  }
}

export async function getUnreadCount() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "No autorizado" };
    }

    const count = await prisma.notificacion.count({
      where: {
        userId: session.user.id,
        leida: false,
      },
    });

    return { success: true, data: count };
  } catch (error) {
    console.error("Error al obtener conteo:", error);
    return { success: false, error: "Error al obtener el conteo" };
  }
}

export async function markAsRead(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "No autorizado" };
    }

    const notificacion = await prisma.notificacion.findUnique({
      where: { id },
    });

    if (!notificacion) {
      return { success: false, error: "Notificación no encontrada" };
    }

    if (notificacion.userId !== session.user.id) {
      return { success: false, error: "No tienes acceso a esta notificación" };
    }

    const updated = await prisma.notificacion.update({
      where: { id },
      data: { leida: true },
    });

    revalidatePath("/notificaciones");

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error al marcar como leída:", error);
    return { success: false, error: "Error al actualizar la notificación" };
  }
}

export async function markAllAsRead() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "No autorizado" };
    }

    await prisma.notificacion.updateMany({
      where: {
        userId: session.user.id,
        leida: false,
      },
      data: { leida: true },
    });

    revalidatePath("/notificaciones");

    return { success: true };
  } catch (error) {
    console.error("Error al marcar todas como leídas:", error);
    return { success: false, error: "Error al actualizar las notificaciones" };
  }
}

export async function deleteNotificacion(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "No autorizado" };
    }

    const notificacion = await prisma.notificacion.findUnique({
      where: { id },
    });

    if (!notificacion) {
      return { success: false, error: "Notificación no encontrada" };
    }

    if (notificacion.userId !== session.user.id) {
      return { success: false, error: "No tienes acceso a esta notificación" };
    }

    await prisma.notificacion.delete({
      where: { id },
    });

    revalidatePath("/notificaciones");

    return { success: true };
  } catch (error) {
    console.error("Error al eliminar notificación:", error);
    return { success: false, error: "Error al eliminar la notificación" };
  }
}
