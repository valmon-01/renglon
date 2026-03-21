# fix-supabase
NUNCA usar joins. SIEMPRE dos queries separadas:
1. Fetch textos
2. Fetch profiles con .in("id", userIds)
3. Merge con Map en cliente
