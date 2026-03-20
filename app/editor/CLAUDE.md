# Contexto — Editor

El editor es el corazón de renglón. Replica la metáfora de un cuaderno físico.

## Reglas que no se tocan

- onPaste preventDefault — intencional, fuerza escritura original. No remover nunca.
- line-height: 40px es sagrado — alinea el texto con los renglones del fondo. No cambiar.
- Fondo del editor: var(--color-blanco-roto) — nunca blanco puro.
- La consigna se muestra en Playfair Display italic.
- Al guardar, actualizar localStorage con key renglon_completed_YYYY-MM-DD.
