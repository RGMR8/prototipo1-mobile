import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../../theme/theme';
import { messages } from '../../i18n/messages';

interface Props {
  originalType: string;
}

/**
 * Se dibuja en lugar de un componente que esta versión de la app no conoce.
 * Discreto a propósito: avisa sin romper el resto de la pantalla.
 */
export function UnknownFallback({ originalType }: Props) {
  return (
    <View style={styles.box}>
      <Text style={styles.text}>{messages.errors.unknownComponent}</Text>
      <Text style={styles.detail}>{originalType}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: theme.field.borderWidth,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    borderRadius: theme.radius.sm,
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  text: {
    fontSize: theme.fontSize.body,
    color: theme.colors.textSecondary,
  },
  detail: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.placeholder,
  },
});