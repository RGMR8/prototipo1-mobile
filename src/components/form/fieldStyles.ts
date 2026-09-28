import { StyleSheet } from 'react-native';
import { theme } from '../../theme/theme';

/**
 * Estilos compartidos por los campos de formulario (Input, Select).
 * Antes estaban copiados en ambos componentes: label, caja con borde,
 * borde de error y mensaje de error.
 */
export const fieldStyles = StyleSheet.create({
  wrapper: {
    gap: theme.spacing.xs,
  },
  label: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.bold,
  },
  box: {
    borderWidth: theme.field.borderWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    padding: theme.field.padding,
  },
  boxError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: theme.fontSize.caption,
  },
});