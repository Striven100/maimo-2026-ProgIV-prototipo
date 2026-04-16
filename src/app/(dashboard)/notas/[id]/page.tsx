"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { getNotaById, updateNota } from "@/actions/notas";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface NotaDetails {
  id: string;
  titulo: string;
  contenido: string;
  materia: { id: string; nombre: string; color: string };
  owner: { username: string };
}

export default function NotaEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [nota, setNota] = useState<NotaDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ titulo: "", contenido: "" });

  useEffect(() => {
    fetchNota();
  }, [id]);

  async function fetchNota() {
    const result = await getNotaById(id);
    if (result.success && result.data) {
      const data = result.data as unknown as NotaDetails;
      setNota(data);
      setFormData({ titulo: data.titulo, contenido: data.contenido });
    } else {
      router.push("/notas");
    }
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    const result = await updateNota(id, formData);
    if (result.success) {
      setNota({ ...nota!, ...formData });
    }
    setSaving(false);
  }

  if (loading || !nota) {
    return <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.push("/notas")} className="p-2 hover:bg-gray-100 rounded-lg">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Editar Nota</h1>
          <p className="text-sm text-gray-500">
            Materia: <span style={{ color: nota.materia.color }}>{nota.materia.nombre}</span>
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Guardando..." : "Guardar"}
        </Button>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <Input
            label="Título"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contenido</label>
            <textarea
              value={formData.contenido}
              onChange={(e) => setFormData({ ...formData, contenido: e.target.value })}
              rows={15}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="Escribe tu nota aquí..."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
