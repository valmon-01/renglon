import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = 'valenmonti01@gmail.com'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user || user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { id, texto, categoria, fecha, borrador } = await request.json()

    // UPDATE: modificar una consigna existente
    if (id) {
      // Mover de borrador al banco: id + borrador:false
      if (borrador === false) {
        const { data, error } = await supabase
          .from('consignas')
          .update({ borrador: false })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ consigna: data })
      }

      // Mover del banco a borradores: id + borrador:true
      if (borrador === true) {
        const { data, error } = await supabase
          .from('consignas')
          .update({ borrador: true, fecha: null })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ consigna: data })
      }

      // Asignar fecha a una consigna del banco: id + fecha
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

    // INSERT: nueva consigna (borrador por defecto)
    const { data, error } = await supabase
      .from('consignas')
      .insert({ texto, categoria, fecha: fecha ?? null, aprobada: true, borrador: borrador ?? true })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ consigna: data })
  } catch (error) {
    console.error('Error aprobando consigna:', error)
    return NextResponse.json({ error: 'Error al aprobar consigna' }, { status: 500 })
  }
}
