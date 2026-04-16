"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function MateriasPage() {
  const [materias, setMaterias] = useState([]);
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [color, setColor] = useState("#3B82F6");
  const [loading, setLoading] = useState(true);

  const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [materiasRes, userRes] = await Promise.all([
      fetch("/api/materias"),
      fetch("/api/user"),
    ]);
    
    if (materiasRes.ok) setMaterias(await materiasRes.json());
    if (userRes.ok) setUser(await userRes.json());
    setLoading(false);
  }

  async function handleCreate(e) {
    e.preventDefault();
    
    const res = await fetch("/api/materias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, descripcion, color }),
    });

    if (res.ok) {
      setShowForm(false);
      setNombre("");
      setDescripcion("");
      fetchData();
    } else if (res.status === 401) {
      alert("Debes iniciar sesión para crear materias");
    }
  }

  async function handleDelete(id) {
    if (!confirm("¿Eliminar esta materia?")) return;
    await fetch(`/api/materias/${id}`, { method: "DELETE" });
    fetchData();
  }

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
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm">
                  <span className="font-medium">{user.username}</span>
                  <span className="text-gray-500 ml-2">Lv.{user.nivel} ({user.xp} XP)</span>
                </span>
                <a href="/api/auth/logout" className="text-sm text-gray-600 hover:text-gray-800">
                  Cerrar Sesión
                </a>
              </>
            ) : (
              <div className="flex gap-2">
                <Link href="/login" className="text-sm text-blue-600 hover:underline">Iniciar Sesión</Link>
                <Link href="/register" className="text-sm bg-blue-600 text-white px-3 py-1 rounded">Registrarse</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Mis Materias</h2>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Nueva Materia
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h3 className="font-semibold mb-4">Crear Materia</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                placeholder="Nombre de la materia"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Descripción (opcional)"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
              <div className="flex gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full ${color === c ? "ring-2 ring-offset-2 ring-gray-400" : ""}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
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

        {loading ? (
          <div className="text-center py-12 text-gray-500">Cargando...</div>
        ) : materias.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center">
            <p className="text-gray-500 mb-4">No tienes materias. ¡Crea tu primera materia!</p>
            <Link href="/register" className="text-blue-600 hover:underline">
              Regístrate para empezar
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {materias.map((materia) => (
              <div key={materia._id} className="bg-white rounded-xl shadow overflow-hidden">
                <div className="h-2" style={{ backgroundColor: materia.color }} />
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{materia.nombre}</h3>
                  {materia.descripcion && (
                    <p className="text-sm text-gray-500 mt-1">{materia.descripcion}</p>
                  )}
                  <div className="flex gap-2 mt-4">
                    <Link
                      href={`/tareas?materia=${materia._id}`}
                      className="flex-1 bg-blue-100 text-blue-700 text-center py-2 rounded-lg text-sm"
                    >
                      Ver Tareas
                    </Link>
                    <Link
                      href={`/notas?materia=${materia._id}`}
                      className="flex-1 bg-purple-100 text-purple-700 text-center py-2 rounded-lg text-sm"
                    >
                      Ver Notas
                    </Link>
                    <button
                      onClick={() => handleDelete(materia._id)}
                      className="text-red-500 px-3 py-2"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
