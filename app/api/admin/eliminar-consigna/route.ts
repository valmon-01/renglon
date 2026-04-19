import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { requireAdmin } from "@/lib/server/auth"

export const dynamic = "force-dynamic"

const schema = z.object({
  id: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin.ok) return admin.response

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from("consignas")
    .delete()
    .eq("id", parsed.data.id)

  if (error) {
    console.error("Error eliminando consigna:", error.message)
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
