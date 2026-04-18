import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { getCurrentUser, isCronRequest } from "@/lib/server/auth"

/**
 * Fecha de hoy en America/Argentina/Buenos_Aires (UTC-3 sin DST).
 * Usamos el TZ para que el "día" corresponda a la experiencia del usuario
 * y no al servidor en UTC.
 */
function hoyARG(): string {
  const now = new Date()
  // en-CA => YYYY-MM-DD
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now)
}

/**
 * GET /api/asignar-consigna-diaria
 *
 * Modo usuario (auth requerida): devuelve la consigna publicada de hoy.
 *   NO hace mutaciones para evitar race conditions entre clientes.
 *
 * Modo cron (Authorization: Bearer CRON_SECRET):
 *   - Si ya hay consigna publicada para hoy → noop
 *   - Si hay una programada para hoy → la marca como publicada
 *   - Si no, elige una del banco al azar y la publica para hoy
 */
export async function GET(request: NextRequest) {
  const hoy = hoyARG()

  // ── Modo cron ────────────────────────────────────────────────────────
  if (isCronRequest(request)) {
    try {
      const { data: existente } = await supabaseAdmin
        .from("consignas")
        .select("*")
        .eq("fecha", hoy)
        .eq("estado", "publicada")
        .maybeSingle()

      if (existente) {
        return NextResponse.json({ consigna: existente, source: "ya-publicada" })
      }

      const { data: programada } = await supabaseAdmin
        .from("consignas")
        .select("*")
        .eq("fecha", hoy)
        .eq("estado", "programada")
        .maybeSingle()

      if (programada) {
        const { data: publicada, error: errPub } = await supabaseAdmin
          .from("consignas")
          .update({ estado: "publicada" })
          .eq("id", programada.id)
          .select()
          .single()
        if (errPub) throw errPub
        return NextResponse.json({ consigna: publicada, source: "programada" })
      }

      const { data: banco } = await supabaseAdmin
        .from("consignas")
        .select("*")
        .eq("estado", "banco")

      if (!banco || banco.length === 0) {
        return NextResponse.json(
          { error: "No hay consignas disponibles en el banco", consigna: null },
          { status: 404 },
        )
      }

      const delBanco = banco[Math.floor(Math.random() * banco.length)]
      const { data: actualizada, error } = await supabaseAdmin
        .from("consignas")
        .update({ fecha: hoy, estado: "publicada" })
        .eq("id", delBanco.id)
        .select()
        .single()
      if (error) throw error

      return NextResponse.json({ consigna: actualizada, source: "banco" })
    } catch (error) {
      console.error(
        "Error asignando consigna (cron):",
        error instanceof Error ? error.message : String(error),
      )
      return NextResponse.json({ error: "Error al asignar consigna" }, { status: 500 })
    }
  }

  // ── Modo usuario ─────────────────────────────────────────────────────
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { data } = await supabaseAdmin
      .from("consignas")
      .select("id, texto, categoria, fecha, estado")
      .eq("fecha", hoy)
      .eq("estado", "publicada")
      .maybeSingle()

    return NextResponse.json({ consigna: data ?? null })
  } catch (error) {
    console.error(
      "Error leyendo consigna diaria:",
      error instanceof Error ? error.message : String(error),
    )
    return NextResponse.json({ error: "Error al leer consigna" }, { status: 500 })
  }
}
