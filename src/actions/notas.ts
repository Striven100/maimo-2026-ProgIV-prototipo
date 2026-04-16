"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { XP_REWARDS } from "@/lib/utils";

export async function createNota(data: {
  titulo: string;
  contenido: string;
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

    const nota = await prisma.nota.create({
      data: {
        titulo: data.titulo.trim(),
        contenido: data.contenido,
        materiaId: data.materiaId,
        ownerId: session.user.id,
      },
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { xp: { increment: XP_REWARDS.NOTA_CREADA } },
    });

    revalidatePath("/notas");
    revalidatePath(`/materias/${data.materiaId}`);

    return { success: true, data: nota };
  } catch (error) {
    console.error("Error al crear nota:", error);
    return { success: false, error: "Error al crear la nota" };
  }
}

export async function getNotas(filters?: { materiaId?: string }) {
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

    const notas = await prisma.nota.findMany({
      where,
      include: {
        materia: {
          select: { id: true, nombre: true, color: true },
        },
        owner: {
          select: { id: true, username: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return { success: true, data: notas };
  } catch (error) {
    console.error("Error al obtener notas:", error);
    return { success: false, error: "Error al obtener las notas" };
  }
}

export async function getNotaById(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "No autorizado" };
    }

    const nota = await prisma.nota.findUnique({
      where: { id },
      include: {
        materia: true,
        owner: {
          select: { id: true, username: true },
        },
      },
    });

    if (!nota) {
      return { success: false, error: "Nota no encontrada" };
    }

    const materia = await prisma.materia.findUnique({
      where: { id: nota.materiaId },
      include: { miembros: true },
    });

    if (!materia) {
      return { success: false, error: "Materia no encontrada" };
    }

    const isMember = materia.miembros.some(m => m.userId === session.user.id);
    if (!isMember) {
      return { success: false, error: "No tienes acceso a esta nota" };
    }

    return { success: true, data: nota };
  } catch (error) {
    console.error("Error al obtener nota:", error);
    return { success: false, error: "Error al obtener la nota" };
  }
}

export async function updateNota(id: string, data: {
  titulo?: string;
  contenido?: string;
}) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "No autorizado" };
    }

    const nota = await prisma.nota.findUnique({
      where: { id },
      include: { materia: { include: { miembros: true } } },
    });

    if (!nota) {
      return { success: false, error: "Nota no encontrada" };
    }

    const isMember = nota.materia.miembros.some(m => m.userId === session.user.id);
    if (!isMember) {
      return { success: false, error: "No tienes acceso a esta nota" };
    }

    const updated = await prisma.nota.update({
      where: { id },
      data: {
        titulo: data.titulo?.trim(),
        contenido: data.contenido,
      },
    });

    revalidatePath("/notas");
    revalidatePath(`/notas/${id}`);
    revalidatePath(`/materias/${nota.materiaId}`);

    return { success: true, data: updated };
  } catch (error) {
    console.error("Error al actualizar nota:", error);
    return { success: false, error: "Error al actualizar la nota" };
  }
}

export async function deleteNota(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "No autorizado" };
    }

    const nota = await prisma.nota.findUnique({
      where: { id },
    });

    if (!nota) {
      return { success: false, error: "Nota no encontrada" };
    }

    if (nota.ownerId !== session.user.id) {
      return { success: false, error: "Solo el creador puede eliminar la nota" };
    }

    await prisma.nota.delete({
      where: { id },
    });

    revalidatePath("/notas");
    revalidatePath(`/materias/${nota.materiaId}`);

    return { success: true };
  } catch (error) {
    console.error("Error al eliminar nota:", error);
    return { success: false, error: "Error al eliminar la nota" };
  }
}
