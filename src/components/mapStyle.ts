import type { ViewStyle, TextStyle } from 'react-native';
import type { ComponentStyle } from '../types/screen';

/**
 * Traduce el ComponentStyle del JSON a un objeto de estilo de React Native.
 * Centralizar esto aquí es lo que permite, en el Prototipo #5, pasar de
 * "estilos básicos definidos en la app" a "estilos personalizados desde la
 * API" sin tocar los componentes que lo consumen.
 *
 * Nota importante frente a la versión web: React Native NO entiende CSS.
 * No hay `px`, los tamaños son números "unidad-independiente de densidad"
 * (dp), y varias propiedades (p. ej. `boxShadow`) simplemente no existen
 * — hay que usar sus equivalentes nativos si se necesitan más adelante.
 */
export function mapStyle(style?: ComponentStyle): ViewStyle & TextStyle {
  if (!style) return {};

  return {
    color: style.color,
    backgroundColor: style.backgroundColor,
    fontSize: style.fontSize,
    fontWeight: style.fontWeight,
    padding: style.padding,
    margin: style.margin,
    borderRadius: style.borderRadius,
    gap: style.gap,
    flexDirection: style.flexDirection,
    alignItems: style.alignItems,
    justifyContent: style.justifyContent,
    width: style.width as ViewStyle['width'],
    height: style.height as ViewStyle['height'],
  };
}
