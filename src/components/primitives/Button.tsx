import { useState } from 'react';
import { TouchableOpacity, Text as RNText, StyleSheet } from 'react-native';
import type { ButtonComponent } from '../../types/screen';
import { mapStyle } from '../mapStyle';
import { executeAction } from '../../actions/executeAction';
import { useNavigation } from '../../navigation/NavigationContext';
import { useOptionalFormContext } from '../form/FormContext';
import { theme } from '../../theme/theme';

/**
 * En React Native no existe <button>: se usa un TouchableOpacity
 * envolviendo un <Text>. El estilo se separa: las claves de texto
 * (color, fontSize, fontWeight) van al Text y el resto al contenedor.
 * Antes se pasaba el mismo style a ambos y el padding se duplicaba.
 */
export function Button({ label, style, action }: ButtonComponent) {
  const { navigate } = useNavigation();
  const form = useOptionalFormContext();
  const [busy, setBusy] = useState(false);

  const { color, fontSize, fontWeight, ...containerStyle } = style ?? {};

  const handlePress = async () => {
    if (!action || busy) return;
    setBusy(true);
    try {
      await executeAction(action, { navigate, form });
    } finally {
      setBusy(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={!action || busy}
      style={[mapStyle(containerStyle), busy && styles.busy]}
    >
      <RNText style={mapStyle({ color, fontSize, fontWeight })}>{label}</RNText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  busy: {
    opacity: theme.opacity.busy,
  },
});