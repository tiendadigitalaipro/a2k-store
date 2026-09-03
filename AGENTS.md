# AGENTS.md — Reglas permanentes para agentes de A2K Store

## Al comenzar una sesión

1. Leer `AGENTS.md` (este archivo)
2. Leer `MEMORY.md`
3. Leer `docs/AI_PROJECT_STATE.md`
4. Leer `memory/YYYY-MM-DD.md` del día actual si existe
5. Ejecutar `git status` y `git log --oneline -5`
6. Confirmar que el working tree está limpio antes de modificar cualquier archivo

## Reglas absolutas

1. **El repositorio privado es la fuente de verdad.** No inventar estado del proyecto.
2. **No inventar decisiones de negocio.** Si una decisión no está documentada, preguntar.
3. **No introducir secretos.** Nunca: API keys, tokens, contraseñas, claves SSH, credenciales en código, commits, logs ni mensajes.
4. **No hacer cambios destructivos.** No `rm -rf`, no `git reset --hard`, no force push.
5. **No ejecutar `npm install` ni `npm ci` sin autorización explícita.** El equipo tiene limitaciones de almacenamiento.
6. **Revisar `git status` antes de modificar.** Working tree debe estar limpio o los cambios deben ser intencionales.
7. **Trabajar por bloques/fases.** No saltar fases. No comenzar una fase posterior sin verificar la anterior.
8. **Commit después de cada fase verificada.** Mensaje descriptivo con prefijo de fase.
9. **Push después de cada commit verificado.** `git push origin main`.
10. **Actualizar el estado del proyecto antes de finalizar una sesión.** Actualizar `docs/AI_PROJECT_STATE.md` y crear/actualizar `memory/YYYY-MM-DD.md`.

## Prioridades (de mayor a menor)

1. Integridad de datos
2. Inventario y reservas
3. Pagos
4. Seguridad
5. Pedidos
6. UX
7. Efectos visuales

**No sacrificar seguridad ni consistencia de datos para avanzar más rápido.**

## Decisiones técnicas no definidas

Si una decisión técnica no está especificada en la documentación del proyecto:
- Elegir la opción más segura y mantenible
- Documentar la decisión en `docs/AI_PROJECT_STATE.md`
- Continuar, salvo que implique dinero real, credenciales, migración destructiva o cambio irreversible

## Arquitectura

- Frontend: React 19 + TypeScript + Vite + React Router + Tailwind CSS 4 + Framer Motion
- Backend/DB: Supabase (PostgreSQL, Auth, Storage, RLS, Edge Functions)
- Deploy: Vercel
- Dominio: `store.a2kdigitalstudio.online`
- Email: Resend
- WhatsApp: Meta WhatsApp Business Platform / Cloud API

## Estructura del repositorio

```
src/
  components/    # UI components (cart, home, layout, product, ui)
  config/        # Site configuration
  context/       # React contexts (CartContext)
  data/          # Hard-coded demo data (temporal, será reemplazado)
  hooks/         # Custom hooks
  lib/           # Utilities (format, utils)
  pages/         # Route pages
  router/        # React Router config
  types/         # TypeScript types
public/          # Static assets
docs/            # Project documentation
memory/          # Session logs
```

## Bloques de implementación

| Bloque | Fases | Estado |
|--------|-------|--------|
| A | 0 + 1 | ✅ Completado |
| B | 2 + 3 | ⏳ Pendiente |
| C | 4 + 5 + 6 | ⏳ Pendiente |
| D | 7 + 8 + 9 + 10 | ⏳ Pendiente |
| E | 11 + 12 + 13 | ⏳ Pendiente |
| F | 14 + 15 + 16 + 17 | ⏳ Pendiente |
| G | 18 + 19 + 20 | ⏳ Pendiente |
