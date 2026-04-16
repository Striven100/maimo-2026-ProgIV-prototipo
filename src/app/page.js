export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-500">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-end gap-4 mb-16">
          <a
            href="/login"
            className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            Iniciar Sesión
          </a>
          <a
            href="/register"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Crear Cuenta
          </a>
        </div>

        <div className="text-center text-white mt-20">
          <h1 className="text-5xl font-bold mb-4">ProgIV</h1>
          <p className="text-2xl mb-8 opacity-90">Organizador Académico Colaborativo</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-gray-800">
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="font-bold text-lg mb-2">Materias</h3>
              <p className="text-sm text-gray-600">Organiza tus materias y compártelas con amigos</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="font-bold text-lg mb-2">Tareas</h3>
              <p className="text-sm text-gray-600">Gestiona tus tareas con prioridades y fechas</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="font-bold text-lg mb-2">Gamificación</h3>
              <p className="text-sm text-gray-600">Sube de nivel mientras estudias</p>
            </div>
          </div>

          <div className="mt-16 bg-white/20 rounded-xl p-8 backdrop-blur">
            <h2 className="text-2xl font-bold mb-4">¡Empieza hoy!</h2>
            <p className="mb-6 opacity-80">Únete a miles de estudiantes que ya organizan su vida académica</p>
            <a
              href="/register"
              className="inline-block bg-white text-purple-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
            >
              Crear Cuenta Gratis
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
