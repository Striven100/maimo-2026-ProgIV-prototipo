"use client";

import { useEffect, useState } from "react";
import { getTareas } from "@/actions/tareas";

interface Tarea {
  id: string;
  titulo: string;
  fechaLimite: string | null;
  materia: { nombre: string; color: string };
}

export default function CalendarioPage() {
  const [tareas, setTareas] = useState<Tarea[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTareas();
  }, []);

  async function fetchTareas() {
    const result = await getTareas();
    if (result.success && result.data) {
      const filtered = (result.data as unknown as Tarea[]).filter((t) => t.fechaLimite);
      setTareas(filtered);
    }
    setLoading(false);
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startingDay = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getTareasForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return tareas.filter((t) => {
      if (!t.fechaLimite) return false;
      const tareaDate = new Date(t.fechaLimite).toISOString().split("T")[0];
      return tareaDate === dateStr;
    });
  };

  const today = new Date();
  const isToday = (day: number) => {
    return day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear();
  };

  if (loading) {
    return <div className="h-96 bg-gray-200 rounded-xl animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendario</h1>
          <p className="text-gray-600 mt-1">Vista de calendario de tus tareas</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl font-semibold">{monthNames[month]} {year}</h2>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {[...Array(startingDay)].map((_, i) => (
            <div key={`empty-${i}`} className="min-h-24 border-r border-b border-gray-200 bg-gray-50" />
          ))}
          {[...Array(daysInMonth)].map((_, i) => {
            const day = i + 1;
            const dayTareas = getTareasForDay(day);
            return (
              <div
                key={day}
                className={`min-h-24 border-r border-b border-gray-200 p-2 ${
                  isToday(day) ? "bg-blue-50" : ""
                }`}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isToday(day) ? "text-blue-600" : "text-gray-700"
                }`}>
                  {day}
                </div>
                <div className="space-y-1">
                  {dayTareas.slice(0, 3).map((tarea) => (
                    <div
                      key={tarea.id}
                      className="text-xs p-1 rounded truncate"
                      style={{ backgroundColor: `${tarea.materia.color}20`, color: tarea.materia.color }}
                      title={tarea.titulo}
                    >
                      {tarea.titulo}
                    </div>
                  ))}
                  {dayTareas.length > 3 && (
                    <div className="text-xs text-gray-500">+{dayTareas.length - 3} más</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
