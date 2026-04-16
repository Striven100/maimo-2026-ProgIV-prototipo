"use client";

import { useState } from "react";
import Link from "next/link";
import { registerUser } from "@/actions/auth";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/Card";

export default function RegisterPage() {
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(formData: FormData) {
    setErrors({});
    const result = await registerUser(formData);
    if (result?.errors) {
      setErrors(result.errors);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">ProgIV-prototipo</h1>
          <p className="text-gray-600 mt-1">Crear cuenta</p>
        </CardHeader>
        <form action={handleSubmit}>
          <CardContent className="space-y-4">
            {errors.form && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {errors.form[0]}
              </div>
            )}
            <Input
              id="username"
              name="username"
              type="text"
              label="Username"
              placeholder="usuario123"
              required
              autoComplete="username"
              error={errors.username?.[0]}
            />
            <Input
              id="email"
              name="email"
              type="email"
              label="Email"
              placeholder="tu@email.com"
              required
              autoComplete="email"
              error={errors.email?.[0]}
            />
            <Input
              id="password"
              name="password"
              type="password"
              label="Contraseña"
              placeholder="Mínimo 8 caracteres"
              required
              autoComplete="new-password"
              error={errors.password?.[0]}
            />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label="Confirmar contraseña"
              placeholder="Repite la contraseña"
              required
              autoComplete="new-password"
              error={errors.confirmPassword?.[0]}
            />
          </CardContent>
          <CardFooter className="flex-col gap-3">
            <Button type="submit" className="w-full">
              Crear cuenta
            </Button>
            <p className="text-sm text-gray-600 text-center">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Inicia sesión
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
