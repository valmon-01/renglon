import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return htmlResponse('Token inválido', false)
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .update({ email_suscrito: false })
    .eq('email_token', token)
    .select('id')
    .maybeSingle()

  if (error || !data) {
    return htmlResponse('No encontramos tu suscripción. Es posible que ya estés desuscripto/a.', false)
  }

  return htmlResponse('Te desuscribiste correctamente.', true)
}

function htmlResponse(mensaje: string, ok: boolean) {
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>renglón — desuscripción</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #F5F0E8;
      font-family: Inter, -apple-system, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      max-width: 480px;
      width: 100%;
      text-align: center;
    }
    .logo {
      font-family: Georgia, serif;
      font-style: italic;
      font-size: 28px;
      color: #64313E;
      margin-bottom: 24px;
    }
    .mensaje {
      font-size: 15px;
      line-height: 1.7;
      color: #1C1917;
      margin-bottom: 16px;
    }
    .submensaje {
      font-size: 13px;
      color: #5C5147;
      line-height: 1.6;
    }
    .link {
      color: #64313E;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="card">
    <p class="logo">renglón</p>
    <p class="mensaje">${ok ? 'Te desuscribiste de los mails de renglón.' : mensaje}</p>
    <p class="submensaje">
      ${ok
        ? 'Si cambiás de idea, podés volver a suscribirte desde tu perfil en <a class="link" href="https://renglon.vercel.app/editar-perfil">renglon.vercel.app</a>.'
        : mensaje
      }
    </p>
  </div>
</body>
</html>`

  return new NextResponse(html, {
    status: ok ? 200 : 400,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
