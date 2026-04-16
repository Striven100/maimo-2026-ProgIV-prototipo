"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFriends, removeFriend, searchUsers, sendFriendRequest } from "@/actions/amigos";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

interface Friend {
  id: string;
  username: string;
  avatar: string;
  nivel: number;
}

interface SearchResult {
  id: string;
  username: string;
  nivel: number;
}

export default function AmigosPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFriends();
  }, []);

  useEffect(() => {
    if (searchQuery.length >= 3) {
      performSearch(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  async function fetchFriends() {
    const result = await getFriends();
    if (result.success && result.data) {
      setFriends(result.data);
    }
    setLoading(false);
  }

  async function performSearch(query: string) {
    setSearching(true);
    const result = await searchUsers(query);
    if (result.success && result.data) {
      setSearchResults(result.data);
    }
    setSearching(false);
  }

  async function handleSendRequest(userId: string, username: string) {
    setError(null);
    const result = await sendFriendRequest(userId);
    if (result.success) {
      setSearchResults(searchResults.filter((u) => u.id !== userId));
    } else {
      setError(result.error || "Error al enviar solicitud");
    }
  }

  async function handleRemove(friendId: string) {
    if (!confirm("¿Eliminar este amigo?")) return;
    await removeFriend(friendId);
    fetchFriends();
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Amigos</h1>
          <p className="text-gray-600 mt-1">Conecta y comparte con otros estudiantes</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowSearchModal(true)}>Buscar Amigos</Button>
          <Link href="/amigos/solicitudes">
            <Button variant="secondary">Solicitudes</Button>
          </Link>
        </div>
      </div>

      {friends.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-4">No tienes amigos todavía</p>
          <Button onClick={() => setShowSearchModal(true)}>Buscar Amigos</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {friends.map((friend) => (
            <Card key={friend.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-medium">
                  {friend.username[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{friend.username}</h3>
                  <p className="text-sm text-gray-500">Nivel {friend.nivel}</p>
                </div>
                <button
                  onClick={() => handleRemove(friend.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Eliminar
                </button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showSearchModal} onClose={() => setShowSearchModal(false)} title="Buscar Amigos">
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>
          )}
          <Input
            label="Username"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Escribe al menos 3 caracteres"
          />
          {searching && (
            <p className="text-sm text-gray-500 text-center">Buscando...</p>
          )}
          {searchResults.length > 0 && (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {searchResults.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{user.username}</p>
                    <p className="text-sm text-gray-500">Nivel {user.nivel}</p>
                  </div>
                  <Button size="sm" onClick={() => handleSendRequest(user.id, user.username)}>
                    Enviar solicitud
                  </Button>
                </div>
              ))}
            </div>
          )}
          {searchQuery.length >= 3 && searchResults.length === 0 && !searching && (
            <p className="text-sm text-gray-500 text-center">No se encontraron usuarios</p>
          )}
        </div>
      </Modal>
    </div>
  );
}
