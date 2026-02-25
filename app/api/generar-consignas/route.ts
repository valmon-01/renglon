import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { categoria, contexto } = await request.json()

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'Sos un escritor creativo que genera consignas de escritura en español rioplatense. Las consignas deben ser breves (máximo 15 palabras), evocadoras, específicas y que inviten a escribir desde la experiencia personal.',
        },
        {
          role: 'user',
          content: `Generá 5 consignas de escritura para la categoría '${categoria}'. Contexto adicional: ${contexto}. Devolvé solo las 5 consignas numeradas, sin explicaciones.`,
        },
      ],
    })

    const contenido = completion.choices[0].message.content || ''

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
