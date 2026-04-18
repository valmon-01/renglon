import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { getCurrentUser } from "@/lib/server/auth"

/**
 * POST /api/registrar-escritura
 *
 * Se llama después de guardar un texto desde el editor. Calcula palabras y
 * racha en el servidor (no confiando en lo que manda el cliente) y actualiza
 * `profiles.palabras_totales`, `profiles.racha_actual` y `profiles.ultima_escritura`.
 *
 * Esto evita que un usuario manipule sus propias estadísticas modificando la
 * request en DevTools (antes: update directo desde el cliente vía RLS).
 */

const BodySchema = z.object({
  textoId: z.string().uuid(),
  // Si es true, NO actualiza la racha (hoja libre / consigna anterior)
  retroactivo: z.boolean().optional().default(false),
})

function contarPalabras(texto: string): number {
  const t = texto.trim()
  if (t === "") return 0
  return t.split(/\s+/).length
}

function hoyARG(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
}

function ayerARG(): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - 1)
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d)
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 })
  }
  const parsed = BodySchema.safeParse(raw)
  if (!parsed.success) {
    return NextResponse.json({ error: "Parámetros inválidos" }, { status: 400 })
  }
  const { textoId, retroactivo } = parsed.data

  try {
    // 1. Cargar texto y verificar ownership.
    const { data: texto, error: errTexto } = await supabaseAdmin
      .from("textos")
      .select("id, user_id, contenido, borrador")
      .eq("id", textoId)
      .single()

    if (errTexto || !texto) {
      return NextResponse.json({ error: "Texto no encontrado" }, { status: 404 })
    }
    if (texto.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }
    if (texto.borrador) {
      // No contabilizamos borradores — palabras/racha solo para textos finalizados.
      return NextResponse.json({ ok: true, skipped: "borrador" })
    }

    const palabras = contarPalabras(texto.contenido ?? "")

    // 2. Cargar perfil actual.
    const { data: perfil, error: errPerfil } = await supabaseAdmin
      .from("profiles")
      .select("palabras_totales, racha_actual, ultima_escritura")
      .eq("id", user.id)
      .single()

    if (errPerfil || !perfil) {
      return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 })
    }

    const hoy = hoyARG()
    const ayer = ayerARG()

    // 3. Calcular nueva racha (server-trusted).
    let nuevaRacha = perfil.racha_actual ?? 0
    let nuevaUltima = perfil.ultima_escritura as string | null

    if (!retroactivo) {
      if (perfil.ultima_escritura === hoy) {
        // Ya escribió hoy: no double-count.
      } else if (perfil.ultima_escritura === ayer) {
        nuevaRacha = (perfil.racha_actual ?? 0) + 1
        nuevaUltima = hoy
      } else {
        nuevaRacha = 1
        nuevaUltima = hoy
      }
    }

    // 4. Actualizar perfil.
    const nuevasPalabras = (perfil.palabras_totales ?? 0) + palabras

    const { error: errUpdate } = await supabaseAdmin
      .from("profiles")
      .update({
        palabras_totales: nuevasPalabras,
        racha_actual: nuevaRacha,
        ultima_escritura: nuevaUltima,
      })
      .eq("id", user.id)

    if (errUpdate) throw errUpdate

    return NextResponse.json({
      ok: true,
      palabras,
      palabras_totales: nuevasPalabras,
      racha_actual: nuevaRacha,
      ultima_escritura: nuevaUltima,
    })
  } catch (error) {
    console.error(
      "Error registrando escritura:",
      error instanceof Error ? error.message : String(error),
    )
    return NextResponse.json({ error: "Error al registrar" }, { status: 500 })
  }
}
