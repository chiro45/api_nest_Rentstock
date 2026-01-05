**Alquiler-Stock API**

Breve API para gestión de inmuebles/alquileres y assets (imágenes) construida con NestJS.

**Requisitos**

- Node >= 18
- pnpm (recomendado) o npm
- MongoDB (URI de conexión)

**Instalación**

1. Clonar el repositorio

```
git clone https://github.com/chiro45/api_nest_Rentstock.git
cd alquiler-stock
```

2. Instalar dependencias

```
pnpm install
```

3. Crear un archivo `.env` en la raíz con las variables necesarias (ver abajo).

4. Ejecutar en modo desarrollo

```
pnpm run start:dev
```

**Variables de entorno (ejemplo)**
Rellena valores reales; NUNCA subas secretos al repositorio.

```
# Base de datos
MONGODB_URI=mongodb+srv://<usuario>:<password>@cluster.mongodb.net/<dbname>

# JWT
JWT_SECRET=tu_secreto_jwt
JWT_EXPIRATION=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Server
PORT=3000
NODE_ENV=development

# Opcionales
FRONTEND_URL=http://localhost:5173
PUBLIC_SITE_URL=http://localhost:4321
```

**Scripts útiles**

- `pnpm run start` — iniciar app
- `pnpm run start:dev` — iniciar con watch
- `pnpm run start:prod` — ejecutar `dist` en producción
- `pnpm run build` — compilar
- `pnpm run test` — ejecutar tests

**Autenticación**

- El login devuelve una cookie `access_token` HttpOnly. La estrategia JWT extrae el token desde esa cookie. Para pruebas con `curl` puedes usar un fichero de cookies:

```
# Login y guardar cookie
curl -c cookie.txt -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}'

# Petición protegida usando la cookie guardada
curl -b cookie.txt http://localhost:3000/rent
```

**Endpoints principales**

- **Auth**
  - `POST /auth/login` — Body: `{ email, password }`. Responde `{ user }` y establece cookie `access_token`.
  - `POST /auth/logout` — Limpia la cookie `access_token`.
  - `GET /auth/profile` — Protegido. Devuelve datos del usuario actual.

- **Rent** (protegido — requiere cookie `access_token`)
  - `POST /rent` — Crear alquiler. Body: `CreateRentDto`.
  - `GET /rent` — Listar todos los alquileres.
  - `GET /rent/:id` — Obtener alquiler por id.
  - `PATCH /rent/:id` — Actualizar alquiler.
  - `DELETE /rent/:id` — Eliminar alquiler.
  - `POST /rent/:id/images` — Subir imágenes (`multipart/form-data`, campo `images`, máximo 10). Añade imágenes al rent.
  - `DELETE /rent/:rentId/images/:assetId` — Eliminar imagen asociada al rent.

- **Assets**
  - `POST /assets/upload-multiple?rentId=<id>` — Subir múltiples archivos (`multipart/form-data`, campo `files`, máximo 10). Retorna metadata de cada asset.
  - `GET /assets/rent/:rentId` — Obtener assets de un rent.
  - `DELETE /assets/:assetId` — Eliminar asset (y desde Cloudinary si aplica).

Ejemplo de subida múltiple con `curl`:

```
curl -b cookie.txt -X POST "http://localhost:3000/assets/upload-multiple?rentId=<RENT_ID>" \
  -F "files=@/ruta/a/imagen1.jpg" -F "files=@/ruta/a/imagen2.jpg"
```

**Cloudinary (almacenamiento de imágenes)**

- La app usa Cloudinary para subir y eliminar imágenes. Configura las variables `CLOUDINARY_*` en el `.env`.
- El servicio `src/assets/services/cloudinary.service.ts` se encarga de uploads y borrados.

**Notas de seguridad y despliegue**

- Cambia `JWT_SECRET` por un valor seguro en producción.
- Asegura la conexión a MongoDB y evita subir `.env` con credenciales.
- En producción activa `secure: true` para cookies (`NODE_ENV=production` en `.env`).

**Siguientes pasos / pruebas**

- Crear un usuario en la base de datos (seed) o usar el servicio de registro si implementado.
- Probar login, guardar cookies y probar los endpoints protegidos.

Si querés, puedo:

- Añadir ejemplos concretos de `CreateRentDto`/`UpdateRentDto`.
- Generar un Postman collection más detallado.
