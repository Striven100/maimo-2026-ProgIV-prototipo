"use client";

import { useEffect, useState } from "react";
import { createMateria, getMaterias, deleteMateria } from "@/actions/materias";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

interface Materia {
  id: string;
  nombre: string;
  descripcion: string | null;
  color: string;
  codigo: string | null;
  owner: { id: string; username: string };
  miembros: { userId: string; rol: string }[];
  _count: { tareas: number; notas: number };
}

const COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
  "#EC4899", "#14B8A6", "#F97316", "#6366F1", "#84CC16",
];

export default function MateriasPage() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    color: "#3B82F6",
    codigo: "",
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMaterias();
  }, []);

  async function fetchMaterias() {
    const result = await getMaterias();
    if (result.success && result.data) {
      setMaterias(result.data as unknown as Materia[]);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const result = await createMateria(formData);
    if (result.success) {
      setShowModal(false);
      setFormData({ nombre: "", descripcion: "", color: "#3B82F6", codigo: "" });
      fetchMaterias();
    } else {
      setError(result.error || "Error al crear la materia");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de eliminar esta materia?")) return;
    const result = await deleteMateria(id);
    if (result.success) {
      fetchMaterias();
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-40 bg-gray-200 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Materias</h1>
          <p className="text-gray-600 mt-1">Gestiona tus materias y compártelas con amigos</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          Nueva Materia
        </Button>
      </div>

      {materias.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500 mb-4">No tienes materias creadas</p>
          <Button onClick={() => setShowModal(true)}>Crear tu primera materia</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materias.map((materia) => (
            <Card key={materia.id} className="overflow-hidden">
              <div className="h-2" style={{ backgroundColor: materia.color }} />
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{materia.nombre}</h3>
                    {materia.codigo && (
                      <p className="text-xs text-gray-500 mt-1">Código: {materia.codigo}</p>
                    )}
                  </div>
                  <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                    {materia.miembros.length} miembro{materia.miembros.length !== 1 && "s"}
                  </span>
                </div>
                {materia.descripcion && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{materia.descripcion}</p>
                )}
                <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
                  <span>{materia._count.tareas} tareas</span>
                  <span>{materia._count.notas} notas</span>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="secondary" size="sm" className="flex-1">
                    <a href={`/materias/${materia.id}`}>Ver</a>
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(materia.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nueva Materia">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          <Input
            label="Nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            placeholder="Ej: Matemáticas"
            required
          />
          <Input
            label="Descripción (opcional)"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            placeholder="Descripción de la materia"
          />
          <Input
            label="Código (opcional)"
            value={formData.codigo}
            onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
            placeholder="Ej: MAT-101"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full transition-transform ${
                    formData.color === color ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" className="flex-1">
              Crear
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
