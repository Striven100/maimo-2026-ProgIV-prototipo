"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getMateriaById, shareMateria, removeMember } from "@/actions/materias";
import { createTarea, toggleTareaCompletada, deleteTarea } from "@/actions/tareas";
import { createNota, deleteNota } from "@/actions/notas";
import { searchUsers, getFriends } from "@/actions/amigos";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";

interface MateriaDetails {
  id: string;
  nombre: string;
  descripcion?: string;
  color: string;
  codigo?: string;
  owner: { id: string; username: string };
  miembros: { id: string; userId: string; rol: string; user: { id: string; username: string; avatar: string } }[];
  tareas: { id: string; titulo: string; fechaLimite?: string; completada: boolean; prioridad: string; ownerId: string }[];
  notas: { id: string; titulo: string; contenido: string; createdAt: string; ownerId: string }[];
}

export default function MateriaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [materia, setMateria] = useState<MateriaDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"tareas" | "notas" | "miembros">("tareas");
  const [showTareaModal, setShowTareaModal] = useState(false);
  const [showNotaModal, setShowNotaModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [tareaForm, setTareaForm] = useState({ titulo: "", descripcion: "", fechaLimite: "", prioridad: "MEDIA" });
  const [notaForm, setNotaForm] = useState({ titulo: "", contenido: "" });
  const [friends, setFriends] = useState<{ id: string; username: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; username: string }[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMateria();
  }, [id]);

  useEffect(() => {
    if (showShareModal) {
      fetchFriends();
    }
  }, [showShareModal]);

  async function fetchMateria() {
    const result = await getMateriaById(id);
    if (result.success && result.data) {
      setMateria(result.data as unknown as MateriaDetails);
    } else {
      router.push("/materias");
    }
    setLoading(false);
  }

  async function fetchFriends() {
    const result = await getFriends();
    if (result.success && result.data) {
      setFriends(result.data);
    }
  }

  async function handleSearch(query: string) {
    setSearchQuery(query);
    if (query.length >= 3) {
      const result = await searchUsers(query);
      if (result.success && result.data) {
        const currentMemberIds = materia?.miembros.map(m => m.userId) || [];
        setSearchResults(result.data.filter((u: { id: string }) => !currentMemberIds.includes(u.id)));
      }
    } else {
      setSearchResults([]);
    }
  }

  async function handleCreateTarea(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const result = await createTarea({ ...tareaForm, materiaId: id });
    if (result.success) {
      setShowTareaModal(false);
      setTareaForm({ titulo: "", descripcion: "", fechaLimite: "", prioridad: "MEDIA" });
      fetchMateria();
    } else {
      setError(result.error || "Error al crear la tarea");
    }
  }

  async function handleCreateNota(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const result = await createNota({ ...notaForm, materiaId: id });
    if (result.success) {
      setShowNotaModal(false);
      setNotaForm({ titulo: "", contenido: "" });
      fetchMateria();
    } else {
      setError(result.error || "Error al crear la nota");
    }
  }

  async function handleShare(friendUsername: string) {
    setError(null);
    const result = await shareMateria(id, friendUsername);
    if (result.success) {
      setSearchQuery("");
      setSearchResults([]);
      fetchMateria();
    } else {
      setError(result.error || "Error al compartir");
    }
  }

  async function handleToggleTarea(tareaId: string) {
    await toggleTareaCompletada(tareaId);
    fetchMateria();
  }

  async function handleDeleteTarea(tareaId: string) {
    if (!confirm("¿Eliminar esta tarea?")) return;
    await deleteTarea(tareaId);
    fetchMateria();
  }

  async function handleDeleteNota(notaId: string) {
    if (!confirm("¿Eliminar esta nota?")) return;
    await deleteNota(notaId);
    fetchMateria();
  }

  async function handleRemoveMember(userId: string) {
    if (!confirm("¿Eliminar este miembro?")) return;
    await removeMember(id, userId);
    fetchMateria();
  }

  if (loading || !materia) {
    return <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />;
  }

  const isOwner = materia.owner.id === "current-user";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.push("/materias")} className="p-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded" style={{ backgroundColor: materia.color }} />
            <h1 className="text-2xl font-bold text-gray-900">{materia.nombre}</h1>
          </div>
          {materia.codigo && <p className="text-gray-500 mt-1">Código: {materia.codigo}</p>}
        </div>
        <Button onClick={() => setShowShareModal(true)}>Compartir</Button>
      </div>

      {materia.descripcion && (
        <p className="text-gray-600">{materia.descripcion}</p>
      )}

      <div className="flex gap-4 border-b border-gray-200">
        {(["tareas", "notas", "miembros"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-1 text-sm font-medium transition-colors ${
              activeTab === tab
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} ({tab === "tareas" ? materia.tareas.length : tab === "notas" ? materia.notas.length : materia.miembros.length})
          </button>
        ))}
      </div>

      {activeTab === "tareas" && (
        <div className="space-y-4">
          <Button onClick={() => setShowTareaModal(true)}>Nueva Tarea</Button>
          {materia.tareas.length === 0 ? (
            <Card className="p-8 text-center text-gray-500">
              No hay tareas en esta materia
            </Card>
          ) : (
            <div className="space-y-2">
              {materia.tareas.map((tarea) => (
                <Card key={tarea.id} className={`${tarea.completada ? "opacity-60" : ""}`}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={tarea.completada}
                      onChange={() => handleToggleTarea(tarea.id)}
                      className="w-5 h-5 rounded border-gray-300"
                    />
                    <div className="flex-1">
                      <p className={`font-medium ${tarea.completada ? "line-through text-gray-500" : "text-gray-900"}`}>
                        {tarea.titulo}
                      </p>
                      {tarea.fechaLimite && (
                        <p className="text-sm text-gray-500">Fecha límite: {formatDate(tarea.fechaLimite)}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      tarea.prioridad === "ALTA" ? "bg-red-100 text-red-700" :
                      tarea.prioridad === "MEDIA" ? "bg-yellow-100 text-yellow-700" :
                      "bg-green-100 text-green-700"
                    }`}>
                      {tarea.prioridad}
                    </span>
                    <button
                      onClick={() => handleDeleteTarea(tarea.id)}
                      className="p-2 text-gray-400 hover:text-red-600"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "notas" && (
        <div className="space-y-4">
          <Button onClick={() => setShowNotaModal(true)}>Nueva Nota</Button>
          {materia.notas.length === 0 ? (
            <Card className="p-8 text-center text-gray-500">
              No hay notas en esta materia
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {materia.notas.map((nota) => (
                <Card key={nota.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{nota.titulo}</h3>
                      <button
                        onClick={() => handleDeleteNota(nota.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 line-clamp-3">{nota.contenido}</p>
                    <a
                      href={`/notas/${nota.id}`}
                      className="inline-block mt-2 text-sm text-blue-600 hover:underline"
                    >
                      Ver nota completa
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "miembros" && (
        <div className="space-y-2">
          {materia.miembros.map((member) => (
            <Card key={member.id}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                  {member.user.username[0].toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{member.user.username}</p>
                  <p className="text-sm text-gray-500">{member.rol}</p>
                </div>
                {member.rol !== "CREADOR" && (
                  <button
                    onClick={() => handleRemoveMember(member.userId)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Eliminar
                  </button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showTareaModal} onClose={() => setShowTareaModal(false)} title="Nueva Tarea">
        <form onSubmit={handleCreateTarea} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
          <Input
            label="Título"
            value={tareaForm.titulo}
            onChange={(e) => setTareaForm({ ...tareaForm, titulo: e.target.value })}
            required
          />
          <Input
            label="Descripción (opcional)"
            value={tareaForm.descripcion}
            onChange={(e) => setTareaForm({ ...tareaForm, descripcion: e.target.value })}
          />
          <Input
            label="Fecha límite (opcional)"
            type="datetime-local"
            value={tareaForm.fechaLimite}
            onChange={(e) => setTareaForm({ ...tareaForm, fechaLimite: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prioridad</label>
            <select
              value={tareaForm.prioridad}
              onChange={(e) => setTareaForm({ ...tareaForm, prioridad: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="BAJA">Baja</option>
              <option value="MEDIA">Media</option>
              <option value="ALTA">Alta</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowTareaModal(false)} className="flex-1">Cancelar</Button>
            <Button type="submit" className="flex-1">Crear</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showNotaModal} onClose={() => setShowNotaModal(false)} title="Nueva Nota">
        <form onSubmit={handleCreateNota} className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
          <Input
            label="Título"
            value={notaForm.titulo}
            onChange={(e) => setNotaForm({ ...notaForm, titulo: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
            <textarea
              value={notaForm.contenido}
              onChange={(e) => setNotaForm({ ...notaForm, contenido: e.target.value })}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Escribe tu nota aquí..."
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowNotaModal(false)} className="flex-1">Cancelar</Button>
            <Button type="submit" className="flex-1">Crear</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showShareModal} onClose={() => setShowShareModal(false)} title="Compartir Materia">
        <div className="space-y-4">
          {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
          <Input
            label="Buscar amigo por username"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Escribe al menos 3 caracteres"
          />
          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">{user.username}</span>
                  <Button size="sm" onClick={() => handleShare(user.username)}>Agregar</Button>
                </div>
              ))}
            </div>
          )}
          {searchQuery.length >= 3 && searchResults.length === 0 && (
            <p className="text-sm text-gray-500 text-center">No se encontraron usuarios</p>
          )}
          {friends.length > 0 && (
            <>
              <p className="text-sm font-medium text-gray-700 pt-4">Tus amigos:</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {friends.map((friend) => {
                  const isMember = materia.miembros.some(m => m.userId === friend.id);
                  return (
                    <div key={friend.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm">{friend.username}</span>
                      {isMember ? (
                        <span className="text-xs text-green-600">Ya es miembro</span>
                      ) : (
                        <Button size="sm" variant="secondary" onClick={() => handleShare(friend.username)}>
                          Agregar
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
