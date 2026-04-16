"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function NotasPage() {
  const [notas, setNotas] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [materiaId, setMateriaId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const m = params.get("materia");
    if (m) setMateriaId(m);
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [notasRes, materiasRes] = await Promise.all([
      fetch("/api/notas"),
      fetch("/api/materias"),
    ]);
    
    if (notasRes.ok) setNotas(await notasRes.json());
    if (materiasRes.ok) setMaterias(await materiasRes.json());
    setLoading(false);
  }

  async function handleCreate(e) {
    e.preventDefault();
    
    const res = await fetch("/api/notas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ titulo, contenido, materiaId }),
    });

    if (res.ok) {
      setShowForm(false);
      setTitulo("");
      setContenido("");
      fetchData();
    } else if (res.status === 401) {
      alert("Debes iniciar sesión para crear notas");
    }
  }

  async function handleDelete(id) {
    await fetch(`/api/notas/${id}`, { method: "DELETE" });
    fetchData();
  }

  const getMateriaColor = (id) => {
    const m = materias.find((mat) => mat._id === id);
    return m ? m.color : "#3B82F6";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-blue-600 font-bold text-xl">ProgIV</Link>
            <Link href="/materias" className="text-gray-600">Materias</Link>
            <Link href="/tareas" className="text-gray-600">Tareas</Link>
            <Link href="/notas" className="text-gray-600">Notas</Link>
            <Link href="/amigos" className="text-gray-600">Amigos</Link>
          </div>
          <div className="flex gap-2">
            <Link href="/login" className="text-sm text-blue-600 hover:underline">Iniciar Sesión</Link>
            <Link href="/register" className="text-sm bg-blue-600 text-white px-3 py-1 rounded">Registrarse</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Mis Notas</h2>
          <button
            onClick={() => setShowForm(true)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            Nueva Nota
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h3 className="font-semibold mb-4">Crear Nota</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                placeholder="Título de la nota"
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
              <textarea
                placeholder="Contenido de la nota..."
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg h-32"
              />
              <div className="flex gap-2">
                <button type="submit" className="bg-purple-600 text-white px-4 py-2 rounded-lg">
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

        {loading ? (
          <div className="text-center py-12 text-gray-500">Cargando...</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notas.map((nota) => (
                <div key={nota._id} className="bg-white rounded-xl shadow overflow-hidden">
                  <div className="h-1" style={{ backgroundColor: getMateriaColor(nota.materiaId) }} />
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold">{nota.titulo}</h3>
                      <button onClick={() => handleDelete(nota._id)} className="text-red-500 text-sm">✕</button>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-3">{nota.contenido}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(nota.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {notas.length === 0 && (
              <div className="bg-white rounded-xl shadow p-12 text-center">
                <p className="text-gray-500 mb-4">No tienes notas</p>
                <Link href="/register" className="text-blue-600 hover:underline">
                  Regístrate para empezar
                </Link>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
