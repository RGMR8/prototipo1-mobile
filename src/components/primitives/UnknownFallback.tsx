import { View, Text } from 'react-native';
import type { AppTheme } from '../../theme/theme';
import { useThemedStyles } from '../../theme/useTheme';
import { messages } from '../../i18n/messages';

interface Props {
  originalType: string;
}

/**
 * Se dibuja en lugar de un componente que esta versión de la app no conoce.
 * Discreto a propósito: avisa sin romper el resto de la pantalla.
 */
export function UnknownFallback({ originalType }: Props) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.box}>
      <Text style={styles.text}>{messages.errors.unknownComponent}</Text>
      <Text style={styles.detail}>{originalType}</Text>
    </View>
  );
}

const makeStyles = (t: AppTheme) => ({
  box: {
    borderWidth: t.field.borderWidth,
    borderColor: t.colors.border,
    borderStyle: 'dashed' as const,
    borderRadius: t.radius.sm,
    padding: t.spacing.md,
    gap: t.spacing.xs,
  },
  text: {
    fontSize: t.fontSize.body,
    color: t.colors.textSecondary,
  },
  detail: {
    fontSize: t.fontSize.caption,
    color: t.colors.placeholder,
  },
});
