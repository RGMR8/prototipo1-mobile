/**
 * Textos de interfaz que define la app (no el backend).
 *
 * Solo van aquí los textos que ve el usuario. Los mensajes de error
 * internos (parser, throw de tipos no soportados) son para el
 * desarrollador y se quedan junto al código que los lanza.
 */
export const messages = {
  common: {
    loading: 'Cargando...',
  },
  form: {
    requiredMark: ' *',
    requiredField: 'Este campo es obligatorio',
    invalidOption: 'Opción no válida',
    selectPlaceholder: 'Selecciona una opción',
  },
  functions: {
    testTitle: 'Función de prueba',
    testMessage: 'Esta función está escrita en React y la ejecutó el backend desde el JSON.',
  },
  errors: {
    title: 'Algo salió mal',
    retry: 'Reintentar',
    network: 'Sin conexión. Revisa tu internet e inténtalo de nuevo.',
    timeout: 'El servidor tardó demasiado en responder. Inténtalo de nuevo.',
    invalidResponse: 'El servidor envió una respuesta inválida.',
    invalidScreen: 'La pantalla recibida no es válida.',
    http401: 'Tu sesión expiró. Inicia sesión de nuevo.',
    http403: 'No tienes permiso para realizar esta acción.',
    http404: 'No encontramos lo que buscabas.',
    http500: 'Ocurrió un error en el servidor. Inténtalo más tarde.',
    unknown: 'Ocurrió un error inesperado.',
  },
} as const;