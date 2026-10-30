/**
 * Colores de marca de ESTE proyecto (#6).
 *
 * Solo la identidad del cliente: color principal y el color del texto que
 * va encima. El resto de la paleta (fondos, textos, bordes, error) es de la
 * base y está en src/theme/theme.ts. Cada modo (claro/oscuro) tiene su par.
 *
 * Son de la app y no del backend a propósito: se usan en pantallas que deben
 * verse aunque el servidor no responda (error, carga), igual que el ícono y
 * el nombre de app.config.js.
 */
export interface BrandColors {
  primary: string;
  onPrimary: string;
}

export const brand: { light: BrandColors; dark: BrandColors } = {
  light: {
    primary: '#22A45D',
    onPrimary: '#FFFFFF',
  },
  dark: {
    primary: '#22A45D',
    onPrimary: '#FFFFFF',
  },
};
