import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { requireAdmin } from "@/lib/server/auth"

// Input schema estricto: evitamos que un atacante pase tipos/valores
// arbitrarios (ej. `texto` como objeto, `estado` con valores fuera del enum).
const UUID = z.string().uuid()
const FECHA = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida")
  .nullable()
const ESTADO = z.enum(["borrador", "banco", "programada", "publicada"])

const BodySchema = z.union([
  // UPDATE: mover al banco
  z.object({
    id: UUID,
    estado: z.literal("banco"),
  }),
  // UPDATE: asignar fecha (→ programada)
  z.object({
    id: UUID,
    fecha: FECHA,
  }),
  // INSERT: nueva consigna
  z.object({
    texto: z.string().trim().min(3).max(500),
    categoria: z.string().trim().min(1).max(50),
    fecha: FECHA.optional(),
    estado: ESTADO.optional(),
  }),
])

export async function POST(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) {
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
    // Exponemos una descripción del primer issue para diagnosticar sin
    // filtrar información sensible (es un endpoint admin, es aceptable).
    const first = parsed.error.issues[0]
    const path = first?.path?.join(".") || "body"
    const msg = first?.message || "inválido"
    return NextResponse.json(
      { error: `Parámetros inválidos: ${path} ${msg}` },
      { status: 400 },
    )
  }
  const body = parsed.data

  try {
    // UPDATE: mover al banco
    if ("id" in body && "estado" in body) {
      const { data, error } = await supabaseAdmin
        .from("consignas")
        .update({ estado: "banco" })
        .eq("id", body.id)
        .select()
        .single()
      if (error) throw error
      return NextResponse.json({ consigna: data })
    }

    // UPDATE: asignar fecha → programada (con verificación de colisión)
    if ("id" in body && "fecha" in body) {
      const { data: existente } = await supabaseAdmin
        .from("consignas")
        .select("id")
        .eq("fecha", body.fecha)
        .neq("id", body.id)
        .maybeSingle()

      if (existente) {
        return NextResponse.json(
          { error: "Esa fecha ya tiene una consigna asignada." },
          { status: 409 },
        )
      }

      const { data, error } = await supabaseAdmin
        .from("consignas")
        .update({ fecha: body.fecha, estado: "programada" })
        .eq("id", body.id)
        .select()
        .single()
      if (error) throw error
      return NextResponse.json({ consigna: data })
    }

    // INSERT: nueva consigna
    // Si viene con fecha, chequeamos colisión (UNIQUE INDEX parcial en fecha).
    if (body.fecha) {
      const { data: colision } = await supabaseAdmin
        .from("consignas")
        .select("id")
        .eq("fecha", body.fecha)
        .maybeSingle()
      if (colision) {
        return NextResponse.json(
          { error: "Esa fecha ya tiene una consigna asignada." },
          { status: 409 },
        )
      }
    }

    const { data, error } = await supabaseAdmin
      .from("consignas")
      .insert({
        texto: body.texto,
        categoria: body.categoria,
        fecha: body.fecha ?? null,
        estado: body.estado ?? "borrador",
      })
      .select()
      .single()
    if (error) throw error
    return NextResponse.json({ consigna: data })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error("Error aprobando consigna:", msg)
    // Devolvemos el mensaje real del DB (es endpoint admin, no hay leak sensible).
    return NextResponse.json({ error: `DB: ${msg}` }, { status: 500 })
  }
}
