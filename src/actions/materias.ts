"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createNotificacion } from "./notificaciones";

export async function createMateria(data: {
  nombre: string;
  descripcion?: string;
  color?: string;
  codigo?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "No autorizado" };
    }

    if (!data.nombre.trim()) {
      return { success: false, error: "El nombre es requerido" };
    }

    const materia = await prisma.materia.create({
      data: {
        nombre: data.nombre.trim(),
        descripcion: data.descripcion?.trim(),
        color: data.color || "#3B82F6",
        codigo: data.codigo?.trim(),
        ownerId: session.user.id,
        miembros: {
          create: {
            userId: session.user.id,
            rol: "CREADOR",
          },
        },
      },
    });

    revalidatePath("/materias");
    revalidatePath("/");

    return { success: true, data: materia };
  } catch (error) {
    console.error("Error al crear materia:", error);
    return { success: false, error: "Error al crear la materia" };
  }
}

export async function getMaterias() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "No autorizado" };
    }

    const materias = await prisma.materia.findMany({
      where: {
        OR: [
          { ownerId: session.user.id },
          { miembros: { some: { userId: session.user.id } } },
        ],
      },
      include: {
        owner: {
          select: { id: true, username: true },
        },
        miembros: {
          include: {
            user: {
              select: { id: true, username: true },
            },
          },
        },
        _count: {
          select: { tareas: true, notas: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: materias };
  } catch (error) {
    console.error("Error al obtener materias:", error);
    return { success: false, error: "Error al obtener las materias" };
  }
}

export async function getMateriaById(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "No autorizado" };
    }

    const materia = await prisma.materia.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, username: true },
        },
        miembros: {
          include: {
            user: {
              select: { id: true, username: true, avatar: true },
            },
          },
        },
        tareas: {
          orderBy: { createdAt: "desc" },
        },
        notas: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!materia) {
      return { success: false, error: "Materia no encontrada" };
    }

    const isMember = materia.miembros.some(m => m.userId === session.user.id);
    if (!isMember) {
      return { success: false, error: "No tienes acceso a esta materia" };
    }

    return { success: true, data: materia };
  } catch (error) {
    console.error("Error al obtener materia:", error);
    return { success: false, error: "Error al obtener la materia" };
  }
}

export async function updateMateria(id: string, data: {
  nombre?: string;
  descripcion?: string;
  color?: string;
  codigo?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "No autorizado" };
    }

    const materia = await prisma.materia.findUnique({
      where: { id },
      include: { miembros: true },
    });

    if (!materia) {
      return { success: false, error: "Materia no encontrada" };
    }

    const isCreator = materia.ownerId === session.user.id;
    if (!isCreator) {
      return { success: false, error: "Solo el creador puede editar la materia" };
    }

    const updated = await prisma.materia.update({
      where: { id },
      data: {
        nombre: data.nombre?.trim(),
        descripcion: data.descripcion?.trim(),
        color: data.color,
        codigo: data.codigo?.trim(),
      },
    });

    revalidatePath("/materias");
    revalidatePath(`/materias/${id}`);

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error al actualizar materia:", error);
    return { success: false, error: "Error al actualizar la materia" };
  }
}

export async function deleteMateria(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "No autorizado" };
    }

    const materia = await prisma.materia.findUnique({
      where: { id },
    });

    if (!materia) {
      return { success: false, error: "Materia no encontrada" };
    }

    if (materia.ownerId !== session.user.id) {
      return { success: false, error: "Solo el creador puede eliminar la materia" };
    }

    await prisma.materia.delete({
      where: { id },
    });

    revalidatePath("/materias");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error al eliminar materia:", error);
    return { success: false, error: "Error al eliminar la materia" };
  }
}

export async function shareMateria(materiaId: string, friendUsername: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "No autorizado" };
    }

    const materia = await prisma.materia.findUnique({
      where: { id: materiaId },
      include: { miembros: true },
    });

    if (!materia) {
      return { success: false, error: "Materia no encontrada" };
    }

    if (materia.ownerId !== session.user.id) {
      return { success: false, error: "Solo el creador puede compartir la materia" };
    }

    const friend = await prisma.user.findUnique({
      where: { username: friendUsername },
    });

    if (!friend) {
      return { success: false, error: "Usuario no encontrado" };
    }

    if (friend.id === session.user.id) {
      return { success: false, error: "No puedes agregarte a ti mismo" };
    }

    const existingMember = materia.miembros.find(m => m.userId === friend.id);
    if (existingMember) {
      return { success: false, error: "El usuario ya es miembro de esta materia" };
    }

    const areFriends = await prisma.amigo.findFirst({
      where: {
        OR: [
          { userId: session.user.id, amigoId: friend.id },
          { userId: friend.id, amigoId: session.user.id },
        ],
      },
    });

    if (!areFriends) {
      return { success: false, error: "Solo puedes compartir con amigos" };
    }

    await prisma.miembroMateria.create({
      data: {
        materiaId,
        userId: friend.id,
        rol: "MIEMBRO",
      },
    });

    await createNotificacion({
      tipo: "TAREA_AGREGADA",
      mensaje: `${session.user.name} te agregó a la materia "${materia.nombre}"`,
      userId: friend.id,
      data: { materiaId },
    });

    revalidatePath(`/materias/${materiaId}`);

    return { success: true };
  } catch (error) {
    console.error("Error al compartir materia:", error);
    return { success: false, error: "Error al compartir la materia" };
  }
}

export async function removeMember(materiaId: string, userId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "No autorizado" };
    }

    const materia = await prisma.materia.findUnique({
      where: { id: materiaId },
    });

    if (!materia) {
      return { success: false, error: "Materia no encontrada" };
    }

    if (materia.ownerId !== session.user.id && session.user.id !== userId) {
      return { success: false, error: "No tienes permiso para hacer esto" };
    }

    if (materia.ownerId === userId) {
      return { success: false, error: "No puedes eliminar al creador" };
    }

    await prisma.miembroMateria.deleteMany({
      where: {
        materiaId,
        userId,
      },
    });

    revalidatePath(`/materias/${materiaId}`);

    return { success: true };
  } catch (error) {
    console.error("Error al remover miembro:", error);
    return { success: false, error: "Error al remover el miembro" };
  }
}
