# Deuda técnica — aplicacion_base

Última actualización: 20/10/2026 (cierre del Prototipo #4).

Este archivo registra lo que se dejó pendiente a propósito, las decisiones
conscientes y lo que ya se resolvió. Nada de lo pendiente bloquea los
criterios de los prototipos entregados.

---

## Pendiente

### Funcionalidad

- **Captura offline con sincronización** (fuera del #4 y del #5).
  Hoy sin red se pueden VER pantallas (caché), pero no ENVIAR formularios.
  Falta: guardar en el teléfono lo que el usuario envía sin red (cola de
  envíos, probablemente SQLite), enviarlo al recuperar la señal y evitar
  duplicados en el backend (id generado en el teléfono).
  Prioritario para Aguaban (lecturas en campo).
- **`guarda_registro` no persiste nada**: valida y navega. El nombre promete
  más de lo que hace. Cuando persista:
  - `valida_valores` debe devolver `errors` por campo (errores del usuario),
    no `errores->error` (errores del sistema).
  - Guardar solo los campos que están en `reglas_campos`, nunca
    `$body['values']` completo.
- **Pantallas fijas en el PHP** (`app_screens`). Para Aguaban u otro cliente,
  sacarlas a configuración por cliente (tabla o archivos). El formato del
  JSON no cambia.
- **Indicador de "versión guardada"**: sin red, la app muestra la última
  versión de la pantalla, pero no avisa al usuario que no está actualizada.

### Sesión y seguridad

- **Sin refresh token.** El token dura 8 h; al vencer, el usuario vuelve a
  login. Para una jornada en campo sin señal hay que definir duración o
  refresh token.
- **Sin límite de intentos de login.** Se pueden probar contraseñas sin
  freno. Propuesta: contador por IP o por usuario.
- **Logout sin red**: el token se borra del teléfono, pero no queda revocado
  en el servidor (vence solo en 8 h).
- **Limpieza de `base_movil_token_revocado`**: la tabla crece sin límite.
  Falta borrar filas con `expira < NOW()`. En local, PHP y MySQL están en
  zonas horarias distintas (en producción coinciden): tenerlo en cuenta.
- **Token en localStorage en la web.** Lo puede leer cualquier script de la
  página. Aceptado porque la web es solo vista previa; en móvil va en
  SecureStore.
- **CORS con `*`.** No expone sesión (token Bearer, sin cookies), pero se
  puede restringir a `https://base-movil.ivitec.mx` (manteniendo
  `http://localhost:8081` para desarrollo).
- **Contraseñas en texto plano en `adm_usuario` y compartidas entre
  sistemas.** Decisión de la empresa. Propuesta: `password_hash` +
  restablecimiento; como paso intermedio, cifrado AES reversible. Nunca MD5.

### Backend

- **El 403 está manejado en la app, pero el backend no lo produce** porque
  no hay roles ni permisos.
- **`require_once` manual de `api/base_movil/src/`.** El namespace no está
  en PSR-4; registrarlo si crecen las clases.

### Caché

- **Valores de TTL de prueba** (detalle 30 s, home 60 s). Definir los de
  producción por pantalla en el backend.
- **En la web el caché offline no sobrevive a recargar la página**: el
  navegador necesita descargar la app. En el APK sí funciona.

### Estilos (Prototipo #5)

- Los estilos del backend se aplican sin validar cada propiedad.
- Falta modo oscuro (el color del texto del input ya es explícito desde el
  tema para facilitarlo).

---

## Decisiones conscientes

- **TTL = frescura, no disponibilidad.** Con red, una pantalla vencida se
  vuelve a pedir. Sin red, se usa la última versión guardada aunque haya
  vencido. Los errores en que el servidor sí respondió (401, 404, 500) no se
  tapan con caché.
- **Con caché, un cambio en el PHP tarda hasta el TTL** de esa pantalla en
  verse en la app (con red).
- **El caché guarda el JSON crudo** y se vuelve a parsear al leerlo: un caché
  viejo nunca se usa sin validar.
- **Las entradas vencidas no se borran**: con red se refrescan; sin red se
  usan como respaldo. El logout limpia todo el caché excepto login (es
  pública).
- **La acción CALL se adelantó al #2** a pedido de Martín (no estaba en el
  alcance del PDF).

---

## Resuelto

### Prototipo #4
- `useScreen` sin manejo de errores ("Cargando..." eterno) → estados
  loading/ready/error + `ErrorScreen` con Reintentar.
- `client.ts` sin `response.ok` ni timeout → `ApiError` (network, timeout,
  http, invalid_response) y timeout de 15 s.
- Backend respondía errores con HTTP 200 → códigos reales (400, 401, 404,
  500) con el mismo cuerpo `{error, mensaje}`.
- Sin sesión se respondía la pantalla login → 401; la app cierra sesión
  (token + caché) y navega a login.
- Errores de acciones invisibles → `handleActionError` (alerta; 401 → login).
- Componente desconocido tumbaba la pantalla → nodo `Unknown` + fallback.
- Errores de render → `ErrorBoundary`.
- Sin caché → caché de pantallas con TTL definido por el backend
  (AsyncStorage).
- Logout sin red no navegaba → termina en el formulario de login.

### Prototipo #3
- Texto invisible en los inputs con el teléfono en modo oscuro → color
  explícito desde el tema.
- El logout no borraba el token si fallaba la red.
- Relación `base_movil_token_revocado.adm_usuario_id` → `adm_usuario`.