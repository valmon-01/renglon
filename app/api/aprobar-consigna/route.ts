import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { id, texto, categoria, fecha } = await request.json()

    // UPDATE: asignar fecha a una consigna existente del banco
    if (id) {
      // Verificar que la fecha no esté ocupada por otra consigna
      const { data: existente } = await supabase
        .from('consignas')
        .select('id')
        .eq('fecha', fecha)
        .neq('id', id)
        .maybeSingle()

      if (existente) {
        return NextResponse.json(
          { error: 'Esa fecha ya tiene una consigna asignada.' },
          { status: 409 }
        )
      }

      const { data, error } = await supabase
        .from('consignas')
        .update({ fecha })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({ consigna: data })
    }

    // INSERT: nueva consigna (fecha puede ser null → va al banco)
    const { data, error } = await supabase
      .from('consignas')
      .insert({ texto, categoria, fecha: fecha ?? null, aprobada: true })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ consigna: data })
  } catch (error) {
    console.error('Error aprobando consigna:', error)
    return NextResponse.json({ error: 'Error al aprobar consigna' }, { status: 500 })
  }
}
