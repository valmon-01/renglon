import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  try {
    const hoy = new Date().toISOString().split('T')[0]

    // 1. Buscar si ya hay consigna con fecha = hoy, aprobada = true y no es borrador
    const { data: existente } = await supabase
      .from('consignas')
      .select('*')
      .eq('fecha', hoy)
      .eq('aprobada', true)
      .eq('borrador', false)
      .maybeSingle()

    if (existente) {
      return NextResponse.json({ consigna: existente })
    }

    // 2. Buscar del banco: fecha IS NULL, aprobada = true, no es borrador, la más antigua
    const { data: delBanco } = await supabase
      .from('consignas')
      .select('*')
      .is('fecha', null)
      .eq('aprobada', true)
      .eq('borrador', false)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (!delBanco) {
      return NextResponse.json({ consigna: null })
    }

    // 3. Asignarle fecha de hoy y marcar como asignada automáticamente
    const { data: actualizada, error } = await supabase
      .from('consignas')
      .update({ fecha: hoy, asignada_automaticamente: true })
      .eq('id', delBanco.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ consigna: actualizada })
  } catch (error) {
    console.error('Error asignando consigna diaria:', error)
    return NextResponse.json({ error: 'Error al asignar consigna' }, { status: 500 })
  }
}
