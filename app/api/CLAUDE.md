# Contexto — API Routes

## Rutas disponibles

| Ruta | Método | Descripción |
|------|--------|-------------|
| /api/generar-consignas | POST | Groq genera consignas con IA |
| /api/aprobar-consigna | POST/PATCH/DELETE | CRUD consignas |
| /api/asignar-consigna-diaria | POST | Cron job diario |

## Estados de consigna

- borrador: true → nunca se auto-asigna
- borrador: false, fecha: null → banco (disponible para cron)
- borrador: false, fecha: DATE → programada

## Validación obligatoria en rutas admin

const token = req.headers.get("Authorization")?.replace("Bearer ", "")
const { data: { user } } = await supabase.auth.getUser(token)
if (!user || user.email !== "valenmonti01@gmail.com") {
  return new Response("Unauthorized", { status: 401 })
}
