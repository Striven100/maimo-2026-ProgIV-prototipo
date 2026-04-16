"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getNotas, deleteNota } from "@/actions/notas";
import { Card, CardContent } from "@/components/ui/Card";
import { formatDate } from "@/lib/utils";

interface Nota {
  id: string;
  titulo: string;
  contenido: string;
  materia: { id: string; nombre: string; color: string };
  createdAt: string;
}

export default function NotasPage() {
  const [notas, setNotas] = useState<Nota[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchNotas();
  }, []);

  async function fetchNotas() {
    const result = await getNotas();
    if (result.success && result.data) {
      setNotas(result.data as unknown as Nota[]);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta nota?")) return;
    await deleteNota(id);
    fetchNotas();
  }

  const filteredNotas = notas.filter((nota) =>
    nota.titulo.toLowerCase().includes(search.toLowerCase()) ||
    nota.contenido.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 rounded animate-pulse" />
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notas</h1>
          <p className="text-gray-600 mt-1">Todas tus notas organizadas por materia</p>
        </div>
        <input
          type="text"
          placeholder="Buscar notas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg w-64"
        />
      </div>

      {filteredNotas.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">
            {search ? "No se encontraron notas" : "No hay notas todavía"}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotas.map((nota) => (
            <Card key={nota.id}>
              <div className="h-1" style={{ backgroundColor: nota.materia.color }} />
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <Link href={`/notas/${nota.id}`}>
                    <h3 className="font-semibold text-gray-900 hover:text-blue-600">
                      {nota.titulo}
                    </h3>
                  </Link>
                  <button
                    onClick={() => handleDelete(nota.id)}
                    className="p-1 text-gray-400 hover:text-red-600"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-600 mt-2 line-clamp-3">{nota.contenido}</p>
                <div className="flex items-center justify-between mt-4">
                  <Link
                    href={`/materias/${nota.materia.id}`}
                    className="text-xs text-gray-500 hover:underline"
                  >
                    {nota.materia.nombre}
                  </Link>
                  <span className="text-xs text-gray-400">{formatDate(nota.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
