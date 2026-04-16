"use client";

import { useEffect, useState } from "react";
import { getNotificaciones, markAsRead, markAllAsRead, deleteNotificacion } from "@/actions/notificaciones";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

interface Notificacion {
  id: string;
  tipo: string;
  mensaje: string;
  leida: boolean;
  data: Record<string, unknown> | null;
  createdAt: Date;
}

const tipoIcons: Record<string, string> = {
  TAREA_AGREGADA: "📋",
  AMISTAD_SOLICITUD: "👥",
  AMISTAD_ACEPTADA: "✅",
  NIVEL_SUBIDO: "🎉",
};

export default function NotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotificaciones();
  }, []);

  async function fetchNotificaciones() {
    const result = await getNotificaciones();
    if (result.success && result.data) {
      setNotificaciones(result.data as unknown as Notificacion[]);
    }
    setLoading(false);
  }

  async function handleMarkAsRead(id: string) {
    await markAsRead(id);
    fetchNotificaciones();
  }

  async function handleMarkAllAsRead() {
    await markAllAsRead();
    fetchNotificaciones();
  }

  async function handleDelete(id: string) {
    await deleteNotificacion(id);
    fetchNotificaciones();
  }

  const unreadCount = notificaciones.filter((n) => !n.leida).length;

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notificaciones</h1>
          <p className="text-gray-600 mt-1">
            {unreadCount > 0 ? `${unreadCount} no leídas` : "Todas leídas"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="secondary" onClick={handleMarkAllAsRead}>
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {notificaciones.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">No hay notificaciones</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {notificaciones.map((notif) => (
            <Card
              key={notif.id}
              className={`${notif.leida ? "opacity-70" : "bg-blue-50"}`}
            >
              <CardContent className="p-4 flex items-start gap-4">
                <div className="text-2xl">{tipoIcons[notif.tipo] || "🔔"}</div>
                <div className="flex-1">
                  <p className={`text-sm ${notif.leida ? "text-gray-600" : "text-gray-900"}`}>
                    {notif.mensaje}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(notif.createdAt)}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!notif.leida && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Marcar leída
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(notif.id)}
                    className="text-xs text-gray-400 hover:text-red-600"
                  >
                    Eliminar
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
