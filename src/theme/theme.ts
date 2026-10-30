/**
 * Tema de la app: fuente única de colores, espaciados, tipografía y radios.
 *
 * Los componentes NO escriben valores sueltos ('#D32F2F', padding: 10...):
 * los toman de aquí. Cambiar el aspecto de la app = cambiar este archivo.
 *
 * #5: hay dos paletas, clara y oscura, con las mismas claves. Los colores
 * NO se importan directo: se leen con useTheme(), que devuelve la paleta
 * del modo del teléfono. Lo demás (espaciados, tipografía…) no cambia con
 * el modo y se puede usar directo desde `theme`.
 *
 * #6: los colores de marca (primary, onPrimary) son de cada proyecto y
 * vienen de src/project/brand.ts. El resto de la paleta es de la base.
 *
 * Los estilos que manda el backend (campo `style` del JSON) se aplican
 * encima de estos estilos base y los sobrescriben.
 */

import { brand } from '../project/brand';

export type ColorScheme = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  placeholder: string;
  border: string;
  divider: string;
  error: string;
  primary: string;
  onPrimary: string;
  overlay: string;
}

export const lightColors: ThemeColors = {
  background: '#FFFFFF',
  surface: '#FFFFFF',
  text: '#000000',
  textSecondary: '#555555',
  placeholder: '#999999',
  border: '#CCCCCC',
  divider: '#EEEEEE',
  error: '#D32F2F',
  primary: brand.light.primary,
  onPrimary: brand.light.onPrimary,
  overlay: 'rgba(0, 0, 0, 0.4)',
};

export const darkColors: ThemeColors = {
  background: '#121212',
  surface: '#1E1E1E',
  text: '#F5F5F5',
  textSecondary: '#B3B3B3',
  placeholder: '#7A7A7A',
  border: '#3D3D3D',
  divider: '#2A2A2A',
  error: '#EF5350',
  primary: brand.dark.primary,
  onPrimary: brand.dark.onPrimary,
  overlay: 'rgba(0, 0, 0, 0.6)',
};

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

/** Tokens que no dependen del modo: se pueden usar en StyleSheet.create directo. */
export const theme = { spacing, radius, fontSize, fontWeight, opacity, field } as const;

/** Tema completo de un modo: tokens + su paleta. Lo devuelve useTheme(). */
export interface AppTheme {
  scheme: ColorScheme;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  fontSize: typeof fontSize;
  fontWeight: typeof fontWeight;
  opacity: typeof opacity;
  field: typeof field;
}

export const lightTheme: AppTheme = { scheme: 'light', colors: lightColors, ...theme };
export const darkTheme: AppTheme = { scheme: 'dark', colors: darkColors, ...theme };
