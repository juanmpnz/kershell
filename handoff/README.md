# Kershell — Handoff a Codex

Paquete listo para que Codex (o cualquier agente AI de codding) implemente la **Dirección A · Console** sobre tu Next.js + Tailwind existente.

## Qué hay acá

```
handoff/
├── README.md              ← este archivo (empezá acá)
├── SPEC.md                ← el sistema de diseño completo en lenguaje claro
├── CODEX-PROMPTS.md       ← prompts secuenciales para darle a Codex
├── tokens/
│   ├── tailwind.config.snippet.js   ← extensión de tu tailwind.config
│   └── globals.css                  ← variables CSS + base
├── components/
│   ├── KMonogram.tsx     ← logo como componente React
│   ├── Logo.tsx          ← lockup K + wordmark
│   └── Button.tsx        ← botón Console
└── assets/
    ├── kershell-mark.svg          ← K limpio (currentColor)
    ├── kershell-mark-console.svg  ← K + cursor lima sobre negro
    ├── favicon.svg                ← favicon de tab
    └── og-default.svg             ← imagen social 1200×630
```

## Cómo usarlo (paso a paso)

### 1. Copiá los assets a tu repo
```
public/
├── favicon.svg
├── logo.svg                 (= kershell-mark.svg)
└── og/default.png           (renderizá og-default.svg a PNG con figma/inkscape, o servilo .svg)
```

### 2. Pegá los tokens
- Tomá `tokens/tailwind.config.snippet.js` y mergealo en tu `tailwind.config.{js,ts}`.
- Tomá `tokens/globals.css` y pegá las variables en tu `app/globals.css` (o `styles/globals.css`).
- Instalá las fuentes vía `next/font/google` (el snippet muestra cómo).

### 3. Copiá los componentes base
- Movelos a `components/brand/` en tu repo. Son TS+Tailwind, sin dependencias raras.

### 4. Abrí Codex en la raíz del repo
- Leé `CODEX-PROMPTS.md` y andá pegando los prompts uno por uno. Cada uno es una tarea acotada.
- Después de cada prompt, revisá el diff, probá la página, y solo entonces pasá al siguiente.

### 5. Referencia visual
- El canvas de diseño con la implementación de referencia está en este mismo proyecto. Si Codex tiene dudas sobre un layout, abrí el artboard correspondiente y mandale un screenshot.

## Tips para Codex

- **No le des SPEC.md entero de una.** Es mucho contexto. Mejor un prompt por sección (CODEX-PROMPTS.md ya viene cortado así).
- **Pedile que migre por componente, no por página.** Primero `<Logo />`, después `<Hero />`, etc.
- **Validá el branding antes de seguir.** Si el `<KMonogram />` quedó mal, todo lo demás va a quedar mal.
- **Pasa los SVGs como archivos, no como base64.** Ocupás menos contexto.
