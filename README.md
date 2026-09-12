# SendDesk

MVP académico para digitalizar la operación interna de una paquetería. Permite administrar clientes y capturar hojas digitales de envío de hasta seis paquetes, conservando la organización del formato físico.

## Stack

- Next.js 16 con App Router y TypeScript
- Tailwind CSS 4
- Prisma ORM 6
- SQLite
- PDF-lib para exportación
- Vitest para pruebas

## Puesta en marcha

Requiere Node.js 20.9 o superior.

```bash
npm install
copy .env.example .env
npm run db:setup
npm run dev
```

Abre `http://localhost:3000`.

### Credenciales ficticias

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | `admin@senddesk.demo` | `Demo1234!` |
| Operador | `operador@senddesk.demo` | `Demo1234!` |

El Administrador puede eliminar clientes. El Operador puede consultarlos, crearlos y editarlos. Ningún dato incluido corresponde a personas o empresas reales.

## Comandos

```bash
npm run dev          # servidor de desarrollo
npm run build        # compilación de producción
npm run lint         # análisis estático
npm test             # pruebas automatizadas
npm run db:setup     # genera cliente, aplica migraciones y carga demo
npm run db:migrate   # aplica migraciones pendientes
npm run db:seed      # repone los datos ficticios
npm run db:studio    # inspector local de Prisma
```

## Alcance por etapas

### Etapa 1 — completada

- Proyecto base y SQLite con migraciones reproducibles.
- Inicio y cierre de sesión con cookie HTTP-only firmada.
- Roles `ADMIN` y `OPERADOR`.
- Directorio de clientes con alta, consulta, edición, eliminación por Administrador y búsqueda.
- Endpoint y componente de autocompletado por nombre, código o teléfono.
- Validaciones del servidor y estados vacíos/errores básicos.

### Etapa 2 — pendiente

- Hojas digitales con máximo seis paquetes.
- Remitente, destinatario, teléfonos, direcciones, peso, número y descripción por paquete.
- Autocompletado desde el directorio.

### Etapa 3 — pendiente

- Exportación PDF.
- Resumen administrativo.
- Ajustes visuales y responsivos finales.

## Decisiones del MVP

La aplicación usa Server Components y Server Actions de Next.js, una única base SQLite y módulos pequeños por dominio. La autenticación es local y deliberadamente básica para demostración; antes de uso productivo debe sustituirse por un proveedor de identidad y secretos administrados.

## Flujo Git

- `main`: base estable.
- `develop`: integración del MVP.
- `feature/stage-1-foundation`: configuración, acceso y clientes.
- `feature/stage-2-shipments`: hojas y paquetes.
- `feature/stage-3-pdf-dashboard`: PDF, resumen y acabado.

