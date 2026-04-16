import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function calculateLevel(xp: number): number {
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

export function calculateXPForNextLevel(currentLevel: number): number {
  return currentLevel * 100;
}

export function calculateXPProgress(xp: number, nivel: number): {
  current: number;
  required: number;
  percentage: number;
} {
  let totalXpForCurrentLevel = 0;
  for (let i = 1; i < nivel; i++) {
    totalXpForCurrentLevel += i * 100;
  }
  
  const current = xp - totalXpForCurrentLevel;
  const required = nivel * 100;
  const percentage = Math.min((current / required) * 100, 100);
  
  return { current, required, percentage };
}

export const XP_REWARDS = {
  TAREA_COMPLETADA: 10,
  TAREA_CREADA: 5,
  NOTA_CREADA: 5,
  AMISTAD_ACEPTADA: 20,
  MATERIA_COMPARTIDA: 15,
} as const;
