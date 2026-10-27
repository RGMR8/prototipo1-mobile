import { View, Text as RNText, StyleSheet } from 'react-native';
import type { FormGroupComponent, RenderChild } from '../../types/screen';
import { theme } from '../../theme/theme';
import { mapStyle } from '../mapStyle';

interface Props extends FormGroupComponent {
  renderChild: RenderChild;
}

/**
 * Solo agrupación visual: no tiene estado, el estado vive en el Form.
 * El estilo de la API se aplica al grupo, encima del estilo base.
 */
export function FormGroup({ label, children, style, renderChild: RenderChild }: Props) {
  return (
    <View style={[styles.group, mapStyle(style)]}>
      {label ? <RNText style={styles.label}>{label}</RNText> : null}
      {children.map((child) => (
        <RenderChild key={child.id} component={child} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    flexDirection: 'column',
    gap: theme.spacing.sm,
  },
  label: {
    fontSize: theme.fontSize.subtitle,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
});