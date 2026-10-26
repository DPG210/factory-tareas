# factory-tareas

API REST de tareas en Node.js que sirve como proyecto de práctica para una **AI Solution
Factory**: una base pequeña, testeada y con reglas claras que después amplían agentes de IA
(Claude Code) de forma autónoma, ya sea en local con `factory.sh` o en GitHub mencionando a
`@claude`.

Funcionalidades como el borrado de tareas, filtros, paginación, fechas de vencimiento o
autenticación **no están implementadas a propósito**: son las tareas de práctica reservadas
para la fábrica.

## Requisitos

- Node.js LTS (22 o superior)
- npm
- Para la fábrica: [Claude Code](https://docs.claude.com/en/docs/claude-code) (`claude`) y git

## Instalación

```bash
npm install
```

## Uso

```bash
npm start      # arranca en http://localhost:3000 (o en el puerto PORT)
npm run dev    # arranca con recarga automática (node --watch)
```

### Endpoints

| Método | Ruta                   | Descripción                                   | Errores |
| ------ | ---------------------- | --------------------------------------------- | ------- |
| GET    | `/health`              | Estado del servicio: `{ "status": "ok" }`     |         |
| POST   | `/tasks`               | Crea una tarea. Cuerpo: `{ "title": "..." }`  | 400     |
| GET    | `/tasks`               | Lista todas las tareas                        |         |
| GET    | `/tasks/:id`           | Devuelve una tarea                            | 404     |
| PATCH  | `/tasks/:id/complete`  | Marca la tarea como completada                | 404     |

Una tarea tiene `id` (uuid), `title` (1-200 caracteres), `completed` (por defecto `false`) y
`createdAt` (ISO 8601). Los errores se devuelven como `{ "error": "mensaje" }`.

```bash
curl -X POST localhost:3000/tasks -H 'Content-Type: application/json' -d '{"title":"Comprar pan"}'
```

## Tests y lint

```bash
npm test        # Vitest + Supertest, tests de integración en tests/
npm run lint    # ESLint (configuración flat en eslint.config.js)
```

## La fábrica en local: `factory.sh`

`factory.sh` encarga una tarea a Claude Code y comprueba que el resultado es válido:

```bash
./factory.sh "Añade DELETE /tasks/:id que borre una tarea y devuelva 204; 404 si no existe"
```

Qué hace:

1. Exige que el árbol de trabajo esté limpio y crea la rama `factory/<fecha-hora>`.
2. Lanza `claude -p` con la tarea, pidiéndole que lea `CLAUDE.md`, en modo
   `--permission-mode dontAsk`, con herramientas limitadas a
   `Read,Edit,Write,Bash(npm test),Bash(npm run lint)` y `--max-turns 30`.
3. Verifica el resultado ejecutando `npm test` y `npm run lint`.
4. Si todo pasa, hace commit en la rama. Si algo falla, reintenta (hasta 3 intentos en total)
   añadiendo a la tarea que el intento anterior falló junto con la salida del error.
5. Informa del resultado final (código de salida 0 si hay éxito, 1 si se agotan los intentos).

Después puedes revisar los cambios con el subagente revisor desde Claude Code:

```
> Usa el subagente revisor para revisar esta rama
```

El revisor (`.claude/agents/revisor.md`) solo puede leer, ejecutar `git diff` y `npm test`, y
responde `APROBADO` o `CAMBIOS NECESARIOS` con una lista concreta de problemas.

## La fábrica en GitHub: `@claude`

El workflow `.github/workflows/claude.yml` usa `anthropics/claude-code-action@v1`:

1. **Configuración (una vez)**: instala la GitHub App de Claude en el repositorio y crea el
   secreto `CLAUDE_CODE_OAUTH_TOKEN` (genéralo con `claude setup-token`) en
   *Settings → Secrets and variables → Actions*.
2. **Pedir trabajo**: escribe `@claude` en una issue (título o cuerpo), en un comentario de una
   issue o PR, o en una revisión de PR, describiendo la tarea.
3. **Ejecución**: la acción arranca Claude Code en un runner, lee `CLAUDE.md`, implementa la
   tarea en una rama y responde en el hilo con el progreso y un enlace para abrir el PR.
4. **Validación**: al abrir el pull request, `.github/workflows/ci.yml` ejecuta `npm ci`,
   `npm run lint` y `npm test` con Node LTS.
5. **Iteración**: si hace falta, comenta en el PR con `@claude` pidiendo cambios y el ciclo se
   repite hasta que la CI esté en verde y la revisión sea positiva.

## Reglas para los agentes

Están en [`CLAUDE.md`](./CLAUDE.md): toda funcionalidad nueva lleva tests, no se termina con
tests o lint en rojo, no se modifican tests existentes para que pasen, rutas en `src/routes` y
lógica en `src/services`, y commits pequeños con mensajes en español.
