# VisionStock AI · Web

## Puesta en marcha
1. Supabase > SQL Editor: ejecutar `database/001_schema.sql`.
2. `cp .env.example .env` y completar URL y anon key (Settings > API).
3. `npm install && npm run dev`
4. Vercel: agregar las mismas variables VITE_SUPABASE_* en Project Settings > Environment Variables.

## Notas
- El **primer usuario** que se registre queda como SUPER_ADMIN; los siguientes, TRABAJADOR_ALMACEN.
- Las entradas/salidas se registran solo con `supabase.rpc('registrar_movimiento', {...})`.
