# Lo que cambia en cada proyecto

La aplicación base es igual para todos los clientes. Un proyecto nuevo solo
toca esto:

**En la app**

1. `app.config.js`: `name`, `slug`, `PACKAGE`, íconos (`assets/`), `projectId`
   de EAS y `owner`.
2. `src/project/brand.ts`: colores de marca (claro y oscuro).
3. `src/project/functions.ts`: funciones propias del cliente para la acción
   `CALL`.
4. `eas.json` y `.env`: URL del API del cliente.

**En el backend** (`api/base_movil/`)

5. `src/app_config.php`: pantalla inicial, timeout, precarga y los demás
   parámetros de la app.
6. `src/app_screens.php`: las pantallas del cliente y `PANTALLAS_OFFLINE`.

Regla: si algo sirve a más de un proyecto, va en la base (fuera de
`src/project/`) y se actualiza la base. Si es de un solo cliente, va aquí.
