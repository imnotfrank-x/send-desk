# SendDesk

MVP académico para digitalizar la operación interna de una paquetería. Permite administrar clientes y capturar hojas digitales de envío de hasta seis paquetes, conservando la organización del formato físico.

## Stack

- Next.js 16 con App Router y TypeScript
- Tailwind CSS 4
- Prisma ORM 6
- PostgreSQL en Supabase
- PDF-lib para exportación
- Vitest para pruebas

## Puesta en marcha

Requiere Node.js 20.9 o superior.

```powershell
Copy-Item .env.example .env
# Sustituye en .env las conexiones de tu proyecto Supabase.
npm install
npm run db:setup
npm run dev
```

Abre `http://localhost:3000`.

La guía completa para crear la base, configurar variables y publicar el proyecto
está en [Despliegue con Vercel y Supabase](docs/despliegue-vercel-supabase.md).

### Credenciales ficticias

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | `admin@senddesk.demo` | `Demo1234!` |
| Operador | `operador@senddesk.demo` | `Demo1234!` |

El Administrador puede eliminar clientes. El Operador puede consultarlos, crearlos y editarlos. Ningún dato incluido corresponde a personas o empresas reales.

### Inicio de sesión y registro

En `/login` puedes iniciar sesión con tu correo y contraseña o seleccionar
**Registrarse** para abrir `/registro`. Las cuentas nuevas solicitan nombre,
correo, contraseña (al menos 8 caracteres) y confirmación de contraseña.

El registro normaliza el correo, evita cuentas duplicadas, guarda únicamente el
hash bcrypt de la contraseña y asigna siempre el rol `OPERADOR` desde el servidor.
Al crear la cuenta se inicia sesión y se abre el dashboard. Los administradores
existentes conservan sus permisos; el formulario no permite elegir ese rol.
La contraseña admite como máximo 72 bytes, límite de bcrypt.

Se utiliza la tabla `User` existente: este cambio no requiere migraciones ni
Supabase Auth. El registro está abierto para la demostración académica y las
cuentas comparten el directorio y las hojas de la misma operación.

## Comandos

```bash
npm run dev          # servidor de desarrollo
npm run build        # compilación de producción
npm run lint         # análisis estático
npm test             # pruebas automatizadas
npm run test:smoke   # prueba HTTP con el servidor de desarrollo activo
npm run db:setup     # genera cliente, migra PostgreSQL y carga datos demo
npm run db:migrate   # aplica migraciones pendientes en producción
npm run db:migrate:dev # crea migraciones durante el desarrollo
npm run db:seed      # repone los datos ficticios
npm run db:studio    # inspector local de Prisma
npm run pdf:sample   # regenera el PDF ficticio de muestra
```

## Alcance por etapas

### Etapa 1 — completada

- Proyecto base y PostgreSQL en Supabase con migraciones reproducibles.
- Inicio y cierre de sesión con cookie HTTP-only firmada.
- Roles `ADMIN` y `OPERADOR`.
- Directorio de clientes con alta, consulta, edición, eliminación por Administrador y búsqueda.
- Endpoint y componente de autocompletado por nombre, código o teléfono.
- Validaciones del servidor y estados vacíos/errores básicos.

### Etapa 2 — completada

- Hojas digitales con una a seis posiciones de paquete.
- Remitente, destinatario, teléfonos, direcciones, peso, número y descripción por paquete.
- Autocompletado de ambas partes desde el directorio, conservando una copia histórica de los datos.
- Listado, búsqueda por folio o paquete y detalle con formato inspirado en la hoja física.
- Guardado transaccional de hoja y paquetes.

### Etapa 3 — completada

- Descarga PDF A4 horizontal por hoja, con seis posiciones y espacios libres visibles.
- Dashboard con hojas, paquetes, peso, clientes, actividad semanal y capturas recientes.
- Interfaz responsiva, estados vacíos, foco visible, favicon propio y navegación compacta.
- PDF ficticio de muestra en `output/pdf/senddesk-hoja-demo.pdf`.
- Herramientas WebMCP progresivas para buscar clientes e iniciar una captura en navegadores compatibles.

## Decisiones del MVP

La aplicación usa Server Components y Server Actions de Next.js, una única base
PostgreSQL administrada por Supabase y módulos pequeños por dominio. Prisma accede
a ella exclusivamente desde el servidor; el navegador no recibe credenciales de
base de datos. La autenticación es local y deliberadamente básica para
demostración; antes de uso productivo debe sustituirse por un proveedor de
identidad y secretos administrados.

Los PDFs se generan bajo demanda y no se almacenan en la base. Los datos históricos del remitente y destinatario se copian a cada paquete para preservar la hoja tal como fue capturada.

## Flujo Git

- `main`: base estable.
- `develop`: integración del MVP.
- `feature/stage-1-foundation`: configuración, acceso y clientes.
- `feature/stage-2-shipments`: hojas y paquetes.
- `feature/stage-3-pdf-dashboard`: PDF, resumen y acabado.

