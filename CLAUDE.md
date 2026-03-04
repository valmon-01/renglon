# renglón — sistema de diseño y contexto del proyecto

## Qué es
App de escritura creativa con una consigna diaria. El usuario escribe su texto y puede leer los de otros solo después de completar la consigna del día.

## Stack
- Next.js 14 + TypeScript + Tailwind CSS
- Supabase (auth + base de datos)
- Vercel (deploy)
- Lucide Icons (stroke 1.5px, 20px base)
- Google Fonts: Playfair Display + Inter

## Colores
- #F5F0E8 — papel (fondo general)
- #FDFAF5 — blanco roto (fondo editor)
- #EDE8DC — papel oscuro (fondo cards)
- #64313E — borravino (primario, botones, acentos)
- #1C1917 — tinta (texto principal)
- #5C5147 — tinta suave (texto secundario)
- #C1DBE8 — cielo (avatares, tags)
- #D6CFBF — borde

## Tipografía
- Playfair Display italic — nombre "renglón", consignas, títulos
- Inter — UI, cuerpo, formularios
- Editor: Inter 17px, line-height 1.8
- "renglón" siempre en minúscula e italic

## Componentes
- Botón primario: fondo #64313E, texto #FDFAF5, radius 6px
- Botón secundario: borde 1.5px #64313E, sin fondo
- Cards: fondo #EDE8DC, borde 1px #D6CFBF, radius 8px
- Inputs: fondo #FDFAF5, solo borde inferior 1.5px #D6CFBF, focus #64313E
- Avatar: circular, fondo #C1DBE8, iniciales en #64313E, sin foto
- Tags: fondo #C1DBE8, texto #64313E, radius 4px

## Principios
- Máximo 720px centrado en desktop
- Espaciado en múltiplos de 8px
- Sin sombras agresivas
- Estética editorial cálida, como papel y tinta
