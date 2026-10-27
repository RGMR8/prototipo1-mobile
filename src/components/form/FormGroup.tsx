import { View, Text as RNText } from 'react-native';
import type { FormGroupComponent, RenderChild } from '../../types/screen';
import type { AppTheme } from '../../theme/theme';
import { useThemedStyles } from '../../theme/useTheme';
import { mapStyle, useResolvedStyle } from '../mapStyle';

interface Props extends FormGroupComponent {
  renderChild: RenderChild;
}

/**
 * Solo agrupación visual: no tiene estado, el estado vive en el Form.
 * El estilo de la API se aplica al grupo, encima del estilo base.
 */
export function FormGroup({ label, children, style, renderChild: RenderChild }: Props) {
  const styles = useThemedStyles(makeStyles);
  const resolved = useResolvedStyle(style);
  return (
    <View style={[styles.group, mapStyle(resolved)]}>
      {label ? <RNText style={styles.label}>{label}</RNText> : null}
      {children.map((child) => (
        <RenderChild key={child.id} component={child} />
      ))}
    </View>
  );
}

const makeStyles = (t: AppTheme) => ({
  group: {
    flexDirection: 'column' as const,
    gap: t.spacing.sm,
  },
  label: {
    fontSize: t.fontSize.subtitle,
    fontWeight: t.fontWeight.bold,
    color: t.colors.text,
  },
});
