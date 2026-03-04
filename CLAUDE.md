# CLAUDE.md — Contexto del proyecto renglón

Este archivo le da contexto a Claude Code para trabajar eficientemente en cada sesión.
Leerlo completo antes de cualquier tarea.

---

## ¿Qué es renglón?

Plataforma de escritura creativa diaria. Cada día hay una consigna nueva generada con IA.
El usuario escribe su respuesta. Solo después se desbloquea el feed para leer lo que
escribieron los demás. La regla central: primero escribís, después leés.

**URL producción:** https://renglon.vercel.app
**Repo:** https://github.com/valmon-01/renglon
**Admin:** https://renglon.vercel.app/admin (solo valenmonti01@gmail.com)

---

## Stack técnico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 App Router |
| Lenguaje | TypeScript estricto |
| Estilos | Tailwind CSS v4 |
| Base de datos | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email + password) |
| IA | Groq API — modelo llama-3.3-70b-versatile |
| Iconos | Lucide React |
| Deploy | Vercel (CD automático desde GitHub) |
| Fuentes | Playfair Display (serif, headings y UI principal), Inter (sans, cuerpo) |

---

## Estructura de carpetas

```
app/
├── page.tsx                    # Landing pública
├── login/page.tsx              # Inicio de sesión
├── registro/page.tsx           # Registro
├── home/page.tsx               # Home del usuario (consigna del día)
├── editor/page.tsx             # Editor tipo cuaderno
├── feed/page.tsx               # Feed del día (bloqueado hasta escribir)
├── texto/[id]/page.tsx         # Texto individual en formato cuaderno
├── perfil/page.tsx             # Perfil propio
├── perfil-publico/page.tsx     # Perfil público de otros usuarios
├── editar-perfil/page.tsx      # Editar nombre y bio
├── admin/page.tsx              # Panel admin (protegido por email)
└── api/
    ├── generar-consignas/route.ts      # Llama a Groq para generar consignas
    ├── aprobar-consigna/route.ts       # INSERT o UPDATE en tabla consignas
    └── asignar-consigna-diaria/route.ts # Lógica de consigna del día
lib/
└── supabase.ts                 # Cliente Supabase (browser-side)
utils/
└── dailyProgress.ts            # calcularYActualizarRacha(userId)
```

---

## Base de datos (Supabase)

### Tablas

**profiles**
- id (uuid, FK → auth.users)
- username (text)
- bio (text)
- ultima_escritura (date)
- racha_actual (integer, default 0)
- created_at

**consignas**
- id (uuid)
- texto (text)
- categoria (text)
- fecha (date, nullable, unique) — null = en banco, fecha = programada
- aprobada (boolean, default false)
- borrador (boolean, default true) — true = borrador privado, false = disponible
- asignada_automaticamente (boolean, default false)
- created_at

**textos**
- id (uuid)
- user_id (uuid, FK → auth.users)
- contenido (text)
- titulo (text, nullable)
- consigna (text) — copia del texto de la consigna al momento de escribir
- publicado (boolean, default false)
- created_at

**likes**
- id (uuid)
- user_id (uuid, FK → auth.users)
- texto_id (uuid, FK → textos)
- created_at
- UNIQUE (user_id, texto_id)

**follows**
- id (uuid)
- follower_id (uuid, FK → auth.users)
- following_id (uuid, FK → auth.users)
- created_at
- UNIQUE (follower_id, following_id)

### RLS importante
- profiles: cada usuario ve y edita solo el suyo. Política adicional: perfiles públicos visibles para todos
- consignas: públicas solo las aprobadas (para lectura). Admin puede insertar/actualizar
- textos: públicos solo los publicados. Cada usuario gestiona los suyos
- likes/follows: visibles para todos, cada usuario gestiona los suyos

### Por qué dos queries en vez de join
La FK textos.user_id → profiles.id no es reconocida por el cliente Supabase para joins
implícitos. Siempre hacer dos queries separadas:
1. Traer textos
2. Traer profiles filtrando por los user_ids obtenidos
3. Combinar en cliente con un Map

---

## Sistema de consignas

### Tres estados
- **borrador** (borrador: true) — privado, no se usa nunca automáticamente
- **banco** (borrador: false, fecha: null) — disponible para asignación automática
- **programada** (borrador: false, fecha: YYYY-MM-DD) — reservada para ese día

### Lógica de asignación diaria (/api/asignar-consigna-diaria)
1. Buscar consigna con fecha = hoy, aprobada = true, borrador = false → usarla
2. Si no hay: buscar del banco (fecha IS NULL, aprobada = true, borrador = false) ORDER BY created_at ASC
3. Si encontró del banco: UPDATE fecha = hoy, asignada_automaticamente = true
4. Retornar la consigna

### Generación con IA
- POST /api/generar-consignas con { categoria, contexto }
- Requiere header Authorization: Bearer <access_token>
- Usa Groq con system message de coordinador de taller literario rioplatense
- Devuelve 5 consignas numeradas para que el admin elija una

---

## Diseño y sistema visual

### Paleta de colores
- Fondo papel: #F5F0E8
- Fondo cuaderno: #FDFAF5
- Tinta principal: #1C1917
- Tinta suave: #5C5147
- Borde/línea: #D6CFBF
- Borravino (acento): #64313E
- Azul cielo (acento secundario): #C1DBE8
- Avatar background: #C1DBE8

### Tipografía
- **Playfair Display italic**: logo, títulos, consignas, elementos editoriales, UI principal
- **Inter**: cuerpo de texto, subtítulos, descripciones, botones
- Line-height del cuaderno: 40px (los renglones físicos)
- backgroundPositionY del cuaderno: 24px

### Patrón de fondo
Todas las páginas usan un patrón de puntos sobre el fondo papel:
```css
background-image: radial-gradient(circle, #9e8e7e 1px, transparent 1px);
background-size: 24px 24px;
opacity: 0.18;
position: absolute; inset: 0; pointer-events: none;
```

### Cuaderno (editor y texto/[id])
- Fondo: #FDFAF5
- Margen izquierdo: línea vertical #C1DBE8 en left: 44px
- Renglones: repeating-linear-gradient cada 40px en #D6CFBF
- backgroundPositionY: 24px para alinear con el padding

### Convenciones de componentes
- No usar HTML `<form>` — usar onClick/onChange
- Botón primario: fondo #64313E, texto blanco, border-radius 8px
- Botón secundario: outline #64313E, sin fondo
- Avatar: círculo con iniciales, fondo #C1DBE8, texto #64313E

---

## Lógica de negocio clave

### Feed bloqueado
- Se verifica con localStorage: `renglon_completed_YYYY-MM-DD`
- Si existe la clave: mostrar feed normalmente
- Si no existe: mostrar feed con blur-sm + overlay con mensaje
- Es protección visual, no de acceso a datos (deuda técnica conocida)

### Likes
- Solo el autor del texto ve quiénes dieron like (join con profiles)
- El resto solo ve el contador
- Toggle: si ya existe → DELETE, si no → INSERT

### Follows
- Solo aparece el botón en /perfil-publico
- No se muestra contador de seguidores (decisión de producto: no algoritmo)
- Si el perfil es el propio usuario: no mostrar botón

### Racha
- Se calcula en utils/dailyProgress.ts → calcularYActualizarRacha(userId)
- Se llama después del insert exitoso en el editor
- En home: si localStorage tiene la clave del día, mostrar racha + 1 (compensar delay)

### No pegar texto
- El editor bloquea el evento paste con preventDefault()
- Decisión de producto: la escritura debe ser manual y presente

### Admin protegido
- Client-side: verifica session.user.email === 'valenmonti01@gmail.com'
- Server-side: ambas APIs validan JWT con getUser(token) y verifican el email
- El access_token se envía en el header Authorization: Bearer <token>

---

## Variables de entorno

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GROQ_API_KEY=
```

Estas tres variables deben estar configuradas tanto en `.env.local` (desarrollo)
como en Vercel (producción). Sin ellas la app no funciona.
