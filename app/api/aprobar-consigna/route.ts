import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const supabase = supabaseAdmin

export async function POST(request: NextRequest) {
  try {
    const { id, texto, categoria, fecha, estado } = await request.json()

    // UPDATE: modificar una consigna existente
    if (id) {
      // Mover al banco: id + estado = 'banco'
      if (estado === 'banco') {
        const { data, error } = await supabase
          .from('consignas')
          .update({ estado: 'banco' })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ consigna: data })
      }

      // Asignar fecha: id + fecha → programada
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
        .update({ fecha, estado: 'programada' })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return NextResponse.json({ consigna: data })
    }

    // INSERT: nueva consigna
    const { data, error } = await supabase
      .from('consignas')
      .insert({ texto, categoria, fecha: fecha ?? null, estado: estado ?? 'borrador' })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ consigna: data })
  } catch (error) {
    console.error('Error aprobando consigna:', error)
    return NextResponse.json({ error: 'Error al aprobar consigna' }, { status: 500 })
  }
}
