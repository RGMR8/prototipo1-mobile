import { View, Text as RNText } from 'react-native';
import type { ScreenDefinition } from '../types/screen';
import { ScreenComponentRenderer } from './renderComponent';

/** Punto de entrada: renderiza una pantalla completa ya parseada. */
export function ScreenRenderer({ screen }: { screen: ScreenDefinition }) {
  return (
    <View>
      <RNText style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 12 }}>
        {screen.title}
      </RNText>
      {screen.components.map((component) => (
        <ScreenComponentRenderer key={component.id} component={component} />
      ))}
    </View>
  );
}
