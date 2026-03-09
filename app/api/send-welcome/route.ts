import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import WelcomeEmail from '@/emails/WelcomeEmail'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { email, username } = await req.json()

    if (!email || !username) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const { error } = await resend.emails.send({
      from: 'renglón <onboarding@resend.dev>',
      to: email,
      subject: 'Bienvenido/a a renglón',
      react: WelcomeEmail({ username }),
    })

    if (error) {
      console.error('Error enviando welcome email:', error)
      return NextResponse.json({ error: 'Error al enviar el email' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error en send-welcome:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
