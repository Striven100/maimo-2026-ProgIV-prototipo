"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TareasPage() {
  const [tareas, setTareas] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [materiaId, setMateriaId] = useState("");
  const [fechaLimite, setFechaLimite] = useState("");
  const [prioridad, setPrioridad] = useState("MEDIA");
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const m = params.get("materia");
    if (m) setMateriaId(m);
    fetchData();
  }, []);

  async function fetchData() {
    const [tareasRes, materiasRes] = await Promise.all([
      fetch("/api/tareas"),
      fetch("/api/materias"),
    ]);
    
    if (tareasRes.status === 401) {
      router.push("/login");
      return;
    }

    if (tareasRes.ok) setTareas(await tareasRes.json());
    if (materiasRes.ok) setMaterias(await materiasRes.json());
  }

  async function handleCreate(e) {
    e.preventDefault();
    
    const res = await fetch("/api/tareas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo, materiaId, fechaLimite, prioridad }),
    });

    if (res.ok) {
      setShowForm(false);
      setTitulo("");
      fetchData();
    }
  }

  async function toggleCompletada(id, current) {
    await fetch(`/api/tareas/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completada: !current }),
    });
    fetchData();
  }

  async function handleDelete(id) {
    await fetch(`/api/tareas/${id}`, { method: "DELETE" });
    fetchData();
  }

  const getMateriaNombre = (id) => {
    const m = materias.find((mat) => mat._id === id);
    return m ? m.nombre : "Sin materia";
  };

  const prioridadColor = {
    ALTA: "bg-red-100 text-red-700",
    MEDIA: "bg-yellow-100 text-yellow-700",
    BAJA: "bg-green-100 text-green-700",
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/materias" className="text-gray-600 hover:text-gray-800">← Materias</a>
            <h1 className="text-xl font-bold text-gray-800">Tareas</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Mis Tareas</h2>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Nueva Tarea
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h3 className="font-semibold mb-4">Crear Tarea</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                placeholder="Título de la tarea"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <select
                value={materiaId}
                onChange={(e) => setMateriaId(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                required
              >
                <option value="">Selecciona una materia</option>
                {materias.map((m) => (
                  <option key={m._id} value={m._id}>{m.nombre}</option>
                ))}
              </select>
              <input
                type="datetime-local"
                value={fechaLimite}
                onChange={(e) => setFechaLimite(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <select
                value={prioridad}
                onChange={(e) => setPrioridad(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              >
                <option value="BAJA">Baja</option>
                <option value="MEDIA">Media</option>
                <option value="ALTA">Alta</option>
              </select>
              <div className="flex gap-2">
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                  Crear
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-200 px-4 py-2 rounded-lg"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="space-y-2">
          {tareas.map((tarea) => (
            <div
              key={tarea._id}
              className={`bg-white rounded-lg shadow p-4 flex items-center gap-4 ${
                tarea.completada ? "opacity-60" : ""
              }`}
            >
              <input
                type="checkbox"
                checked={tarea.completada}
                onChange={() => toggleCompletada(tarea._id, tarea.completada)}
                className="w-5 h-5"
              />
              <div className="flex-1">
                <p className={`font-medium ${tarea.completada ? "line-through text-gray-500" : ""}`}>
                  {tarea.titulo}
                </p>
                <p className="text-sm text-gray-500">
                  {getMateriaNombre(tarea.materiaId)}
                  {tarea.fechaLimite && ` • ${new Date(tarea.fechaLimite).toLocaleDateString()}`}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${prioridadColor[tarea.prioridad]}`}>
                {tarea.prioridad}
              </span>
              <button onClick={() => handleDelete(tarea._id)} className="text-red-500">
                ✕
              </button>
            </div>
          ))}
          {tareas.length === 0 && (
            <div className="bg-white rounded-xl shadow p-12 text-center text-gray-500">
              No tienes tareas
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
