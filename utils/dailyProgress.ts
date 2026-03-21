import { supabase } from "@/lib/supabase";
import { getFechaLocal } from "@/utils/fecha";

export async function calcularYActualizarRacha(userId: string): Promise<void> {
  const hoy = getFechaLocal();
  const aDate = new Date();
  aDate.setDate(aDate.getDate() - 1);
  const ayer = new Date(aDate.getTime() - aDate.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

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
