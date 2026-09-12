# Despliegue de SendDesk con Supabase y Vercel

Esta guía crea una base PostgreSQL vacía en Supabase, carga únicamente los datos
ficticios incluidos en el proyecto y despliega la aplicación completa en Vercel.

## 1. Crear el proyecto en Supabase

1. Entra a [Supabase](https://supabase.com/dashboard) y selecciona
   **New project**.
2. Elige una organización, usa un nombre como `senddesk-demo` y genera una
   contraseña fuerte para la base de datos.
3. Selecciona una región cercana a la región de ejecución de Vercel y crea el
   proyecto.
4. Cuando termine el aprovisionamiento, abre el botón **Connect** del proyecto.

No hace falta crear tablas desde el editor SQL ni activar Supabase Auth. Prisma
creará el esquema y SendDesk seguirá usando su autenticación básica propia.

## 2. Obtener las dos conexiones

En **Connect**, copia las cadenas completas que Supabase muestra para los modos
de conexión siguientes:

- **Transaction pooler**, puerto `6543`: será `DATABASE_URL` y la usará la
  aplicación en Vercel.
- **Session pooler**, puerto `5432`: será `DIRECT_URL` y la usará Prisma para
  aplicar migraciones.

Si la cadena de Transaction pooler no incluye parámetros, agrega:

```text
?pgbouncer=true&connection_limit=1
```

Si ya contiene `?`, agrega esos parámetros usando `&`. Usa las cadenas
exactas mostradas por Supabase; no copies literalmente los valores de
`.env.example`. Si escribes la contraseña manualmente, sus caracteres
especiales deben estar codificados para una URL.

## 3. Preparar la base desde tu computadora

En la raíz del repositorio:

```powershell
Copy-Item .env.example .env
```

Edita `.env` sin compartir ni subir el archivo:

```dotenv
DATABASE_URL="cadena Transaction pooler del puerto 6543"
DIRECT_URL="cadena Session pooler del puerto 5432"
AUTH_SECRET="secreto aleatorio largo"
```

Puedes generar `AUTH_SECRET` en PowerShell:

```powershell
[Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
```

Después instala, migra y carga los datos ficticios:

```powershell
npm install
npm run db:setup
npm run dev
```

Abre `http://localhost:3000` y comprueba el acceso con las credenciales demo
del README. El seed es idempotente: puede ejecutarse nuevamente sin duplicar los
usuarios ni los clientes incluidos.

## 4. Subir el repositorio

El flujo Git del proyecto usa:

- `main` para producción.
- `develop` para integración.
- `feature/*` para cada cambio.

Integra esta rama en `develop`, valida el resultado y después integra
`develop` en `main`. Publica `main` en GitHub, GitLab o Bitbucket.

## 5. Crear el proyecto en Vercel

1. Entra a [Vercel](https://vercel.com/new).
2. Selecciona **Add New > Project** e importa el repositorio.
3. Confirma **Next.js** como Framework Preset.
4. Deja la raíz del repositorio como Root Directory.
5. Configura `main` como Production Branch.
6. En **Environment Variables**, agrega:

   - `DATABASE_URL`: Transaction pooler, puerto `6543`.
   - `DIRECT_URL`: Session pooler, puerto `5432`.
   - `AUTH_SECRET`: el mismo tipo de secreto aleatorio, sin comillas externas.

7. Asigna inicialmente las variables a **Production** y selecciona **Deploy**.

El archivo `vercel.json` indica a Vercel que ejecute `npm run vercel-build`.
Ese comando genera Prisma Client, aplica las migraciones pendientes con
`prisma migrate deploy` y compila Next.js.

## 6. Datos iniciales y comprobación

Si ejecutaste `npm run db:setup` contra esa misma base, los usuarios demo ya
existen. Si no lo hiciste, configura las variables de Supabase localmente y
ejecuta una sola vez:

```powershell
npm run db:seed
```

En la URL entregada por Vercel comprueba:

1. Inicio y cierre de sesión.
2. Alta, edición y búsqueda de clientes.
3. Creación de una hoja con uno a seis paquetes.
4. Descarga del PDF.

## Despliegues Preview

No conectes una rama `feature/*` a la base de producción si esa rama contiene
cambios de esquema. Para pruebas académicas simples puedes reutilizar la base,
pero la opción segura es crear otro proyecto de Supabase y asignar sus tres
variables al entorno **Preview** de Vercel.

## Seguridad mínima

- Nunca subas `.env` al repositorio.
- No uses prefijos `NEXT_PUBLIC_` para estas variables.
- No expongas la contraseña de Supabase ni sus cadenas de conexión.
- Cambia las contraseñas demo y la autenticación básica antes de un uso real.
