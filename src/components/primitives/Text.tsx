import { Text as RNText } from 'react-native';
import type { TextComponent } from '../../types/screen';
import type { AppTheme } from '../../theme/theme';
import { useThemedStyles } from '../../theme/useTheme';
import { mapStyle, useResolvedStyle } from '../mapStyle';

/**
 * Texto. Lleva el color de texto del tema como base (#5): sin él, en modo
 * oscuro saldría negro sobre fondo oscuro. El estilo de la API va encima.
 */
export function Text({ content, style }: TextComponent) {
  const styles = useThemedStyles(makeStyles);
  const resolved = useResolvedStyle(style);
  return <RNText style={[styles.text, mapStyle(resolved)]}>{content}</RNText>;
}

const makeStyles = (t: AppTheme) => ({
  text: {
    color: t.colors.text,
  },
});