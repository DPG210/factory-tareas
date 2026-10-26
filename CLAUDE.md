# factory-tareas

API REST de tareas en Node.js (Express, ES modules) usada como proyecto de práctica para la
**AI Solution Factory**: agentes de IA la amplían de forma autónoma a partir de tareas concretas.
El almacenamiento es en memoria (un array dentro del servicio); no hay base de datos.

Modelo de tarea: `id` (uuid), `title` (string obligatorio, 1-200 caracteres), `completed`
(boolean, por defecto `false`) y `createdAt` (ISO 8601).

## Comandos

- Instalar dependencias: `npm install` (en CI: `npm ci`)
- Ejecutar tests: `npm test`
- Lint: `npm run lint`
- Arrancar el servidor: `npm start` (puerto `PORT` o 3000)
- Arrancar en modo desarrollo: `npm run dev`

## Estructura

```
src/
  app.js                    Crea y exporta la app de Express (sin listen)
  server.js                 Arranca la app en PORT o 3000
  routes/tasks.js           Rutas de /tasks
  services/tasksService.js  Lógica, validación y almacenamiento en memoria (resetTasks para tests)
  middleware/errorHandler.js Manejo central de errores con respuestas JSON { error }
tests/                      Tests de integración (Vitest + Supertest), uno por endpoint
.claude/agents/revisor.md   Subagente revisor de solo lectura
factory.sh                  Script de la fábrica: ejecuta una tarea con claude -p y la verifica
```

## Convenciones

- Los errores de negocio se lanzan desde el servicio con `status` (400, 404…) y el
  `errorHandler` los convierte en `{ error: "<mensaje>" }`. Mensajes en español.
- Cada test llama a `resetTasks()` en `beforeEach` para ser independiente.

## Reglas

- Toda funcionalidad nueva lleva tests.
- No termines una tarea si `npm test` o `npm run lint` fallan.
- Nunca modifiques tests existentes para que pasen; arregla el código.
- Rutas en `src/routes`, lógica en `src/services`.
- Commits pequeños con mensajes en español.
- Si añades o cambias un endpoint, actualiza la tabla de endpoints de README.md en el mismo cambio.