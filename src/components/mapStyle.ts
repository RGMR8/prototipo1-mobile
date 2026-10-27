import type { TextStyle, ViewStyle } from 'react-native';
import type { BaseStyle, ComponentStyle } from '../types/screen';
import type { ColorScheme } from '../theme/theme';
import { useTheme } from '../theme/useTheme';
import { isStyleKey, STYLE_SPEC } from '../style/styleSpec';

/**
 * Estilo de la API ya resuelto para el modo actual del teléfono (#5):
 * en modo oscuro, el bloque `dark` se aplica encima del estilo base.
 * Los componentes llaman a este hook y pasan el resultado a mapStyle o
 * splitStyle.
 */
export function useResolvedStyle(style?: ComponentStyle): BaseStyle | undefined {
  const { scheme } = useTheme();
  return resolveStyle(style, scheme);
}

/** Versión sin hook de useResolvedStyle: base + `dark` si el modo es oscuro. */
export function resolveStyle(style: ComponentStyle | undefined, scheme: ColorScheme): BaseStyle | undefined {
  if (!style) return undefined;
  const { dark, ...base } = style;
  if (scheme !== 'dark' || dark === undefined) return base;
  return { ...base, ...dark };
}

/**
 * Convierte un estilo de la API en un estilo de React Native.
 *
 * Las propiedades ya tienen nombres y valores de React Native (el parser
 * las validó), así que no hay traducción: solo se copian las del
 * vocabulario que vienen definidas. Esto importa: React Native, al combinar
 * estilos en un array, deja que una clave con `undefined` pise el valor
 * base del tema (por ejemplo, el padding de la caja de un campo).
 *
 * React Native NO entiende CSS: no hay `px` (los tamaños son dp) y el
 * estilo no se hereda; un color en un Container no llega a sus Text.
 */
export function mapStyle(style?: BaseStyle): ViewStyle & TextStyle {
  if (!style) return {};
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(style)) {
    if (!isStyleKey(key) || value === undefined) continue;
    result[key] = value;
  }
  return result as ViewStyle & TextStyle;
}

/**
 * Separa el estilo en la parte de texto (color, fontSize, textAlign…) y la
 * del contenedor (fondo, borde, padding…), según el campo `text` de cada
 * regla en styleSpec. Lo usan los componentes que tienen una caja con un
 * texto adentro (Button, Select), para que cada parte reciba lo suyo.
 */
export function splitStyle(style?: BaseStyle): { container: BaseStyle; text: BaseStyle } {
  const container: Record<string, unknown> = {};
  const text: Record<string, unknown> = {};
  if (!style) return { container, text };
  for (const [key, value] of Object.entries(style)) {
    if (!isStyleKey(key) || value === undefined) continue;
    if (STYLE_SPEC[key].text) {
      text[key] = value;
      continue;
    }
    container[key] = value;
  }
  return { container: container as BaseStyle, text: text as BaseStyle };
}
