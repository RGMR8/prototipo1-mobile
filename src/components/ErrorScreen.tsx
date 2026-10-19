import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';
import { messages } from '../i18n/messages';

interface Props {
  message: string;
  onRetry: () => void;
}

/**
 * Pantalla de error global: se muestra cuando una pantalla no se pudo
 * obtener (red, timeout, HTTP) o no se pudo dibujar (Error Boundary).
 * Es de la app, no del servidor: tiene que funcionar justo cuando el
 * servidor no está disponible.
 */
export function ErrorScreen({ message, onRetry }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{messages.errors.title}</Text>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity onPress={onRetry} style={styles.button}>
        <Text style={styles.buttonText}>{messages.errors.retry}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.title,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  message: {
    fontSize: theme.fontSize.subtitle,
    color: theme.colors.textSecondary,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: theme.field.padding,
    borderRadius: theme.radius.sm,
    alignItems: 'center',
  },
  buttonText: {
    color: theme.colors.onPrimary,
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.bold,
  },
});