# MiniBlog API

API REST desarrollada en Node.js + Express y conectada a PostgreSQL para el servicio de contenidos **MiniBlog** de DevSpark. Permite gestionar autores (`authors`), publicaciones (`posts`) y comentarios (`comments`) con validaciones, manejo centralizado de errores, tests automatizados y documentación OpenAPI.

## Demo en producción

- **API:** https://miniblog-api-production-9b50.up.railway.app
- **Documentación interactiva (Swagger UI):** https://miniblog-api-production-9b50.up.railway.app/docs
- **Estado del servicio:** https://miniblog-api-production-9b50.up.railway.app/health

## Stack

- Node.js 18+ y Express 4
- PostgreSQL con el driver `pg` (consultas SQL parametrizadas, sin ORM)
- `express-validator` para validación de entrada
- Jest + Supertest para testing
- Swagger UI para la documentación interactiva

## Estructura del proyecto

```
├── db/
│   ├── schema.sql              Creación de tablas, FKs e índices
│   └── seed.sql                Datos de ejemplo
├── docs/
│   ├── openapi.yaml            Especificación OpenAPI 3.0
│   └── uso-de-ia.md            Registro del uso de IA
├── scripts/
│   └── run-sql.js              Ejecuta un archivo .sql contra la base
├── src/
│   ├── config/db.js            Pool de conexión a PostgreSQL
│   ├── controllers/            Manejo de request/response y status codes
│   ├── middlewares/            validate, errorHandler, notFound
│   ├── routes/                 Definición de endpoints
│   ├── services/               Lógica de negocio y consultas SQL
│   ├── utils/AppError.js       Error con status code HTTP
│   └── app.js                  Configuración de la app Express
├── tests/                      Tests con Jest + Supertest
└── server.js                   Punto de entrada
```

## Requisitos

- Node.js 18 o superior
- PostgreSQL 14 o superior en ejecución local (o una base de Railway)

## Ejecución local

1. Clonar el repositorio e instalar dependencias:

```bash
git clone https://github.com/<usuario>/miniblog-api.git
cd miniblog-api
npm install
```

2. Crear el archivo `.env` a partir del ejemplo:

```bash
cp .env.example .env
```

Contenido de `.env.example`:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/miniblog
DB_SSL=false
```

3. Crear la base de datos en PostgreSQL:

```bash
createdb miniblog
```

4. Ejecutar los scripts SQL de creación y carga de datos:

```bash
npm run db:setup
npm run db:seed
```

5. Levantar el servidor:

```bash
npm run dev     # con recarga automática
npm start       # modo producción
```

La API queda disponible en `http://localhost:3000` y el estado del servicio en `http://localhost:3000/health`.

## Endpoints

| Método | Ruta | Descripción | Respuestas |
| --- | --- | --- | --- |
| GET | `/authors` | Lista todos los authors | 200, 500 |
| GET | `/authors/:id` | Detalle de un author | 200, 400, 404, 500 |
| POST | `/authors` | Crea un author | 201, 400, 409, 500 |
| PUT | `/authors/:id` | Actualiza un author | 200, 400, 404, 409, 500 |
| DELETE | `/authors/:id` | Elimina un author y sus posts | 204, 400, 404, 500 |
| GET | `/posts` | Lista todos los posts | 200, 500 |
| GET | `/posts/:id` | Detalle de un post | 200, 400, 404, 500 |
| GET | `/posts/author/:authorId` | Posts de un author con su detalle | 200, 400, 404, 500 |
| POST | `/posts` | Crea un post | 201, 400, 404, 500 |
| PUT | `/posts/:id` | Actualiza un post | 200, 400, 404, 500 |
| DELETE | `/posts/:id` | Elimina un post | 204, 400, 404, 500 |
| GET | `/comments` | Lista todos los comments | 200, 500 |
| GET | `/comments/post/:postId` | Comments de un post con su detalle | 200, 400, 404, 500 |
| POST | `/comments` | Crea un comment | 201, 400, 404, 500 |

### Validaciones

- `authors`: `name` obligatorio, `email` obligatorio, con formato válido y único (409 si ya existe).
- `posts`: `title`, `content` y `author_id` obligatorios; el author debe existir (404 si no).
- `comments`: `content` y `post_id` obligatorios; `author_id` es opcional (comentario anónimo).

Los errores de validación devuelven 400 con el detalle de cada campo:

```json
{
  "error": "Datos invalidos",
  "details": [{ "field": "name", "message": "El nombre es obligatorio" }]
}
```

### Ejemplos

```bash
curl http://localhost:3000/authors

curl -X POST http://localhost:3000/authors \
  -H "Content-Type: application/json" \
  -d '{"name":"Ana Garcia","email":"ana@example.com","bio":"Desarrolladora full-stack"}'

curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Introduccion a Node.js","content":"Node.js es un runtime...","author_id":1,"published":true}'

curl http://localhost:3000/posts/author/1

curl -X DELETE http://localhost:3000/posts/1
```

## Modelo de datos

```
authors (1) ──< (N) posts (1) ──< (N) comments
                        │                  │
                        └── author_id ─────┘
```

- `posts.author_id` → `authors.id` con `ON DELETE CASCADE`: al borrar un author se borran sus posts.
- `comments.post_id` → `posts.id` con `ON DELETE CASCADE`: al borrar un post se borran sus comentarios.
- `comments.author_id` → `authors.id` con `ON DELETE SET NULL`: el comentario se conserva como anónimo.
- Índices en `posts.author_id`, `comments.post_id` y `comments.author_id`; `authors.email` es `UNIQUE`.

## Tests

Los tests usan Jest y Supertest sobre la app de Express, con el módulo de base de datos mockeado, por lo que no requieren una instancia de PostgreSQL levantada.

```bash
npm test              # ejecuta los 47 tests
npm run test:coverage # ejecuta los tests con reporte de cobertura
```

Cubren los flujos exitosos y los casos de error de cada recurso: creación, lectura, actualización y borrado, validaciones inválidas, recursos inexistentes (404), email duplicado (409) y fallos de base de datos (500).

## Documentación OpenAPI

La especificación está en [`docs/openapi.yaml`](docs/openapi.yaml) y se sirve desde la propia API:

- Swagger UI: `http://localhost:3000/docs`
- Especificación en JSON: `http://localhost:3000/api-docs.json`

En producción: `https://miniblog-api-production-9b50.up.railway.app/docs`

## Deployment en Railway

1. Subir el proyecto a un repositorio público de GitHub (el archivo `.env` está ignorado por `.gitignore`).
2. En Railway, crear un proyecto nuevo y agregar el servicio **PostgreSQL** (`New → Database → Add PostgreSQL`).
3. Agregar el servicio de la API con `New → GitHub Repo` y seleccionar el repositorio.
4. Configurar las variables de entorno del servicio de la API:

| Variable | Valor |
| --- | --- |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (referencia interna al servicio de base de datos) |
| `DB_SSL` | `false` si se usa la URL interna, `true` si se conecta por la URL pública |
| `NODE_ENV` | `production` |

`PORT` lo inyecta Railway automáticamente; el servidor lo lee con `process.env.PORT`.

5. Railway detecta el proyecto Node y ejecuta `npm install` y `npm start`.
6. Generar la URL pública en `Settings → Networking → Generate Domain`.
7. Cargar el esquema y los datos iniciales en la base de producción, con la `DATABASE_PUBLIC_URL` de Railway:

```bash
DATABASE_URL="postgresql://postgres:<password>@<host>.proxy.rlwy.net:<puerto>/railway" DB_SSL=true npm run db:setup
DATABASE_URL="postgresql://postgres:<password>@<host>.proxy.rlwy.net:<puerto>/railway" DB_SSL=true npm run db:seed
```

8. Verificar el deploy:

```bash
curl https://miniblog-api-production-9b50.up.railway.app/health
```

### URLs

- **Internal URL** (comunicación entre servicios dentro de Railway): `postgres.railway.internal:5432`, usada a través de `${{Postgres.DATABASE_URL}}`.
- **Public URL** de la API: `https://miniblog-api-production-9b50.up.railway.app`
- **Public URL** de la base (solo para los scripts SQL desde la máquina local): `<host>.proxy.rlwy.net:<puerto>`

## Registro del uso de IA

El detalle completo de los prompts utilizados y su impacto está en [`docs/uso-de-ia.md`](docs/uso-de-ia.md). Resumen:

- Se usó IA para acelerar el andamiaje del proyecto (estructura de carpetas, esqueleto de rutas y controladores) y para redactar la especificación OpenAPI y este README.
- Las consultas SQL, las validaciones y los casos de test se revisaron y ajustaron manualmente, verificando que cada endpoint respondiera con el status code correcto.
- No se aceptó código sin ejecutarlo: la suite de tests se corrió en cada iteración hasta llegar al 100% de cobertura.
