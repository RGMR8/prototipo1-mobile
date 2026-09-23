import { View } from 'react-native';
import type { ContainerComponent, ScreenComponent } from '../../types/screen';
import { mapStyle } from '../mapStyle';

interface Props extends ContainerComponent {
  // Se recibe como prop en vez de importarse directamente — así Container
  // ya no depende de renderComponent.tsx, y el ciclo desaparece.
  renderChild: (props: { component: ScreenComponent }) => React.JSX.Element;
}

export function Container({ children, style, renderChild: RenderChild }: Props) {
  return (
    <View style={[{ flexDirection: 'column' }, mapStyle(style)]}>
      {children.map((child) => (
        <RenderChild key={child.id} component={child} />
      ))}
    </View>
  );
}