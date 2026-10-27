import { useState } from 'react';
import { TouchableOpacity, Text as RNText, StyleSheet } from 'react-native';
import type { ButtonComponent } from '../../types/screen';
import { mapStyle, splitStyle } from '../mapStyle';
import { executeAction } from '../../actions/executeAction';
import { useNavigation } from '../../navigation/NavigationContext';
import { useOptionalFormContext } from '../form/FormContext';
import { handleActionError } from '../../errors/handleActionError';
import { theme } from '../../theme/theme';

/**
 * En React Native no existe <button>: se usa un TouchableOpacity
 * envolviendo un <Text>. El estilo de la API se separa con splitStyle:
 * las claves de texto (color, fontSize, textAlign…) van al Text y el
 * resto (fondo, borde, padding…) al contenedor.
 */
export function Button({ label, style, action }: ButtonComponent) {
  const { navigate, resetTo } = useNavigation();
  const form = useOptionalFormContext();
  const [busy, setBusy] = useState(false);

  const { container, text } = splitStyle(style);

  const handlePress = async () => {
    if (!action || busy) return;
    setBusy(true);
    try {
      await executeAction(action, { navigate, resetTo, form });
    } catch (error) {
      await handleActionError(error, resetTo);
    } finally {
      setBusy(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={!action || busy}
      style={[mapStyle(container), busy && styles.busy]}
    >
      <RNText style={mapStyle(text)}>{label}</RNText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  busy: {
    opacity: theme.opacity.busy,
  },
});