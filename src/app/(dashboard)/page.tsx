"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

interface DashboardStats {
  totalMaterias: number;
  tareasPendientes: number;
  tareasCompletadas: number;
  notasTotal: number;
  amigos: number;
  nivel: number;
  xp: number;
}

interface TareaReciente {
  id: string;
  titulo: string;
  fechaLimite: string | null;
  prioridad: string;
  completada: boolean;
  materia: { nombre: string; color: string };
}

interface NotificacionReciente {
  id: string;
  tipo: string;
  mensaje: string;
  leida: boolean;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tareasRecientes, setTareasRecientes] = useState<TareaReciente[]>([]);
  const [notificaciones, setNotificaciones] = useState<NotificacionReciente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const [statsRes, tareasRes, notifRes] = await Promise.all([
        fetch("/api/dashboard/stats"),
        fetch("/api/tareas/recientes"),
        fetch("/api/notificaciones/recientes"),
      ]);

      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
      if (tareasRes.ok) {
        setTareasRecientes(await tareasRes.json());
      }
      if (notifRes.ok) {
        setNotificaciones(await notifRes.json());
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Hola, {session?.user?.name || "Usuario"}
        </h1>
        <p className="text-gray-600 mt-1">
          Aquí está tu resumen del día
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Materias"
          value={stats?.totalMaterias || 0}
          href="/materias"
          color="blue"
        />
        <StatCard
          title="Tareas Pendientes"
          value={stats?.tareasPendientes || 0}
          href="/tareas"
          color="yellow"
        />
        <StatCard
          title="Tareas Completadas"
          value={stats?.tareasCompletadas || 0}
          href="/tareas"
          color="green"
        />
        <StatCard
          title="Notas"
          value={stats?.notasTotal || 0}
          href="/notas"
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="font-semibold text-gray-900">Tareas Recientes</h2>
            <Link href="/tareas">
              <Button variant="ghost" size="sm">Ver todas</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {tareasRecientes.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                No hay tareas recientes
              </p>
            ) : (
              <div className="space-y-3">
                {tareasRecientes.map((tarea) => (
                  <div
                    key={tarea.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                  >
                    <div
                      className="w-1 h-10 rounded-full"
                      style={{ backgroundColor: tarea.materia.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        tarea.completada ? "line-through text-gray-500" : "text-gray-900"
                      }`}>
                        {tarea.titulo}
                      </p>
                      <p className="text-xs text-gray-500">
                        {tarea.materia.nombre}
                        {tarea.fechaLimite && ` • ${formatDate(tarea.fechaLimite)}`}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      tarea.prioridad === "ALTA" ? "bg-red-100 text-red-700" :
                      tarea.prioridad === "MEDIA" ? "bg-yellow-100 text-yellow-700" :
                      "bg-green-100 text-green-700"
                    }`}>
                      {tarea.prioridad}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="font-semibold text-gray-900">Notificaciones</h2>
            <Link href="/notificaciones">
              <Button variant="ghost" size="sm">Ver todas</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {notificaciones.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                No hay notificaciones
              </p>
            ) : (
              <div className="space-y-3">
                {notificaciones.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-lg ${
                      notif.leida ? "bg-gray-50" : "bg-blue-50"
                    }`}
                  >
                    <p className="text-sm text-gray-700">{notif.mensaje}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(notif.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  href,
  color,
}: {
  title: string;
  value: number;
  href: string;
  color: "blue" | "yellow" | "green" | "purple";
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    yellow: "bg-yellow-50 text-yellow-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <Link href={href}>
      <Card className={`${colorClasses[color]} hover:shadow-md transition-shadow cursor-pointer`}>
        <CardContent className="p-4">
          <p className="text-sm font-medium opacity-80">{title}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
