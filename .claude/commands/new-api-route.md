# new-api-route
Rutas admin requieren validación JWT:
const token = req.headers.get("Authorization")?.replace("Bearer ", "")
const { data: { user } } = await supabase.auth.getUser(token)
if (!user || user.email !== "valenmonti01@gmail.com") return 401
Cron jobs validan CRON_SECRET. Siempre usar createServerSupabaseClient(). Siempre try/catch.
