"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AmigosPage() {
  const [amigos, setAmigos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetchAmigos();
  }, []);

  async function fetchAmigos() {
    const res = await fetch("/api/amigos");
    if (res.status === 401) {
      router.push("/login");
      return;
    }
    if (res.ok) setAmigos(await res.json());
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
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/materias" className="text-gray-600 hover:text-gray-800">← Inicio</a>
            <h1 className="text-xl font-bold text-gray-800">Amigos</h1>
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

        <h2 className="text-xl font-bold text-gray-800 mb-4">Mis Amigos ({amigos.length})</h2>
        
        {amigos.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-12 text-center text-gray-500">
            No tienes amigos. ¡Busca y agrega a otros usuarios!
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
      </main>
    </div>
  );
}
