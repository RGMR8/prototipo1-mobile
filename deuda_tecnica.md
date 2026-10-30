# Deuda técnica — aplicacion_base

Última actualización: 30/10/2026 (Prototipo #6 en curso).

Este archivo registra lo que se dejó pendiente a propósito, las decisiones
conscientes y lo que ya se resolvió. Cada pendiente indica en qué prototipo
del plan (#7 a #12) se atiende, si ya tiene uno asignado.

---

## Pendiente

### Prototipo #6 (en curso)

- **Prueba técnica de WireGuard.** Falta el peer de prueba del servidor.
  Riesgo conocido: el proyecto está en Expo SDK 57 / React Native 0.86 (solo
  arquitectura nueva) y `react-native-wireguard-vpn` usa `NativeModules`
  (puente viejo). Depende de la capa de compatibilidad de React Native: es
  lo primero que tiene que responder la prueba. Se hace en una rama aparte.

### Seguridad del backend (decisiones de Martín: afectan al framework compartido)

- **Contraseñas en texto plano o MD5 sin sal** (`encripta_md5` en
  generales). MD5 sin sal se rompe con tablas precalculadas. Propuesta:
  `password_hash` + restablecimiento. Toca `adm_usuario` y el login de todos
  los clientes.
- **La clase `where` del framework no usa consultas preparadas.** El login
  está protegido porque `value()` aplica `addslashes` dentro de comillas
  simples, la conexión es `utf8` y el `sql_mode` de la sesión no incluye
  `NO_BACKSLASH_ESCAPES` (verificado el 29/10/2026). Pero hay caminos que no
  escapan: `comparacion` cuando el filtro llega como arreglo,
  `data_sql_base`, `data_sql_campo`, `condicion_entre` y el `operador` de
  `datos_filtro_especial`.
- **`sql_mode = ''` en la conexión** (`config/database.php`): apaga el modo
  estricto. MySQL no rechaza datos inválidos, los ajusta en silencio (corta
  textos largos, fechas inválidas a `0000-00-00`, texto en número a `0`).
- **MySQL 5.7** en el servidor: sin actualizaciones de seguridad desde
  octubre de 2023.

### Reglas para el API de base_movil (derivadas de lo anterior)

- Todo dato que llega del cliente se valida como texto o número antes de
  tocar un modelo (como hace `app_sesion::login` con `is_string`).
- Los datos del cliente solo entran como **valor** en `filtro` o en
  `registro` de `alta_bd`. Nunca en `filtro_rango`, `filtro_extra`,
  `filtro_especial`, `sql_extra`, ni como clave.
- Largo, tipo y formato de cada campo se validan en el API antes de
  `alta_bd`: con `sql_mode` vacío, MySQL no los rechaza. Aplica desde
  `guarda_registro` y la sincronización (#9).

### Sesión y seguridad de la app (#11)

- **Sin refresh token.** El token dura 8 h (`jwt_duracion` en generales lo
  cambia); al vencer, el usuario vuelve a login.
- **Un token sigue válido hasta 8 h después de dar de baja al usuario.**
  `valida_token` no revisa `adm_usuario.status`. Se resuelve con tokens de
  acceso cortos + refresh token.
- **Sin límite de intentos de login.**
- **Logout sin red**: el token se borra del teléfono, pero no queda revocado
  en el servidor (vence solo).
- **Limpieza de `base_movil_token_revocado`**: la tabla crece sin límite.
  Borrar filas con `expira < NOW()`. En local, PHP y MySQL están en zonas
  horarias distintas.
- **Índice único en `base_movil_token_revocado.jti`**: `esta_revocado`
  consulta en cada petición autenticada; sin índice se vuelve lenta. Sin
  índice único, dos logouts simultáneos pueden insertar el mismo `jti`.
- **Errores de `app_sesion` sin `http_code`**: el router responde 500 a
  errores que son del cliente (ej. body sin `values` → debería ser 400).
- **CORS con `*`.** Restringir a `https://base-movil.ivitec.mx` (mantener
  `http://localhost:8081` para desarrollo).
- **Token en localStorage en la web.** Aceptado: la web es solo vista previa.
- **`npm audit`**: vulnerabilidades en herramientas de compilación de Expo
  (no viajan en el APK). `npm audit fix` sin `--force`, en un commit aparte.

### Datos guardados en el teléfono

- **El caché de pantallas (AsyncStorage) no está cifrado.** Protegido por el
  aislamiento de Android y sin respaldos (`allowBackup: false`), pero legible
  en un teléfono con root. Regla: las pantallas son estructura; una pantalla
  con datos delicados va con `ttl 0` y fuera de `PANTALLAS_OFFLINE`. Los
  datos de negocio van a SQLite (#9), donde se decide si se cifra.
- **Sin conexión, la vigencia la decide el reloj del teléfono.** Mitigado en
  el #6 (reloj atrasado), pero un cierre de sesión o una baja hechos en el
  servidor no se enteran hasta que vuelve la red. Límite propio de cualquier
  app que trabaja sin conexión.
- **Un teléfono con la hora mal (más de 5 min atrasada) no puede trabajar
  sin conexión**: se trata como reloj atrasado. Con red funciona normal.

### Funcionalidad

- **Captura sin conexión con sincronización** (#9): SQLite, cola de
  pendientes, id generado en el teléfono para no duplicar.
- **`guarda_registro` no persiste nada** (#9). Cuando persista:
  `valida_valores` debe devolver `errors` por campo (errores del usuario),
  no `errores->error`; guardar solo los campos de `reglas_campos`, nunca
  `$body['values']` completo.
- **Descarga de la zona del mapa sin conexión** (#9): código escrito y
  guardado, sin integrar. Hoy el mapa base sin red depende del caché propio
  de MapLibre.
- **Indicador de "sin conexión, mostrando datos guardados"** (#7).
- **Ubicación del usuario en vivo en el mapa** (#7).
- **Marcadores del mapa fijos en PHP** (`marcadores_demo`): pasar a tabla
  con modelo en `orm/` cuando haya datos reales.
- **Pantallas escritas a mano en PHP** (`app_screens`).

### Backend

- **El 403 está manejado en la app, pero el backend no lo produce** (no hay
  roles ni permisos).
- **`require_once` manual de `api/base_movil/src/`.** Registrar el namespace
  en PSR-4 si crecen las clases.

### Caché

- **Valores de TTL de prueba** (detalle 30 s, home 60 s, configuración
  300 s). Definir los de producción en el backend.
- **En la web el caché no sobrevive a recargar la página.** En el APK sí.

### Calidad

- **`useScreen` registra el 401 como `console.error`** aunque es esperado
  (la app va a login).

---

## Decisiones conscientes

- **El backend decide; la app ejecuta.** Pantallas, estilos y configuración
  vienen de la API. En el dispositivo solo va lo que no puede venir de ella:
  el acceso al hardware, la configuración de WireGuard (sin túnel no hay
  backend) y la identidad de la app (nombre, ícono, colores de marca), que
  se usa aunque el servidor no responda.
- **La configuración es pública** (`configuracion_app` se pide antes del
  login): nunca lleva nada sensible.
- **La configuración se refresca al arrancar (si venció su `ttl`) y en cada
  login.** La precarga espera ese refresco para decidir con el valor nuevo.
- **JSON del protocolo en inglés** (`screenId`, `parameters`,
  `offlinePrecache`); métodos PHP en español.
- **TTL = frescura, no disponibilidad.** Con red, una pantalla vencida se
  vuelve a pedir. Sin red, se usa la última versión guardada. Los errores en
  que el servidor sí respondió (401, 404, 500) no se tapan con caché.
- **El caché guarda el JSON crudo** y se vuelve a parsear al leerlo.
- **El logout limpia todo el caché excepto login** (es pública).
- **El login siempre requiere conexión.** Sin conexión, la app se usa
  mientras el token no haya vencido.
- **Precarga sin conexión** (`PANTALLAS_OFFLINE`): después del login se
  descargan las pantallas de campo aunque el usuario no las haya abierto. Se
  puede apagar por proyecto con `offlinePrecache`.
- **La acción CALL se adelantó al #2** a pedido de Martín.
- **Variante de desarrollo con `http` permitido**; la normal exige HTTPS.

---

## Resuelto

### Prototipo #6 (hasta ahora)
- App de desarrollo con paquete propio (`.dev`): `app.config.js` con
  `APP_VARIANT`. Conviven las dos apps en el teléfono.
- Configuración general desde la API (`app_config.php` →
  `src/config/appConfig.ts`): pantalla inicial, timeout de peticiones y
  precarga sin conexión. Guardada para uso sin conexión.
- **Modo oscuro en el APK** (corrección del #5): `app.json` tenía
  `userInterfaceStyle: "light"` y faltaba `expo-system-ui`; solo funcionaba
  en la web.
- `allowBackup: false`: el caché y los datos no se extraen con `adb backup`.
- Reloj atrasado: la sesión sin conexión se trata como vencida si el
  teléfono marca una hora anterior a la última conocida del servidor
  (cabecera `Date`) o al `iat` del token.
- Duración del JWT configurable con `jwt_duracion` en generales (pruebas de
  vencimiento en local).
- `display_errors` apagado en el API: un warning ya no rompe el JSON ni
  muestra rutas del servidor.
- Falla de consulta en el login registrada en el log del servidor (solo el
  mensaje: el detalle puede traer el SQL con la contraseña).
- Ciclo de imports `appConfig` ↔ `client` → `configStore.ts` sin
  dependencias.
- Separación base / proyecto: `src/project/` (colores de marca y funciones
  CALL del cliente) y `src/project/README.md` con lo que cambia en cada
  proyecto.
- `AGENTS.md` describe la arquitectura real (no Expo Router).

### Revisión de seguridad del login (29/10/2026)
- Inyección SQL en el login: protegido (ver condiciones arriba).
- `$_SESSION` en `revoca_token`: sin riesgo, el API no inicia sesión PHP.
- El detalle de las excepciones no sale al cliente (el router solo responde
  `mensaje_limpio`).

### Modo sin conexión (después del #5)
- Precarga de pantallas después del login (`pantallas_offline`).
- Vigencia de la sesión sin conexión leída del `exp` del token; sesión
  vencida sin red se trata como 401.

### Prototipo #5
- Estilos desde la API validados por propiedad (`styleSpec.ts`): propiedad
  desconocida se ignora, valor inválido da error con la ruta.
- Paletas clara y oscura con `useTheme` / `useThemedStyles`.
- Mapa con MapLibre y OpenFreeMap, marcadores como capa.
- Primer toque con el teclado abierto y Enter que no enviaba.

### Prototipo #4
- `useScreen` sin manejo de errores → estados loading/ready/error +
  `ErrorScreen` con Reintentar.
- `client.ts` sin `response.ok` ni timeout → `ApiError` y timeout.
- Backend respondía errores con HTTP 200 → códigos reales.
- Sin sesión → 401; la app cierra sesión y navega a login.
- Errores de acciones invisibles → `handleActionError`.
- Componente desconocido → nodo `Unknown` + fallback.
- Errores de render → `ErrorBoundary`.
- Caché de pantallas con TTL definido por el backend.
- Logout sin red termina en el formulario de login.

### Prototipo #3
- Texto invisible en los inputs en modo oscuro → color explícito del tema.
- El logout no borraba el token si fallaba la red.
- Relación `base_movil_token_revocado.adm_usuario_id` → `adm_usuario`.
