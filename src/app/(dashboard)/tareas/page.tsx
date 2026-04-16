"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getTareas, toggleTareaCompletada, deleteTarea } from "@/actions/tareas";
import { getMaterias } from "@/actions/materias";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

interface Tarea {
  id: string;
  titulo: string;
  descripcion: string | null;
  fechaLimite: string | null;
  completada: boolean;
  prioridad: string;
  materia: { id: string; nombre: string; color: string };
}

interface Materia {
  id: string;
  nombre: string;
}

export default function TareasPage() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMateria, setFilterMateria] = useState<string>("");
  const [filterCompletada, setFilterCompletada] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [tareasRes, materiasRes] = await Promise.all([
      getTareas(),
      getMaterias(),
    ]);
    if (tareasRes.success && tareasRes.data) {
      setTareas(tareasRes.data as unknown as Tarea[]);
    }
    if (materiasRes.success && materiasRes.data) {
      setMaterias(materiasRes.data as unknown as Materia[]);
    }
    setLoading(false);
  }

  async function handleToggle(id: string) {
    await toggleTareaCompletada(id);
    fetchData();
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta tarea?")) return;
    await deleteTarea(id);
    fetchData();
  }

  const filteredTareas = tareas.filter((tarea) => {
    if (filterMateria && tarea.materia.id !== filterMateria) return false;
    if (filterCompletada === "completada" && !tarea.completada) return false;
    if (filterCompletada === "pendiente" && tarea.completada) return false;
    return true;
  });

  const pendientes = filteredTareas.filter((t) => !t.completada);
  const completadas = filteredTareas.filter((t) => t.completada);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tareas</h1>
          <p className="text-gray-600 mt-1">Todas tus tareas en un solo lugar</p>
        </div>
        <div className="flex gap-2">
          <select
            value={filterMateria}
            onChange={(e) => setFilterMateria(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Todas las materias</option>
            {materias.map((m) => (
              <option key={m.id} value={m.id}>{m.nombre}</option>
            ))}
          </select>
          <select
            value={filterCompletada}
            onChange={(e) => setFilterCompletada(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="">Todas</option>
            <option value="pendiente">Pendientes</option>
            <option value="completada">Completadas</option>
          </select>
          <Link href="/tareas/calendar">
            <Button variant="secondary">Calendario</Button>
          </Link>
        </div>
      </div>

      {filteredTareas.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">No hay tareas</p>
        </Card>
      ) : (
        <>
          {pendientes.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-900">
                Pendientes ({pendientes.length})
              </h2>
              {pendientes.map((tarea) => (
                <Card key={tarea.id} className={tarea.completada ? "opacity-60" : ""}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={tarea.completada}
                      onChange={() => handleToggle(tarea.id)}
                      className="w-5 h-5 rounded border-gray-300"
                    />
                    <div className="flex-1">
                      <Link
                        href={`/materias/${tarea.materia.id}`}
                        className="inline-flex items-center gap-2 text-sm"
                      >
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tarea.materia.color }} />
                        <span className="text-gray-600">{tarea.materia.nombre}</span>
                      </Link>
                      <p className="font-medium text-gray-900 mt-1">{tarea.titulo}</p>
                      {tarea.fechaLimite && (
                        <p className="text-sm text-gray-500">
                          Fecha límite: {formatDate(tarea.fechaLimite)}
                        </p>
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
                      onClick={() => handleDelete(tarea.id)}
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

          {completadas.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-gray-700">
                Completadas ({completadas.length})
              </h2>
              {completadas.map((tarea) => (
                <Card key={tarea.id} className="opacity-60">
                  <CardContent className="p-4 flex items-center gap-4">
                    <input
                      type="checkbox"
                      checked={tarea.completada}
                      onChange={() => handleToggle(tarea.id)}
                      className="w-5 h-5 rounded border-gray-300"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-500 line-through">{tarea.titulo}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(tarea.id)}
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
        </>
      )}
    </div>
  );
}
