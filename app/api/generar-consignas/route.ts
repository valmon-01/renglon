// v3 - groq
import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { createClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = 'valenmonti01@gmail.com'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

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

    const { categoria, contexto } = await request.json()

    const systemPrompt = `Sos un coordinador de taller literario con experiencia en escritura creativa rioplatense. Conocés la tradición de consignas de talleres argentinos: consignas que funcionan como disparadores concretos, no como temas abstractos. Una buena consigna es específica, sensorial y abre una puerta pequeña hacia algo más grande. No dice 'escribí sobre el amor' sino 'escribí sobre algo que dejaste sin decir'. Para textos cortos de práctica diaria (200-300 palabras), la consigna ideal rompe la parálisis del primer renglón en blanco y permite escribir desde la experiencia personal sin necesitar ser escritor.`

    const userPrompt = `Generá 5 consignas de escritura para la categoría '${categoria}'. ${contexto ? `Contexto o temática específica: ${contexto}.` : ''}

Generá una consigna breve y clara que invite a escribir uno o dos renglones. La consigna debe funcionar tanto para introspección como para ficción (realista, fantástica, distópica o apocalíptica). Evitá preguntas complejas. Proponé una situación, detalle, objeto, recuerdo o escena que pueda interpretarse de múltiples formas. Mantener simple, concreto e imaginativo.

Devolvé SOLO las 5 consignas numeradas del 1 al 5, sin explicaciones ni texto adicional.`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    })

    const contenido = completion.choices[0]?.message?.content ?? ''

    const consignas = contenido
      .split('\n')
      .filter((line) => /^\d+[.)]\s/.test(line.trim()))
      .map((line) => line.replace(/^\d+[.)]\s*/, '').trim())
      .filter((line) => line.length > 0)

    return NextResponse.json({ consignas })
  } catch (error) {
    console.error('Error generando consignas — mensaje:', error instanceof Error ? error.message : String(error))
    console.error('Error generando consignas — completo:', JSON.stringify(error, Object.getOwnPropertyNames(error)))
    return NextResponse.json({ error: 'Error al generar consignas' }, { status: 500 })
  }
}
