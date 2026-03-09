import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { consigna } = await req.json()

    if (!consigna) {
      return NextResponse.json({ error: 'Falta la consigna' }, { status: 400 })
    }

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `Sos el escritor detrás de renglón, una app de escritura creativa. La consigna de hoy es: "${consigna}". Escribí un texto motivacional de 3-4 oraciones que invite a reflexionar sobre esta consigna. No uses frases cliché ni de coaching. Escribí como un escritor que habla con otro escritor. En español rioplatense. Solo respondé con el texto, sin comillas ni explicaciones.`,
        },
      ],
      temperature: 0.8,
      max_tokens: 200,
    })

    const texto = completion.choices[0]?.message?.content?.trim() ?? ''
    return NextResponse.json({ texto })
  } catch (error) {
    console.error('Error en generar-motivacional:', error)
    return NextResponse.json({ error: 'Error al generar texto' }, { status: 500 })
  }
}
