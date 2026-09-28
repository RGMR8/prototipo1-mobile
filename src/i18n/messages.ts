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
} as const;