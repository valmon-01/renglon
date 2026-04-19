import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { requireAdmin } from "@/lib/server/auth"

export const dynamic = "force-dynamic"

/**
 * GET /api/admin/consignas
 * Devuelve todas las consignas agrupadas por estado.
 * Usa service role (bypassa RLS) después de validar que el caller es admin.
 */
export async function GET() {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const hoy = new Date().toISOString().slice(0, 10)

  try {
    const [programadas, banco, borradores] = await Promise.all([
      supabaseAdmin
        .from("consignas")
        .select("*")
        .eq("estado", "programada")
        .gte("fecha", hoy)
        .order("fecha", { ascending: true }),
      supabaseAdmin
        .from("consignas")
        .select("*")
        .eq("estado", "banco")
        .order("created_at", { ascending: true }),
      supabaseAdmin
        .from("consignas")
        .select("*")
        .eq("estado", "borrador")
        .order("created_at", { ascending: false }),
    ])

    return NextResponse.json({
      programadas: programadas.data ?? [],
      banco: banco.data ?? [],
      borradores: borradores.data ?? [],
    })
  } catch (error) {
    console.error(
      "Error cargando consignas admin:",
      error instanceof Error ? error.message : String(error),
    )
    return NextResponse.json({ error: "Error al cargar consignas" }, { status: 500 })
  }
}
