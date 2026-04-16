"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { XPProgress } from "@/components/gamificacion/XPProgress";

export function Header() {
  const { data: session } = useSession();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-900">Bienvenido</h2>
      </div>

      <div className="flex items-center gap-6">
        {session?.user && (
          <>
            <XPProgress />
            <Link
              href="/perfil"
              className="flex items-center gap-3 hover:bg-gray-50 px-3 py-2 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                {session.user.name?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {session.user.name}
              </span>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
