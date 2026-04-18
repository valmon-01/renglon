# Contexto — API Routes

## Rutas disponibles

| Ruta | Método | Auth | Descripción |
|------|--------|------|-------------|
| /api/generar-consignas | POST | admin | Groq genera consignas con IA |
| /api/aprobar-consigna | POST | admin | CRUD consignas (insert + updates) |
| /api/asignar-consigna-diaria | GET | público (lectura) / cron (escritura) | Devuelve consigna del día; cron la asigna |
| /api/registrar-escritura | POST | usuario autenticado | Recalcula palabras/racha server-side al guardar un texto |

## Estados de consigna

- estado = "borrador" → nunca se auto-asigna
- estado = "banco", fecha = null → disponible para el cron
- estado = "programada", fecha = YYYY-MM-DD → esperando su día
- estado = "publicada", fecha = YYYY-MM-DD → visible en la app

## Helpers de auth (lib/server/auth.ts)

- `requireAdmin()` → null o User. Valida email contra env `ADMIN_EMAIL`.
- `getCurrentUser()` → null o User. Usa `supabase.auth.getUser()` (valida contra servidor, no confía sólo en cookie).
- `isCronRequest(req)` → bool. Compara `Authorization: Bearer $CRON_SECRET`.

## Pattern obligatorio en rutas admin

```ts
import { requireAdmin } from "@/lib/server/auth"

const admin = await requireAdmin()
if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
```

## Pattern para validación de input

Todas las rutas usan `zod` para parsear el body. Nunca confiar en tipos del JSON.

## Vars de entorno requeridas

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (solo server)
- `GROQ_API_KEY`
- `ADMIN_EMAIL` — email autorizado como admin
- `CRON_SECRET` — secret compartido con Vercel Cron
