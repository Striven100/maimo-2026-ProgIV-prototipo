"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createNotificacion } from "./notificaciones";
import { XP_REWARDS } from "@/lib/utils";

export async function searchUsers(query: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "No autorizado" };
    }

    if (query.length < 3) {
      return { success: false, error: "Mínimo 3 caracteres para buscar" };
    }

    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: query,
          mode: "insensitive",
        },
        NOT: {
          id: session.user.id,
        },
      },
      select: {
        id: true,
        username: true,
        avatar: true,
        nivel: true,
      },
      take: 10,
    });

    return { success: true, data: users };
  } catch (error) {
    console.error("Error al buscar usuarios:", error);
    return { success: false, error: "Error al buscar usuarios" };
  }
}

export async function sendFriendRequest(userId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "No autorizado" };
    }

    if (userId === session.user.id) {
      return { success: false, error: "No puedes enviarte solicitud a ti mismo" };
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return { success: false, error: "Usuario no encontrado" };
    }

    const existingFriendship = await prisma.amigo.findFirst({
      where: {
        OR: [
          { userId: session.user.id, amigoId: userId },
          { userId: userId, amigoId: session.user.id },
        ],
      },
    });

    if (existingFriendship) {
      return { success: false, error: "Ya son amigos" };
    }

    const existingRequest = await prisma.solicitudAmistad.findFirst({
      where: {
        OR: [
          { deId: session.user.id, paraId: userId },
          { deId: userId, paraId: session.user.id },
        ],
      },
    });

    if (existingRequest) {
      if (existingRequest.deId === session.user.id) {
        return { success: false, error: "Ya enviaste una solicitud" };
      }
      return { success: false, error: "Ya tienes una solicitud pendiente de este usuario" };
    }

    const request = await prisma.solicitudAmistad.create({
      data: {
        deId: session.user.id,
        paraId: userId,
      },
    });

    await createNotificacion({
      tipo: "AMISTAD_SOLICITUD",
      mensaje: `${session.user.name} quiere ser tu amigo`,
      userId,
      data: { solicitudId: request.id },
    });

    revalidatePath("/amigos");

    return { success: true, data: request };
  } catch (error) {
    console.error("Error al enviar solicitud:", error);
    return { success: false, error: "Error al enviar la solicitud" };
  }
}

export async function getFriends() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "No autorizado" };
    }

    const amigos = await prisma.amigo.findMany({
      where: { userId: session.user.id },
      include: {
        user: false,
      },
    });

    const friendIds = amigos.map(a => a.amigoId);

    const friendUsers = await prisma.user.findMany({
      where: { id: { in: friendIds } },
      select: {
        id: true,
        username: true,
        avatar: true,
        nivel: true,
      },
    });

    return { success: true, data: friendUsers };
  } catch (error) {
    console.error("Error al obtener amigos:", error);
    return { success: false, error: "Error al obtener los amigos" };
  }
}

export async function getPendingRequests() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "No autorizado" };
    }

    const requests = await prisma.solicitudAmistad.findMany({
      where: {
        paraId: session.user.id,
        estado: "PENDIENTE",
      },
      include: {
        de: {
          select: {
            id: true,
            username: true,
            avatar: true,
            nivel: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: requests };
  } catch (error) {
    console.error("Error al obtener solicitudes:", error);
    return { success: false, error: "Error al obtener las solicitudes" };
  }
}

export async function acceptFriendRequest(requestId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "No autorizado" };
    }

    const request = await prisma.solicitudAmistad.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return { success: false, error: "Solicitud no encontrada" };
    }

    if (request.paraId !== session.user.id) {
      return { success: false, error: "No puedes aceptar esta solicitud" };
    }

    if (request.estado !== "PENDIENTE") {
      return { success: false, error: "La solicitud ya fue procesada" };
    }

    await prisma.$transaction(async (tx) => {
      await tx.solicitudAmistad.update({
        where: { id: requestId },
        data: { estado: "ACEPTADA" },
      });

      await tx.amigo.createMany({
        data: [
          { userId: session.user.id, amigoId: request.deId },
          { userId: request.deId, amigoId: session.user.id },
        ],
      });

      const user = await tx.user.findUnique({
        where: { id: session.user.id },
        select: { username: true },
      });

      await tx.notificacion.create({
        data: {
          tipo: "AMISTAD_ACEPTADA",
          mensaje: `${user?.username} aceptó tu solicitud de amistad`,
          userId: request.deId,
        },
      });

      await tx.user.update({
        where: { id: session.user.id },
        data: { xp: { increment: XP_REWARDS.AMISTAD_ACEPTADA } },
      });
      await tx.user.update({
        where: { id: request.deId },
        data: { xp: { increment: XP_REWARDS.AMISTAD_ACEPTADA } },
      });
    });

    revalidatePath("/amigos");
    revalidatePath("/amigos/solicitudes");

    return { success: true };
  } catch (error) {
    console.error("Error al aceptar solicitud:", error);
    return { success: false, error: "Error al aceptar la solicitud" };
  }
}

export async function rejectFriendRequest(requestId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "No autorizado" };
    }

    const request = await prisma.solicitudAmistad.findUnique({
      where: { id: requestId },
    });

    if (!request) {
      return { success: false, error: "Solicitud no encontrada" };
    }

    if (request.paraId !== session.user.id) {
      return { success: false, error: "No puedes rechazar esta solicitud" };
    }

    await prisma.solicitudAmistad.update({
      where: { id: requestId },
      data: { estado: "RECHAZADA" },
    });

    revalidatePath("/amigos/solicitudes");

    return { success: true };
  } catch (error) {
    console.error("Error al rechazar solicitud:", error);
    return { success: false, error: "Error al rechazar la solicitud" };
  }
}

export async function removeFriend(friendId: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "No autorizado" };
    }

    await prisma.amigo.deleteMany({
      where: {
        OR: [
          { userId: session.user.id, amigoId: friendId },
          { userId: friendId, amigoId: session.user.id },
        ],
      },
    });

    revalidatePath("/amigos");

    return { success: true };
  } catch (error) {
    console.error("Error al eliminar amigo:", error);
    return { success: false, error: "Error al eliminar el amigo" };
  }
}
