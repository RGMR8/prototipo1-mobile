/**
 * Tema de la app: fuente única de colores, espaciados, tipografía y radios.
 *
 * Los componentes NO escriben valores sueltos ('#D32F2F', padding: 10...):
 * los toman de aquí. Cambiar el aspecto de la app = cambiar este archivo.
 *
 * Esto define los estilos BASE de la app. Los estilos que manda el backend
 * (campo `style` del JSON, vía mapStyle) se aplican encima y los sobrescriben.
 * En el Prototipo #5 (estilos desde la API) este archivo es el punto de partida.
 */

export const colors = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  text: '#000000',
  placeholder: '#999999',
  border: '#CCCCCC',
  divider: '#EEEEEE',
  error: '#D32F2F',
  overlay: 'rgba(0, 0, 0, 0.4)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
} as const;

export const radius = {
  sm: 6,
  md: 8,
} as const;

export const fontSize = {
  caption: 12,
  body: 14,
  subtitle: 16,
  title: 24,
} as const;

export const fontWeight = {
  regular: 'normal',
  bold: 'bold',
} as const;

export const opacity = {
  busy: 0.6,
} as const;

/** Medidas propias de controles de formulario (Input, Select). */
export const field = {
  padding: 10,
  borderWidth: 1,
  optionPadding: 14,
  modalMaxHeight: '70%',
} as const;

export const theme = { colors, spacing, radius, fontSize, fontWeight, opacity, field } as const;