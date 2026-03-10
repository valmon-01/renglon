import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import Groq from 'groq-sdk'
import DailyConsignaEmail from '@/emails/DailyConsignaEmail'

export async function POST(req: NextRequest) {
  // Validar CRON_SECRET
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  try {
    const hoy = new Date().toISOString().split('T')[0]

    // 1. Obtener consigna de hoy
    const { data: consigna, error: consignaError } = await supabaseAdmin
      .from('consignas')
      .select('*')
      .eq('fecha', hoy)
      .eq('aprobada', true)
      .eq('borrador', false)
      .maybeSingle()

    if (consignaError || !consigna) {
      return NextResponse.json({ error: 'No hay consigna para hoy' }, { status: 404 })
    }

    // 2. Generar texto motivacional si no tiene
    let textoMotivacional = consigna.texto_motivacional

    if (!textoMotivacional) {
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'user',
            content: `Sos el escritor detrás de renglón, una app de escritura creativa. La consigna de hoy es: "${consigna.texto}". Escribí un texto motivacional de 3-4 oraciones que invite a reflexionar sobre esta consigna. No uses frases cliché ni de coaching. Escribí como un escritor que habla con otro escritor. En español rioplatense. Solo respondé con el texto, sin comillas ni explicaciones.`,
          },
        ],
        temperature: 0.8,
        max_tokens: 200,
      })

      textoMotivacional = completion.choices[0]?.message?.content?.trim() ?? ''

      // Guardar en DB
      await supabaseAdmin
        .from('consignas')
        .update({ texto_motivacional: textoMotivacional })
        .eq('id', consigna.id)
    }

    // 3. Obtener usuarios suscritos (profiles + auth.users para emails)
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, email_token')
      .eq('email_suscrito', true)

    if (profilesError || !profiles?.length) {
      return NextResponse.json({ ok: true, enviados: 0, mensaje: 'No hay usuarios suscritos' })
    }

    // 4. Obtener emails de auth.users
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
    const emailMap = new Map(usersData?.users?.map((u) => [u.id, u.email]) ?? [])

    // 5. Formatear fecha
    const [year, month, day] = hoy.split('-')
    const fechaFormateada = `${day}/${month}/${String(year).slice(2)}`

    const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://renglon.vercel.app'

    // 6. Enviar emails en lotes de 10
    const LOTE = 10
    let enviados = 0

    for (let i = 0; i < profiles.length; i += LOTE) {
      const lote = profiles.slice(i, i + LOTE)

      await Promise.allSettled(
        lote.map(async (profile) => {
          const email = emailMap.get(profile.id)
          if (!email) return

          const unsubscribeUrl = `${BASE_URL}/api/desuscribir?token=${profile.email_token}`

          const { error } = await resend.emails.send({
            from: 'renglón <onboarding@resend.dev>',
            to: email,
            subject: `renglón — ${consigna.texto.length > 60 ? consigna.texto.slice(0, 57) + '…' : consigna.texto}`,
            react: DailyConsignaEmail({
              consigna: consigna.texto,
              textoMotivacional: textoMotivacional ?? '',
              fecha: fechaFormateada,
              unsubscribeUrl,
            }),
          })

          if (!error) enviados++
        })
      )
    }

    return NextResponse.json({ ok: true, enviados, total: profiles.length })
  } catch (error) {
    console.error('Error en enviar-consigna-diaria:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
