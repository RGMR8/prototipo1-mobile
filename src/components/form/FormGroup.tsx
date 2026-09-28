import { View, Text as RNText, StyleSheet } from 'react-native';
import type { FormGroupComponent, ScreenComponent,ContainerComponent, RenderChild } from '../../types/screen';
import { theme } from '../../theme/theme';
import { mapStyle } from '../mapStyle';

interface Props extends FormGroupComponent {
  renderChild: RenderChild;
}

/** Solo agrupación visual: no tiene estado, el estado vive en el Form. */
export function FormGroup({ label, children, style, renderChild: RenderChild }: Props) {
  return (
    <View style={[{ flexDirection: 'column', gap: 8 }, mapStyle(style)]}>
      {label ? <RNText style={{ fontSize: 16, fontWeight: 'bold' }}>{label}</RNText> : null}
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
  },
});