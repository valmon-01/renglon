import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { categoria, contexto } = await request.json()

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `Sos un escritor creativo que genera consignas de escritura en español rioplatense. Las consignas deben ser breves (máximo 15 palabras), evocadoras, específicas y que inviten a escribir desde la experiencia personal.

Generá 5 consignas de escritura para la categoría '${categoria}'. Contexto adicional: ${contexto}. Devolvé solo las 5 consignas numeradas, sin explicaciones.`

    const result = await model.generateContent(prompt)
    const contenido = result.response.text()

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
