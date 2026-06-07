# PROMPT PARA CODEX — Reemplazar logo por "kershell_"

Copiá y pegá esto en Codex con la carpeta `logo-handoff/` en la raíz del repo.

---

```
Te paso un nuevo logotipo oficial de Kershell en /logo-handoff. Es el wordmark
"kershell" en minúsculas, Geist 600, con un underscore lima al final (referencia
al cursor de terminal). Reemplaza los lockups de logo actuales tanto en el landing
como en el dashboard.

PASO 1 — Leé el contexto
- Leé /logo-handoff/README.md (spec completa).
- Mirá /logo-handoff/Logo.tsx (componente oficial).

PASO 2 — Instalá el componente
- Copiá logo-handoff/Logo.tsx a components/brand/Logo.tsx (sobreescribí el Logo
  actual si existe).
- Ajustá los imports/tokens a los de este repo (usamos las CSS vars --text, --ink,
  --accent que ya existen del rebrand Console).
- Si el repo usa otra convención (ej. tailwind theme tokens), adaptá los colores
  a esa convención pero NO cambies la geometría (tamaños, letter-spacing,
  proporciones del underscore).

PASO 3 — Reemplazá TODOS los usos de logo
Buscá en el repo cualquier uso de los lockups viejos:
  - <KLockup ... />
  - <KLockupTile ... />
  - <Logo ... />  (versión anterior)
  - cualquier import de un SVG de logo (logo.svg, lockup.svg, kershell-lockup.svg)
  - el <KMonogram /> SOLO cuando se usa como logo de header/footer (NO cuando se
    usa como ícono decorativo, watermark o patrón — esos se mantienen)

Reemplazalos según el contexto:
  - Header / nav del landing            → <Logo size={22} />
  - Footer del landing                  → <Logo size={20} />
  - Sidebar del dashboard (expandida)   → <Logo size={24} />
  - Sidebar del dashboard (colapsada)   → <Logo variant="mark" size={22} />
  - Login, panel izquierdo (top)        → <Logo size={28} />
  - Login, panel derecho (hero)         → <Logo size={64} /> con blink en el underscore (opcional)
  - Sobre fondo lima                    → <Logo color="var(--ink)" accent="var(--ink)" />

PASO 4 — Favicon + OG
- Copiá logo-handoff/favicon.svg a app/favicon.svg (o public/, según tu setup).
- Actualizá el <link rel="icon"> y los metadatos de Open Graph para que usen el
  nuevo mark. Si necesitás PNG (apple-touch-icon, etc), generalos desde el SVG
  a 32 / 180 / 512.

PASO 5 — Limpieza
- Eliminá los assets de logo viejos que ya no se referencian (lockup SVGs).
- NO borres KMonogram si se usa en otros lados (verificá usos antes).
- Corré el typecheck y el build. Mostrame:
    a) el diff de cada archivo tocado,
    b) un screenshot del header del landing y del sidebar del dashboard,
    c) la lista de assets viejos eliminados.

REGLAS IMPORTANTES
- El wordmark va SIEMPRE en minúsculas ("kershell"). El nombre en prosa sigue
  siendo "Kershell" — no toques copy, solo el logo.
- El underscore es un bloque (div/span con background), NO el carácter "_".
- No inventes colores nuevos. Usá --text, --ink, --accent.
- Una sola fuente de verdad: todo el logo sale de <Logo />. No dupliques el markup.
```

---

## Después de Codex

Validá manualmente:
- [ ] Header del landing usa `kershell_` y se ve alineado
- [ ] Sidebar del dashboard (expandida y colapsada)
- [ ] Login (ambos paneles)
- [ ] Favicon en la tab del navegador
- [ ] No quedó ningún `KLockup` / `KLockupTile` huérfano (grep)
- [ ] El build pasa limpio
