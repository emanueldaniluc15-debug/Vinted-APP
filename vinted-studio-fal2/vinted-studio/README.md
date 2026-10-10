# Vinted Studio

Next.js (web, en Vercel) + API como **Edge Function de Supabase** (`supabase/functions/vinted-api`) + PostgreSQL y fotos en Supabase.
Las imágenes se generan con **fal.ai · FLUX.1 [dev]**.

## Cómo funciona la generación
| Modo | Entrada | Modelo de fal.ai |
|---|---|---|
| Con percha / En superficie | Foto original (URL pública del bucket `photos`) + prompt predefinido + instrucciones adicionales (opcionales) | `fal-ai/flux/dev/image-to-image` (`strength` 0.8, 40 pasos, `square_hd`, JPEG) |
| Personalizado (botón «+» → *Personalizado*) | Solo un prompt libre, sin fotos; se envía sin modificar | `fal-ai/flux/dev` |

El modo Personalizado crea un producto normal (se ve en la lista, se abre, se descarga y se exporta). No admite «Aplicar ajuste»; «Volver a generar todo» repite el mismo prompt.

**Precio estimado:** 0,03 $ por megapíxel (≈ 0,03 $ por imagen de 1024×1024). Es una estimación basada en la tarifa publicada por fal.ai, que puede cambiar. Consulta fal.ai/pricing.

## Backend (Supabase)
- Tablas `Settings`, `Product`, `Image`, `Generation` y bucket público `photos`: se crean con `supabase/migrations/20261010000000_vinted_studio_initial_schema.sql` (ya aplicada en el proyecto «Vinted APP»; para otro proyecto, ejecútala en el SQL Editor).
- Función `vinted-api` (sin verificación JWT de Supabase: usa su propia sesión con `APP_PASSWORD`).
- **Secretos de la función** (Supabase > Edge Functions > Secrets):
  - `APP_PASSWORD` (opcional): contraseña para entrar. Sin ella, cualquiera con la URL puede usar la app y gastar tu saldo de fal.ai.
  - `ENCRYPTION_SECRET` (obligatorio): texto largo y secreto (mínimo 16 caracteres). Cifra la clave de fal.ai (AES-256-GCM) y firma las sesiones.
  - `WEB_ORIGIN` (opcional): URL de Vercel sin barra final; solo esa web podrá llamar a la API.
- **Clave de fal.ai:** se introduce en la app, en **Ajustes**, y se guarda cifrada en la tabla `Settings`. No va en el frontend, ni en el repositorio, ni en este ZIP. Créala en https://fal.ai/dashboard/keys (tipo API, con saldo en la cuenta).
- Comprobación: `https://wfdxcyibqxyvoubbkhxd.supabase.co/functions/v1/vinted-api/health` → `{"ok":true,"configured":true,...}`.
- Desplegar: `supabase functions deploy vinted-api --no-verify-jwt --project-ref wfdxcyibqxyvoubbkhxd` (la configuración está en `supabase/config.toml`).

### Rutas de la API (`/functions/v1/vinted-api/api/...`)
`POST /auth/login`, `GET /settings/status`, `POST /settings/models`, `POST|DELETE /settings/api-key`, `GET|POST /products`, `GET|PATCH|DELETE /products/:id`, `POST /products/:id/generate` (acepta `style` y `refinement`), `POST /products/images/:imageId/refine`, `GET /products/:id/export`, `GET /products/generations/:id/download` y la nueva **`POST /custom/generate`** (`{ "prompt": "..." }`, responde 201 con el producto; la imagen se genera en segundo plano y la pantalla del producto la va actualizando).

### Base de datos
La migración inicial define `Product.style` como texto (admite `HANGER`, `SURFACE` y `CUSTOM`) y `Image.originalUrl` con valor vacío por defecto (los productos personalizados no tienen foto original). Las tablas tienen RLS activado sin políticas: solo la Edge Function (service role) accede a ellas.

### Claves antiguas
Si había una clave de Gemini, OpenAI o BFL guardada, la app la considera no válida: introduce la de fal.ai en Ajustes.

## Frontend (Vercel)
1. Sube el proyecto a GitHub.
2. Vercel > Add New Project > el repo > **Root Directory: `apps/web`**.
3. Variable de entorno `NEXT_PUBLIC_API_URL` = `https://wfdxcyibqxyvoubbkhxd.supabase.co/functions/v1/vinted-api`.
4. Entra en la URL de Vercel, escribe tu contraseña y valida tu clave de fal.ai en Ajustes.

## En local
```
npm install
cd apps/web && cp .env.local.example .env.local   (en Windows: copy)
cd ../.. && npm run dev:web
```
Abre http://localhost:3000 (si usas `WEB_ORIGIN`, incluye también `http://localhost:3000`, separado por comas).
Build de producción: `npm run build -w apps/web`.
