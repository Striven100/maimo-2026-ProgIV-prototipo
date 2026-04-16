"use server";

import { hash } from "bcryptjs";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { signIn } from "@/lib/auth";
import { redirect } from "next/navigation";

const registerSchema = z.object({
  username: z
    .string()
    .min(3, "El username debe tener al menos 3 caracteres")
    .max(20, "El username debe tener máximo 20 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "Solo letras, números y guiones bajos"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

export async function registerUser(formData: FormData) {
  const data = {
    username: formData.get("username") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const result = registerSchema.safeParse(data);

  if (!result.success) {
    const errors = result.error.flatten();
    return {
      success: false,
      errors: errors.fieldErrors,
    };
  }

  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: result.data.email },
          { username: result.data.username },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === result.data.email) {
        return { success: false, errors: { email: ["Este email ya está registrado"] } };
      }
      if (existingUser.username === result.data.username) {
        return { success: false, errors: { username: ["Este username ya está en uso"] } };
      }
    }

    const passwordHash = await hash(result.data.password, 12);

    await prisma.user.create({
      data: {
        username: result.data.username,
        email: result.data.email,
        passwordHash,
      },
    });

    await signIn("credentials", {
      email: result.data.email,
      password: result.data.password,
      redirect: false,
    });

    redirect("/");
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("Error en registro:", error);
    return { success: false, errors: { form: ["Error al registrar usuario"] } };
  }
}

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Email y contraseña son requeridos" };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    redirect("/");
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    return { success: false, error: "Credenciales inválidas" };
  }
}
