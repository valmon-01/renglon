# renglón

*Una consigna diaria. Escribís primero, leés después.*

**Demo:** [renglon.vercel.app](https://renglon.vercel.app)

---

## Qué es

renglón es una app de escritura creativa con una consigna nueva cada día. El mecanismo central es simple: para leer lo que escribieron los demás, primero tenés que escribir vos. Eso elimina el sesgo de lectura previa y hace que cada texto sea genuino.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16 + TypeScript |
| Estilos | Tailwind CSS v4 |
| Base de datos y auth | Supabase (PostgreSQL + Row Level Security) |
| Generación de consignas | Groq API — Llama 3.3 70B |
| Deploy | Vercel |

---

## Arquitectura

```
app/
├── (páginas públicas)   page.tsx, login/, registro/
├── (páginas privadas)   home/, editor/, feed/, perfil/, editar-perfil/
├── admin/               panel de administración (acceso restringido)
├── texto/[id]/          visualización individual de un texto
└── api/
    ├── generar-consignas/   POST → Groq genera 5 consignas
    └── aprobar-consigna/    POST → guarda consigna aprobada en Supabase

lib/
└── supabase.ts          cliente de Supabase para componentes cliente
```

**Flujo principal:**
1. El admin genera consignas con IA (Groq/Llama 3) y las programa para fechas futuras
2. El usuario ve la consigna del día en `/home`
3. Escribe en `/editor` (mínimo 300 palabras, sin pegar texto)
4. Al guardar se desbloquea el `/feed` del día
5. Puede publicar su texto (visible para todos) o guardarlo en privado

---

## Funcionalidades

- **Autenticación** con Supabase Auth (email + contraseña)
- **Editor** estilo cuaderno con líneas, contador de palabras y bloqueo de pegado
- **Consigna diaria** programada por el admin con IA
- **Feed bloqueado** hasta que el usuario escribe su versión del día
- **Perfil** con textos publicados y privados separados por tabs
- **Panel admin** para generar consignas con IA y programarlas por fecha y categoría
- **Vista individual** de textos con sistema de likes
- **Diseño editorial** cálido (Playfair Display + Inter, paleta papel y tinta)

---

## Correr en local

```bash
# 1. Clonar el repositorio
git clone https://github.com/valmon-01/renglon.git
cd renglon

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Completar los valores en .env.local

# 4. Aplicar el schema de base de datos en Supabase
# Ejecutar supabase/schema.sql en el SQL Editor de tu proyecto

# 5. Correr el servidor de desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

---

## Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=       # URL del proyecto en Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Anon key pública de Supabase
GROQ_API_KEY=                   # API key de Groq (console.groq.com)
```

Ver `.env.example` para la plantilla completa.

---

## Decisiones técnicas

**Groq en lugar de OpenAI**
Groq ofrece inferencia gratuita con Llama 3.3 70B, suficiente para generar 5 consignas creativas por request. Elimina el costo operativo del proyecto.

**Feed bloqueado por localStorage**
La verificación de si el usuario escribió hoy usa `localStorage` como caché local. Es liviana: no requiere una query extra a Supabase en cada visita al feed, y el estado es correcto en el mismo dispositivo y navegador donde se escribió.

**Editor sin paste**
El bloqueo de pegado es una decisión de producto. Fuerza la escritura manual y hace que cada texto sea original. Se implementa con `onPaste` que previene el evento por defecto y muestra un aviso.

**Consignas aprobadas por humano**
Las consignas se generan con IA pero las aprueba un editor antes de publicarlas. Mantiene la calidad sin exponer el endpoint de generación a los usuarios finales.

**Tailwind CSS v4**
Configuración vía CSS (`@theme`) en lugar de `tailwind.config.js`. Los colores del sistema de diseño (papel, tinta, borravino, etc.) se definen como custom properties en `globals.css` y se usan como clases utilitarias en todos los componentes.

---

## Próximas mejoras

- [ ] Middleware de autenticación server-side (`@supabase/ssr`)
- [ ] Likes persistentes en base de datos
- [ ] Sistema de racha real (desde `profiles.racha_actual`)
- [ ] Perfiles públicos con follows
- [ ] Consigna dinámica del día (desde tabla `consignas` según fecha)
- [ ] Tipos de Supabase generados con `supabase gen types typescript`
- [ ] Notificaciones por email con nueva consigna
