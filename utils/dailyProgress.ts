import { supabase } from "@/lib/supabase";

export async function calcularYActualizarRacha(userId: string): Promise<void> {
  const hoy = new Date().toISOString().slice(0, 10);
  const ayer = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  const { data: perfil } = await supabase
    .from("profiles")
    .select("ultima_escritura, racha_actual")
    .eq("id", userId)
    .single();

  const ultimaEscritura = perfil?.ultima_escritura ?? null;
  const rachaActual = perfil?.racha_actual ?? 0;

  // Ya escribió hoy, no hacer nada
  if (ultimaEscritura === hoy) return;

  const nuevaRacha = ultimaEscritura === ayer ? rachaActual + 1 : 1;

  await supabase
    .from("profiles")
    .update({ racha_actual: nuevaRacha, ultima_escritura: hoy })
    .eq("id", userId);
}
