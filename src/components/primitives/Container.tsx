import { View, StyleSheet } from 'react-native';
import type { ContainerComponent, RenderChild } from '../../types/screen';
import { mapStyle } from '../mapStyle';

interface Props extends ContainerComponent {
  renderChild: RenderChild;
}

export function Container({ children, style, renderChild: RenderChild }: Props) {
  return (
    <View style={[styles.container, mapStyle(style)]}>
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