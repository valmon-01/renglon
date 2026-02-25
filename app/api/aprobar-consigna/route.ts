import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { texto, categoria, fecha } = await request.json()

    const { data, error } = await supabase
      .from('consignas')
      .insert({ texto, categoria, fecha, aprobada: true })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ consigna: data })
  } catch (error) {
    console.error('Error aprobando consigna:', error)
    return NextResponse.json({ error: 'Error al aprobar consigna' }, { status: 500 })
  }
}
