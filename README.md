# renglón

> Plataforma de escritura creativa diaria con integración de IA generativa, autenticación segura y arquitectura full-stack en producción.

**Demo en vivo:** [renglon.vercel.app](https://renglon.vercel.app)

---

## ¿Qué es renglón?

renglón es una web app que propone una consigna de escritura nueva cada día. Los usuarios escriben su respuesta en un editor tipo cuaderno y, una vez que publican, pueden leer lo que escribieron los demás. El feed permanece bloqueado hasta que el usuario completa su propia versión — una mecánica diseñada para fomentar la creación activa por sobre el consumo pasivo.

Las consignas son generadas automáticamente por un modelo de lenguaje (Groq / Llama 3.3 70B) a través de un panel de administración privado, con categorías rotativas: emoción, lugar, personaje, objeto, tiempo y memoria.

---

## Problema que resuelve

La mayoría de las plataformas de escritura son pasivas: el usuario consume contenido sin crear. renglón invierte esa lógica — primero escribís, después leés. Esto elimina la parálisis del "no sé qué escribir" (hay una consigna) y el consumo sin participación (el feed está bloqueado hasta que escribís).

---

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 16 (App Router) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS v4 |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth |
| Seguridad | Row Level Security (RLS) |
| IA / LLM | Groq API — Llama 3.3 70B |
| Serverless | Vercel Functions (API Routes) |
| Deploy | Vercel (CD automático desde GitHub) |
| Íconos | Lucide React |
| Fuentes | Google Fonts (Playfair Display + Inter) |

---

## Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                     CLIENTE                         │
│          Next.js App Router (React 19)              │
│   /home  /editor  /feed  /perfil  /texto/[id]       │
└─────────────────┬───────────────────────────────────┘
                  │ HTTP / fetch
┌─────────────────▼───────────────────────────────────┐
│              VERCEL SERVERLESS                       │
│         Next.js API Routes (Edge-compatible)         │
│   POST /api/generar-consignas  (→ Groq API)         │
│   POST /api/aprobar-consigna   (→ Supabase)         │
└────────────┬────────────────────────────────────────┘
             │                         │
┌────────────▼──────────┐   ┌─────────▼──────────────┐
│      GROQ API         │   │       SUPABASE          │
│  Llama 3.3 70B        │   │  PostgreSQL + Auth      │
│  Inferencia LLM       │   │  RLS por tabla          │
│  Generación de        │   │  Tablas: textos,        │
│  consignas creativas  │   │  profiles, consignas,   │
└───────────────────────┘   │  likes, follows         │
                            └────────────────────────┘
```

---

## Flujo de datos

1. **Admin genera consignas** → llama a `POST /api/generar-consignas` con categoría y contexto
2. **Groq devuelve 5 opciones** → el admin selecciona una y elige una fecha
3. **Consigna se aprueba** → `POST /api/aprobar-consigna` la inserta en la tabla `consignas` con `aprobada: true`
4. **Usuario abre `/home`** → ve la consigna del día y su racha actual
5. **Usuario escribe en `/editor`** → textarea con auto-resize, bloqueo de pegado y contador de palabras (meta: 300)
6. **Usuario publica o guarda** → insert en tabla `textos`, se marca el día como completado
7. **Feed se desbloquea** → el usuario puede leer los textos de otros en `/feed` del mismo día

---

## Decisiones técnicas

**Feed bloqueado hasta escribir**
La verificación de completado usa `localStorage` como caché local para evitar queries innecesarias a Supabase en cada visita. El estado es inmediato y no requiere round-trip al servidor.

**Editor sin pegado**
El bloqueo de pegado (`onPaste` con `preventDefault`) es una decisión de producto: fuerza la escritura manual y garantiza que cada texto sea original. Se muestra un aviso contextual al usuario cuando intenta pegar.

**Row Level Security en todas las tablas**
Cada tabla tiene políticas RLS configuradas en Supabase: los textos privados son accesibles solo por su autor, los textos publicados son visibles para todos los autenticados, y las operaciones de escritura validan `auth.uid()` en el servidor.

**Generación de consignas con LLM**
Se usa Groq con Llama 3.3 70B por su inferencia gratuita y de baja latencia. El prompt está en español rioplatense con instrucciones precisas de formato (5 consignas numeradas, máximo 15 palabras cada una). La respuesta se parsea con regex antes de devolverla al cliente.

**Panel admin protegido en el servidor**
La verificación de acceso admin se realiza comparando el email del usuario autenticado (`valenmonti01@gmail.com`) antes de renderizar el panel. No hay datos sensibles expuestos en el cliente.

---

## Funcionalidades implementadas

- Registro e inicio de sesión con Supabase Auth (email + contraseña)
- Editor de texto estilo cuaderno con líneas, margen y bloqueo de pegado
- Contador de palabras con barra de progreso hacia la meta de 300 palabras
- Consignas diarias generadas con IA y programadas por fecha y categoría
- Feed de textos publicados con filtros: Recientes, Populares, Breves
- Feed bloqueado hasta completar la escritura del día
- Opción de publicar el texto o guardarlo en privado
- Perfil de usuario con tabs de textos publicados y privados
- Edición de nombre y bio desde el perfil
- Vista individual de texto con estética de cuaderno
- Panel de administración para generación y aprobación de consignas
- Sistema de likes visual en textos individuales y feed
- Diseño editorial completo: tipografía, paleta, componentes cohesivos

---

## Instalación local

### Requisitos

- Node.js 18 o superior
- Cuenta en [Supabase](https://supabase.com) (plan gratuito suficiente)
- API key de [Groq](https://console.groq.com) (plan gratuito suficiente)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/valmon-01/renglon.git
cd renglon

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Completar los valores en .env.local

# 4. Aplicar el schema en Supabase
# Ir al SQL Editor del proyecto en supabase.com
# Ejecutar el contenido de supabase/schema.sql

# 5. Iniciar el servidor de desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

---

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto en Supabase (visible en Project Settings → API) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima pública de Supabase (Project Settings → API) |
| `GROQ_API_KEY` | API key de Groq (console.groq.com → API Keys) |

Ver `.env.example` para la plantilla completa.

---

## Deploy en Vercel

1. Importar el repositorio en [vercel.com/new](https://vercel.com/new)
2. Agregar las tres variables de entorno en la configuración del proyecto
3. Vercel detecta Next.js automáticamente y despliega en cada push a `main`

---

## Limitaciones actuales (MVP)

- La racha de días consecutivos está hardcodeada; aún no persiste en Supabase
- Los likes son visuales (estado local); no se guardan en la base de datos
- El sistema de follows no está implementado
- No hay middleware global de autenticación (cada página verifica sesión individualmente)
- No hay notificaciones al publicar ni emails con la consigna del día

---

## Próximas mejoras

- [ ] Middleware server-side con `@supabase/ssr` para proteger rutas autenticadas
- [ ] Racha real desde `profiles.racha_actual` en Supabase
- [ ] Likes persistentes en tabla `likes` con conteo en tiempo real
- [ ] Perfiles públicos con sistema de follows
- [ ] Consigna dinámica del día leída desde tabla `consignas` según fecha
- [ ] Generación automática de consignas vía cron job
- [ ] Tipos de Supabase generados con `supabase gen types typescript`
- [ ] Notificaciones por email con la consigna diaria

---

## Autor

**Valentina Monti** — [github.com/valmon-01](https://github.com/valmon-01)
