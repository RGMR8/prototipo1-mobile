import type { ColorScheme } from '../../theme/theme';

/**
 * Estilos base del mapa (#5). OpenFreeMap: gratuito, sin API key y con uso
 * comercial permitido. La atribución la dibuja MapLibre en el mapa.
 * Hay uno por modo para que el mapa siga el modo claro/oscuro del teléfono.
 */
export const MAP_STYLE_URLS: Record<ColorScheme, string> = {
  light: 'https://tiles.openfreemap.org/styles/liberty',
  dark: 'https://tiles.openfreemap.org/styles/liberty',
};
