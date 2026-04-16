export type Prioridad = "BAJA" | "MEDIA" | "ALTA";
export type EstadoSolicitud = "PENDIENTE" | "ACEPTADA" | "RECHAZADA";
export type RolMateria = "CREADOR" | "MIEMBRO";
export type TipoNotificacion = "TAREA_AGREGADA" | "AMISTAD_SOLICITUD" | "AMISTAD_ACEPTADA" | "NIVEL_SUBIDO";

export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  xp: number;
  nivel: number;
  createdAt: Date;
}

export interface Amigo {
  id: string;
  userId: string;
  amigoId: string;
  estado: string;
  createdAt: Date;
  amigo?: User;
}

export interface SolicitudAmistad {
  id: string;
  deId: string;
  paraId: string;
  estado: string;
  createdAt: Date;
  de?: User;
}

export interface Materia {
  id: string;
  nombre: string;
  descripcion?: string;
  color: string;
  codigo?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  owner?: User;
  miembros?: MiembroMateria[];
  tareas?: Tarea[];
  notas?: Nota[];
}

export interface MiembroMateria {
  id: string;
  materiaId: string;
  userId: string;
  rol: RolMateria;
  createdAt: Date;
  user?: User;
}

export interface Tarea {
  id: string;
  titulo: string;
  descripcion?: string;
  fechaLimite?: Date;
  completada: boolean;
  prioridad: Prioridad;
  materiaId: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  materia?: Materia;
  owner?: User;
}

export interface Nota {
  id: string;
  titulo: string;
  contenido: string;
  materiaId: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  materia?: Materia;
  owner?: User;
}

export interface Notificacion {
  id: string;
  tipo: TipoNotificacion;
  mensaje: string;
  leida: boolean;
  data?: Record<string, unknown>;
  userId: string;
  createdAt: Date;
}

export interface ActionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface XPProgress {
  current: number;
  required: number;
  percentage: number;
}
