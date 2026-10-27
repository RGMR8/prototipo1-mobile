import type { AppTheme } from '../../theme/theme';
import { useThemedStyles } from '../../theme/useTheme';

/**
 * Estilos compartidos por los campos de formulario (Input, Select):
 * label, caja con borde, borde de error y mensaje de error.
 * #5: dependen del modo claro/oscuro, así que se piden con useFieldStyles().
 */
const makeFieldStyles = (t: AppTheme) => ({
  wrapper: {
    gap: t.spacing.xs,
  },
  label: {
    fontSize: t.fontSize.body,
    fontWeight: t.fontWeight.bold,
    color: t.colors.text,
  },
  box: {
    borderWidth: t.field.borderWidth,
    borderColor: t.colors.border,
    borderRadius: t.radius.sm,
    padding: t.field.padding,
    backgroundColor: t.colors.surface,
  },
  boxError: {
    borderColor: t.colors.error,
  },
  errorText: {
    color: t.colors.error,
    fontSize: t.fontSize.caption,
  },
});

export function useFieldStyles() {
  return useThemedStyles(makeFieldStyles);
}
