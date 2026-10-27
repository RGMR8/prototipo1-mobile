import { View, StyleSheet } from 'react-native';
import type { ContainerComponent, RenderChild } from '../../types/screen';
import { mapStyle, useResolvedStyle } from '../mapStyle';

interface Props extends ContainerComponent {
  renderChild: RenderChild;
}

export function Container({ children, style, renderChild: RenderChild }: Props) {
  const resolved = useResolvedStyle(style);
  return (
    <View style={[styles.container, mapStyle(resolved)]}>
      {children.map((child) => (
        <RenderChild key={child.id} component={child} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
});