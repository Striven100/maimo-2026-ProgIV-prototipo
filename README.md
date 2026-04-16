# ProgIV-prototipo

Organizador académico simple y gamificado.

## Stack

- **Frontend**: Next.js 14
- **Estilos**: Tailwind CSS
- **Base de datos**: MongoDB Atlas
- **Auth**: JWT simple

## Instalación

```bash
npm install
npm run dev
```

## Variables de Entorno

Crear `.env.local`:
```
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/progiv_prototipo
JWT_SECRET=tu-secret-de-al-menos-32-caracteres
```

## Rutas

- `/login` - Iniciar sesión
- `/register` - Registrarse
- `/materias` - Gestionar materias
- `/tareas` - Ver y crear tareas
- `/notas` - Ver y crear notas
- `/amigos` - Buscar y agregar amigos

## API

- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET/POST /api/materias` - Materias
- `GET/POST /api/tareas` - Tareas
- `GET/POST /api/notas` - Notas
- `GET /api/amigos` - Amigos
- `POST /api/amigos/add` - Agregar amigo
- `GET /api/user` - Usuario actual

## Colecciones MongoDB

- `users` - Usuarios
- `materias` - Materias
- `tareas` - Tareas
- `notas` - Notas
- `amigos` - Relaciones de amistad
