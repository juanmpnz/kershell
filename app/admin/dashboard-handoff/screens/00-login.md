# 00 — Login

**Ruta:** `/login` (público)
**Spec base:** `SPEC.md §4.1`

## Copy

| Slot | ES |
|------|-----|
| Eyebrow header derecha | `internal · prod` |
| Eyebrow accent (form) | `Acceso` |
| H1 | `Entrar a la consola.` |
| Sub | `Solo para el equipo Kershell. SSO con Google Workspace o credenciales del vault.` |
| Field 1 label | `Correo` |
| Field 2 label | `Contraseña` |
| Field 2 hint | `Token de hardware solicitado tras este paso.` |
| Button primary | `Continuar →` |
| Button SSO | `Continuar con Google Workspace` |
| Foot izq | `kershell.dev/console` |
| Foot der | `v0.4.1` |
| Headline derecha | `La consola interna del **equipo Kershell**.` (la segunda parte en `--accent`) |
| Sub headline derecha | `Un solo lugar para suscripciones, gastos y credenciales por proyecto. Lo que hace ruido cuando algo se vence, deja silencio cuando todo está al día.` |
| Stats foot | `subs activas / gasto mensual / trials por vencer` con valores `14 / $321 / 02` |

## Estructura visual

```
┌────────────────────────────────────────┬────────────────────────────────────────┐
│  [logo]                  internal·prod │  [console]                    2026-... │
│                                        │                                        │
│                                        │                                        │
│         Acceso                         │           K|                           │
│         Entrar a la consola.           │                                        │
│         Solo para el equipo Kershell…  │           La consola interna del       │
│                                        │           equipo Kershell.            │
│         CORREO                         │                                        │
│         [ user_icon  jero@... ]        │           Un solo lugar para…          │
│                                        │                                        │
│         CONTRASEÑA                     │                                        │
│         [ ********** ]                 │                                        │
│         Token de hardware…             │   [subs] [gasto] [trials]              │
│                                        │   14     $321   02                     │
│         [ Continuar → ]                │                                        │
│         [ Google Workspace ]           │                                        │
│                                        │                                        │
│  kershell.dev/console        v0.4.1    │                                        │
└────────────────────────────────────────┴────────────────────────────────────────┘
```

## Detalles técnicos

- Grid: `1fr 1fr` desktop. En mobile `<= 800px`: stack vertical, ocultá el panel derecho o mostralo simplificado sin grid background.
- KConsoleMark = `<KMonogram size={120} />` + bloque cursor lima `8×16` a la derecha con animation blink (mismo que el del terminal del landing).
- Grid background derecho: dos `linear-gradient` perpendiculares de 1px cada 48px + mask-image radial.
- Submit: por ahora redirige a `/dashboard` sin validar nada (cuando llegue auth real, ver Prompt 10 de CODEX-PROMPTS.md).
