"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { formatDate, calculateXPProgress } from "@/lib/utils";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  nivel: number;
  xp: number;
  createdAt: string;
  _count: {
    tareas: number;
    notas: number;
    amigos: number;
  };
}

export default function PerfilPage() {
  const { data: session } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch("/api/user");
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
    setLoading(false);
  }

  if (loading || !user) {
    return <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />;
  }

  const xpProgress = calculateXPProgress(user.xp, user.nivel);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardContent className="p-8 text-center">
          <div className="w-24 h-24 mx-auto rounded-full bg-blue-600 flex items-center justify-center text-white text-4xl font-bold">
            {user.username[0].toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">{user.username}</h1>
          <p className="text-gray-500">{user.email}</p>
          <p className="text-sm text-gray-400 mt-2">
            Miembro desde {formatDate(user.createdAt)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Nivel {user.nivel}</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{user.xp} XP totales</span>
              <span>{xpProgress.current}/{xpProgress.required} XP</span>
            </div>
            <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                style={{ width: `${xpProgress.percentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 text-center mt-1">
              {Math.round(xpProgress.percentage)}% para el siguiente nivel
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-blue-600">{user._count.tareas}</p>
            <p className="text-sm text-gray-500 mt-1">Tareas completadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-purple-600">{user._count.notas}</p>
            <p className="text-sm text-gray-500 mt-1">Notas creadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold text-green-600">{user._count.amigos}</p>
            <p className="text-sm text-gray-500 mt-1">Amigos</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Sistema de recompensas</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Tarea completada</span>
              <span className="font-medium text-green-600">+10 XP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tarea creada</span>
              <span className="font-medium text-green-600">+5 XP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Nota creada</span>
              <span className="font-medium text-green-600">+5 XP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amistad aceptada</span>
              <span className="font-medium text-green-600">+20 XP</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
