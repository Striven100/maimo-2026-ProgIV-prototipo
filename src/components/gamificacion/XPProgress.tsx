"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface XPProgressProps {
  className?: string;
}

export function XPProgress({ className }: XPProgressProps) {
  const [mounted, setMounted] = useState(false);
  const [xp, setXp] = useState(0);
  const [nivel, setNivel] = useState(1);

  useEffect(() => {
    setMounted(true);
    fetchXPData();
    
    const interval = setInterval(fetchXPData, 30000);
    return () => clearInterval(interval);
  }, []);

  async function fetchXPData() {
    try {
      const res = await fetch("/api/user/xp");
      if (res.ok) {
        const data = await res.json();
        setXp(data.xp);
        setNivel(data.nivel);
      }
    } catch (error) {
      console.error("Error fetching XP:", error);
    }
  }

  if (!mounted) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className="w-24 h-2 bg-gray-200 rounded-full animate-pulse" />
      </div>
    );
  }

  const xpForCurrentLevel = nivel * 100;
  let xpAtLevelStart = 0;
  for (let i = 1; i < nivel; i++) {
    xpAtLevelStart += i * 100;
  }
  const xpInLevel = xp - xpAtLevelStart;
  const percentage = Math.min((xpInLevel / xpForCurrentLevel) * 100, 100);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">
          Nivel {nivel}
        </span>
        <span className="text-xs text-gray-500">
          {xpInLevel}/{xpForCurrentLevel} XP
        </span>
      </div>
      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
