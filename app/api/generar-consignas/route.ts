import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const { categoria, contexto } = await request.json()

    const prompt = `Sos un escritor creativo que genera consignas de escritura en español rioplatense. Generá 5 consignas breves (máximo 15 palabras cada una), evocadoras y específicas para la categoría '${categoria}'. Contexto: ${contexto}. Devolvé SOLO las 5 consignas numeradas del 1 al 5, sin explicaciones ni texto adicional.`

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
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
