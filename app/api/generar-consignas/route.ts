// v3 - groq
import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const { categoria, contexto } = await request.json()

    const systemPrompt = `Sos un coordinador de taller literario con experiencia en escritura creativa rioplatense. Conocés la tradición de consignas de talleres argentinos: consignas que funcionan como disparadores concretos, no como temas abstractos. Una buena consigna es específica, sensorial y abre una puerta pequeña hacia algo más grande. No dice 'escribí sobre el amor' sino 'escribí sobre algo que dejaste sin decir'. Para textos cortos de práctica diaria (200-300 palabras), la consigna ideal rompe la parálisis del primer renglón en blanco y permite escribir desde la experiencia personal sin necesitar ser escritor.`

    const userPrompt = `Generá 5 consignas de escritura para la categoría '${categoria}'. ${contexto ? `Contexto o temática específica: ${contexto}.` : ''}

Cada consigna debe:
- Ser concreta y sensorial (un objeto, un momento, un gesto — no una emoción abstracta)
- Poder responderse desde la experiencia personal propia
- Tener entre 8 y 20 palabras
- Usar verbos en imperativo: 'Escribí', 'Contá', 'Describí', 'Imaginá', 'Recordá'
- Abrir una puerta pequeña que lleve a algo más profundo
- Evitar clichés y consignas genéricas

Ejemplos del estilo buscado:
- 'Escribí sobre un objeto que alguien te dejó y que no pediste.'
- 'Contá la última vez que llegaste tarde a algo importante.'
- 'Describí un lugar que ya no existe pero que todavía recordás con precisión.'
- 'Escribí la conversación que nunca tuviste con alguien que ya no está.'
- 'Recordá algo que aprendiste solo, sin que nadie te lo enseñara.'

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
