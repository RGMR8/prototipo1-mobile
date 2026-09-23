import { TouchableOpacity, Text as RNText } from 'react-native';
import type { ButtonComponent } from '../../types/screen';
import { mapStyle } from '../mapStyle';

/**
 * En React Native no existe <button>: el patrón estándar es un contenedor
 * presionable (TouchableOpacity) envolviendo un <Text>. El estilo de fondo/
 * padding/radio va en el TouchableOpacity; el color/tamaño de fuente en el
 * Text interno — por eso se le pasa el mismo `style` a ambos, cada uno
 * toma lo que le aplica.
 *
 * Sin onPress todavía: la ejecución de acciones (NAVIGATE, SUBMIT) es
 * alcance del Prototipo #2.
 */
export function Button({ label, style }: ButtonComponent) {
  return (
    <TouchableOpacity style={mapStyle(style)}>
      <RNText style={mapStyle(style)}>{label}</RNText>
    </TouchableOpacity>
  );
}
