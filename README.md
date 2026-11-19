# VisionStock AI · Web

## Puesta en marcha
1. Supabase > SQL Editor: ejecutar en orden los archivos de `database/`:
   - `001_schema.sql` – tablas, RLS, triggers y RPC de movimientos
   - `002_alertas_y_bajas.sql` – reevaluación de alertas
   - `003_dashboard.sql` – resumen del dashboard
   - `004_usuarios.sql` – protección del último administrador
   - `005_auditorias.sql` – flujo de auditorías (iniciar, contar, finalizar con ajuste, cancelar)
   - `006_analisis.sql` – consumo, proyección de días de existencia y predicciones
   - `007_configuracion.sql` – ajustes generales del sistema
   - Edge Function `supabase/functions/crear-usuario` (alta de usuarios desde el panel)
2. `cp .env.example .env` y completar URL y anon key (Settings > API).
3. `npm install && npm run dev`
4. Vercel: agregar las mismas variables VITE_SUPABASE_* en Project Settings > Environment Variables.

## Notas
- El **primer usuario** que se registre queda como SUPER_ADMIN; los siguientes, TRABAJADOR_ALMACEN.
- Las entradas/salidas se registran solo con `supabase.rpc('registrar_movimiento', {...})`.
