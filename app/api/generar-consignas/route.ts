// v3 - groq
// Requiere: ALTER TABLE consignas ADD COLUMN IF NOT EXISTS destacada boolean DEFAULT false;
import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { supabaseAdmin } from '@/lib/supabase-admin'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const { categoria, contexto } = await request.json()

    if (!categoria || typeof categoria !== 'string') {
      return NextResponse.json({ error: 'Categoría requerida' }, { status: 400 })
    }

    const { data: destacadas } = await supabaseAdmin
      .from('consignas')
      .select('texto')
      .eq('destacada', true)
      .limit(8)

    const bloqueDestacadas = destacadas && destacadas.length > 0
      ? `Ejemplos de consignas que funcionan bien (tomá su estilo como referencia):\n${destacadas.map((c, i) => `${i + 1}. ${c.texto}`).join('\n')}\n\n`
      : ''

    const systemPrompt = `Sos un generador de consignas para renglón, una app de escritura creativa diaria para personas que no escriben habitualmente. Tu único objetivo es que alguien pueda empezar a escribir en menos de 1 minuto.

REGLAS:
- Una sola oración.
- Siempre tiene un ancla concreta: un objeto, una situación específica, un personaje, un momento.
- Tono liviano y directo. Nunca solemne, nunca abstracto, nunca académico.
- No hacer preguntas filosóficas ni reflexiones amplias.
- Alternar entre tres modos: MEMORIA (recordar algo específico), FICCIÓN (inventar desde algo propio), VOZ (confesar u opinar con estructura).

EJEMPLOS DE CONSIGNAS BUENAS:
- "Describí una pequeña regla de vida que usás sin darte cuenta." [VOZ]
- "Imaginá la vida secreta de un objeto que heredaste de un familiar." [FICCIÓN]
- "Escribí sobre algo que te encanta y que los demás no entienden." [VOZ]
- "En una película de terror, ¿de qué forma absurda o dramática moriría tu personaje?" [FICCIÓN]
- "Describí un lugar al que no podés volver." [MEMORIA]
- "Escribí la reseña de una película que no existe pero te gustaría ver." [FICCIÓN]
- "Describí la última vez que algo pequeño te hizo reír solo." [MEMORIA]
- "Escribí qué trabajo extremadamente específico sentís que serías increíble haciéndolo." [VOZ]

EJEMPLOS DE CONSIGNAS MALAS (no generes esto):
- "Reflexioná sobre el paso del tiempo y cómo afecta tus relaciones." [demasiado abstracta]
- "Escribí sobre el amor." [sin ancla]
- "¿Qué significa para vos la libertad?" [filosófica, paraliza]
- "Imaginá un mundo donde todo es diferente." [sin punto de entrada]

Devolvé exactamente la cantidad de consignas pedidas, numeradas del 1 al 5, sin explicaciones, sin categoría entre corchetes.`

    const userPrompt = `Generá 5 consignas de escritura para la categoría '${categoria}'. ${contexto ? `Contexto o temática específica: ${contexto}.` : ''}

${bloqueDestacadas}La consigna debe funcionar tanto para introspección como para ficción (realista, fantástica, distópica o apocalíptica). Proponé una situación, detalle, objeto, recuerdo o escena que pueda interpretarse de múltiples formas. Breve, concreta e imaginativa. Debe invitar a escribir textos de 50-200 palabras. Sin explicaciones, sin subtítulos, sin meta-comentarios.

Devolvé SOLO las 5 consignas numeradas del 1 al 5, sin explicaciones ni texto adicional.`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }, { timeout: 15000 })

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
