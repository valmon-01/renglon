import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { requireAdmin } from "@/lib/server/auth"

export const dynamic = "force-dynamic"

const schema = z.object({
  id: z.string().uuid(),
  destacada: z.boolean(),
})

export async function POST(request: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

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

  const { data, error } = await supabaseAdmin
    .from("consignas")
    .update({ destacada: parsed.data.destacada })
    .eq("id", parsed.data.id)
    .select()
    .single()

  if (error) {
    console.error("Error destacando consigna:", error.message)
    return NextResponse.json({ error: "Error al destacar" }, { status: 500 })
  }

  return NextResponse.json({ consigna: data })
}
