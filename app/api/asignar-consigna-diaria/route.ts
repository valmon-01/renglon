import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

const supabase = supabaseAdmin

export async function GET() {
  try {
    const hoy = new Date().toISOString().split('T')[0]

    // 1. Verificar si ya hay consigna asignada para hoy
    const { data: existente } = await supabase
      .from('consignas')
      .select('*')
      .eq('fecha', hoy)
      .eq('estado', 'publicada')
      .maybeSingle()

    if (existente) {
      console.log('Consigna ya asignada para hoy:', existente.id)
      return NextResponse.json({ consigna: existente })
    }

    // 2. Buscar del banco
    const { data: banco } = await supabase
      .from('consignas')
      .select('*')
      .eq('estado', 'banco')

    if (!banco || banco.length === 0) {
      console.log('No hay consignas en el banco')
      return NextResponse.json(
        { error: 'No hay consignas disponibles en el banco', consigna: null },
        { status: 404 }
      )
    }

    // Elegir una aleatoriamente
    const delBanco = banco[Math.floor(Math.random() * banco.length)]

    // 3. Asignarle fecha de hoy y marcar como publicada
    const { data: actualizada, error } = await supabase
      .from('consignas')
      .update({ fecha: hoy, estado: 'publicada' })
      .eq('id', delBanco.id)
      .select()
      .single()

    if (error) throw error

    console.log('Consigna asignada:', actualizada.id)
    return NextResponse.json({ consigna: actualizada })
  } catch (error) {
    console.error('Error asignando consigna diaria:', error)
    return NextResponse.json({ error: 'Error al asignar consigna' }, { status: 500 })
  }
}
