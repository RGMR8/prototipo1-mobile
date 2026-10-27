import type { TextStyle, ViewStyle } from 'react-native';
import type { ComponentStyle } from '../types/screen';
import { isStyleKey, STYLE_SPEC } from '../style/styleSpec';

/**
 * Convierte el ComponentStyle del JSON en un estilo de React Native (#5).
 *
 * Las propiedades de ComponentStyle ya tienen nombres y valores de React
 * Native (el parser las validó), así que no hay traducción: solo se copian
 * las que vienen definidas. Esto importa: React Native, al combinar estilos
 * en un array, deja que una clave con `undefined` pise el valor base del
 * tema (por ejemplo, el padding de la caja de un campo).
 *
 * React Native NO entiende CSS: no hay `px` (los tamaños son dp) y el
 * estilo no se hereda; un color en un Container no llega a sus Text.
 */
export function mapStyle(style?: ComponentStyle): ViewStyle & TextStyle {
  if (!style) return {};
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(style)) {
    if (value === undefined) continue;
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
export function splitStyle(style?: ComponentStyle): { container: ComponentStyle; text: ComponentStyle } {
  const container: Record<string, unknown> = {};
  const text: Record<string, unknown> = {};
  if (!style) return { container, text };
  for (const [key, value] of Object.entries(style)) {
    if (!isStyleKey(key)) continue;
    if (STYLE_SPEC[key].text) {
      text[key] = value;
      continue;
    }
    container[key] = value;
  }
  return { container: container as ComponentStyle, text: text as ComponentStyle };
}