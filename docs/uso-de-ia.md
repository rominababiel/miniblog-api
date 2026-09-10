# Registro del uso de IA

Herramienta utilizada: **Claude (Claude Code)**, como asistente durante el desarrollo del Proyecto Integrador.

## Prompts utilizados

### 1. Definición del alcance y la arquitectura

> "Tengo que crear un proyecto sobre un miniblog. Te voy a pasar consignas, objetivos y rúbrica de control. Necesito que crees código esperado para mi nivel de estudio, que sea limpio, sin comentarios, escalable y entendible."

Junto con este prompt se entregaron la consigna oficial, los objetivos, el entregable final, la guía de desarrollo y la rúbrica de corrección.

**Impacto:** se definió la estructura de carpetas por capas (`routes` → `controllers` → `services` → `config`), separando el manejo HTTP de la lógica de negocio y de las consultas SQL. Esto evitó tener toda la lógica dentro de los archivos de rutas.

### 2. Implementación de la capa de datos

Se pidió modelar el esquema con las entidades de la consigna y escribir los servicios con consultas parametrizadas.

**Impacto:** el `schema.sql` quedó con claves foráneas explícitas (`ON DELETE CASCADE` en posts y comments, `ON DELETE SET NULL` en el autor del comentario) e índices sobre las columnas usadas en los filtros. Todas las consultas usan placeholders `$1, $2, ...` en lugar de concatenación de strings, evitando SQL injection.

### 3. Validaciones y manejo de errores

Se pidió cubrir las validaciones exigidas por la consigna (nombre no vacío, email único, campos obligatorios de posts) y devolver códigos HTTP adecuados.

**Impacto:** se incorporó `express-validator` con un middleware `validate` que centraliza las respuestas 400, una clase `AppError` para los errores de negocio y un middleware global `errorHandler` que traduce cada error a su status code (400, 404, 409, 500) sin filtrar detalles internos al cliente.

### 4. Testing

> "Cada función quiero que la testees para cumplir 100% con los requerimientos."

**Impacto:** se escribieron 54 tests con Jest y Supertest que cubren los flujos exitosos y los casos de error de cada endpoint. El módulo de conexión se mockea para que la suite no dependa de una base de datos activa. La cobertura final es del 100% en statements, branches, functions y lines.

### 5. Documentación

Se pidió la especificación OpenAPI y el README con los pasos de ejecución local y de deploy en Railway.

**Impacto:** se generó `docs/openapi.yaml` (OpenAPI 3.0) servido desde `/docs` con Swagger UI, y un README con requisitos, variables de entorno, scripts SQL, comandos de test y guía de deployment.

## Cómo influyó la IA en el desarrollo

- **Aceleró el andamiaje**: la estructura de carpetas, los archivos base y la especificación OpenAPI se generaron mucho más rápido que escribiéndolos a mano.
- **No reemplazó la verificación**: cada iteración se validó ejecutando `npm test`. Los errores que aparecieron (por ejemplo, una variable mockeada que Jest no permitía referenciar por su hoisting, y ramas de código sin cubrir en el reporte de cobertura) se detectaron corriendo la suite y se corrigieron antes de continuar.
- **Decisiones propias**: se revisó y ajustó manualmente el diseño relacional, los códigos de estado de cada endpoint y el alcance del extra credit (`comments`), verificando que todo coincidiera con lo pedido en la consigna y la rúbrica.
- **Límites**: la IA se usó como apoyo para escribir y revisar código, no para entregar algo sin comprender. Cada capa del proyecto puede explicarse y modificarse sin depender del asistente.
