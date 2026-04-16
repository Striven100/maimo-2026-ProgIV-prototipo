"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AmigosPage() {
  const [amigos, setAmigos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAmigos();
  }, []);

  async function fetchAmigos() {
    setLoading(true);
    const res = await fetch("/api/amigos");
    if (res.ok) setAmigos(await res.json());
    setLoading(false);
  }

  async function handleSearch(e) {
    e.preventDefault();
    if (busqueda.length < 3) return;
    
    const res = await fetch(`/api/amigos?q=${busqueda}`);
    if (res.ok) {
      const results = await res.json();
      setResultados(results.filter(r => !amigos.find(a => a._id === r._id)));
    }
  }

  async function agregarAmigo(amigoId) {
    const res = await fetch("/api/amigos/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amigoId }),
    });
    
    if (res.ok) {
      fetchAmigos();
      setBusqueda("");
      setResultados([]);
    } else if (res.status === 401) {
      alert("Debes iniciar sesión para agregar amigos");
    }
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
          <div className="flex gap-2">
            <Link href="/login" className="text-sm text-blue-600 hover:underline">Iniciar Sesión</Link>
            <Link href="/register" className="text-sm bg-blue-600 text-white px-3 py-1 rounded">Registrarse</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h3 className="font-semibold mb-4">Buscar Amigos</h3>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Escribe al menos 3 caracteres..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="flex-1 px-4 py-2 border rounded-lg"
            />
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg">
              Buscar
            </button>
          </form>
          
          {resultados.length > 0 && (
            <div className="mt-4 space-y-2">
              {resultados.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{user.username}</p>
                    <p className="text-sm text-gray-500">Nivel {user.nivel || 1}</p>
                  </div>
                  <button
                    onClick={() => agregarAmigo(user._id)}
                    className="bg-green-600 text-white px-4 py-1 rounded-lg text-sm"
                  >
                    Agregar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-500">Cargando...</div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-800 mb-4">Mis Amigos ({amigos.length})</h2>
            
            {amigos.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-12 text-center">
                <p className="text-gray-500 mb-4">No tienes amigos</p>
                <Link href="/register" className="text-blue-600 hover:underline">
                  Regístrate para agregar amigos
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {amigos.map((amigo) => (
                  <div key={amigo._id} className="bg-white rounded-xl shadow p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                      {amigo.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{amigo.username}</p>
                      <p className="text-sm text-gray-500">Nivel {amigo.nivel || 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
