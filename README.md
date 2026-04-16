# ProgIV-prototipo

Organizador académico colaborativo y gamificado.

## Stack Tecnológico

- **Framework**: Next.js 16 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Base de datos**: MongoDB Atlas
- **ORM**: Prisma
- **Autenticación**: NextAuth.js v5

## Requisitos Previos

- Node.js 18+
- Cuenta en MongoDB Atlas (o MongoDB local)

## Instalación

1. **Clonar el proyecto** (si aplica)
2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar base de datos MongoDB**:
   - El archivo `.env` ya viene configurado con el cluster de MongoDB Atlas
   - Si necesitas cambiarlo, actualiza `DATABASE_URL` con tu URI de MongoDB:
   ```env
   DATABASE_URL="mongodb+srv://usuario:password@cluster.mongodb.net/progiv_prototipo"
   ```

4. **Sincronizar schema con MongoDB**:
   ```bash
   npx prisma db push
   ```

5. **Iniciar el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

6. Abrir [http://localhost:3000](http://localhost:3000)

## Base de Datos

El proyecto usa **MongoDB Atlas** como base de datos en la nube.

### Colecciones creadas:
- `users` - Usuarios registrados
- `amigos` - Relaciones de amistad
- `solicitudes_amistad` - Solicitudes de amistad pendientes
- `materias` - Materias creadas
- `miembros_materia` - Miembros de cada materia
- `tareas` - Tareas por materia
- `notas` - Notas por materia
- `notificaciones` - Notificaciones internas

### Comandos de Prisma con MongoDB:
```bash
npx prisma db push      # Sincronizar schema con la DB
npx prisma studio       # Abrir GUI de Prisma
npx prisma generate     # Regenerar cliente
```

## Funcionalidades Implementadas

### Autenticación
- Registro de usuarios con username único y contraseña hasheada
- Login con email y contraseña
- Sesiones JWT protegidas

### Sistema de Amigos
- Buscar usuarios por username
- Enviar solicitudes de amistad
- Aceptar/rechazar solicitudes
- Lista de amigos

### Materias Compartidas
- Crear materias con nombre, descripción y color
- Compartir materias con amigos
- Ver miembros de cada materia
- Gestión de permisos (solo el creador puede editar/eliminar)

### Tareas
- CRUD de tareas por materia
- Prioridades (Baja, Media, Alta)
- Marcar como completada
- Fecha límite opcional
- Vista lista y calendario

### Notas
- Crear notas por materia
- Editor de texto
- Vinculadas a materias

### Notificaciones
- Notificaciones automáticas cuando un compañero agrega tarea
- Notificaciones de solicitudes de amistad
- Notificaciones de subida de nivel

### Gamificación
- Sistema de XP por acciones
- Niveles que suben automáticamente
- Barra de progreso en el header

## Estructura del Proyecto

```
src/
├── app/                    # Rutas de Next.js
│   ├── (auth)/            # Rutas de autenticación
│   ├── (dashboard)/       # Rutas protegidas
│   │   ├── materias/
│   │   ├── tareas/
│   │   ├── notas/
│   │   ├── amigos/
│   │   ├── notificaciones/
│   │   └── perfil/
│   └── api/               # Rutas API
├── actions/               # Server Actions
├── components/            # Componentes React
│   ├── ui/               # Componentes base
│   ├── layout/            # Sidebar, Header
│   └── gamificacion/      # XP, Niveles
├── lib/                   # Utilidades
│   ├── prisma.ts         # Cliente Prisma
│   ├── auth.ts           # Config NextAuth
│   └── utils.ts          # Funciones útiles
└── types/                # Tipos TypeScript
```

## Scripts Disponibles

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Build de producción
npm run lint     # Verificación de lint
npx prisma studio # Abrir GUI de Prisma
npx prisma db push # Sincronizar schema
```

## Cómo Probar Localmente

### 1. Autenticación
1. Regístrate con dos usuarios diferentes (en navegadores distintos o incognito)
2. Verifica que puedes hacer login/logout

### 2. Sistema de Amigos
1. Usuario A busca por username a Usuario B
2. A envía solicitud de amistad
3. B ve la solicitud en `/amigos/solicitudes`
4. B acepta la solicitud

### 3. Materias Compartidas
1. A crea una materia
2. A abre la materia y hace clic en "Compartir"
3. A selecciona a B como amigo para compartir
4. B ve la materia en su lista de materias

### 4. Tareas y Notificaciones
1. A crea una tarea en la materia compartida
2. B recibe una notificación automática
3. B completa la tarea y gana XP

### 5. Gamificación
1. Completa tareas para ganar XP
2. Observa cómo sube el nivel
3. Verifica la barra de XP en el header

## Licencia

MIT
