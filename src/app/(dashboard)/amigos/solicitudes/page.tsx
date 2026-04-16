"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPendingRequests, acceptFriendRequest, rejectFriendRequest } from "@/actions/amigos";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface FriendRequest {
  id: string;
  de: { id: string; username: string; avatar: string; nivel: number };
  createdAt: Date;
}

export default function SolicitudesPage() {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    const result = await getPendingRequests();
    if (result.success && result.data) {
      setRequests(result.data as unknown as FriendRequest[]);
    }
    setLoading(false);
  }

  async function handleAccept(id: string) {
    await acceptFriendRequest(id);
    fetchRequests();
  }

  async function handleReject(id: string) {
    await rejectFriendRequest(id);
    fetchRequests();
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/amigos" className="p-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Solicitudes de Amistad</h1>
          <p className="text-gray-600 mt-1">Acepta o rechaza las solicitudes entrantes</p>
        </div>
      </div>

      {requests.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">No hay solicitudes pendientes</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-medium">
                  {request.de.username[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{request.de.username}</h3>
                  <p className="text-sm text-gray-500">Nivel {request.de.nivel}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleAccept(request.id)}>
                    Aceptar
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => handleReject(request.id)}>
                    Rechazar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
