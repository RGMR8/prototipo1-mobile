import { useState } from 'react';
import { TouchableOpacity, Text as RNText } from 'react-native';
import type { ButtonComponent } from '../../types/screen';
import type { AppTheme } from '../../theme/theme';
import { useThemedStyles } from '../../theme/useTheme';
import { mapStyle, splitStyle, useResolvedStyle } from '../mapStyle';
import { executeAction } from '../../actions/executeAction';
import { useNavigation } from '../../navigation/NavigationContext';
import { useOptionalFormContext } from '../form/FormContext';
import { handleActionError } from '../../errors/handleActionError';

/**
 * En React Native no existe <button>: se usa un TouchableOpacity
 * envolviendo un <Text>. El estilo de la API se separa con splitStyle:
 * las claves de texto (color, fontSize, textAlign…) van al Text y el
 * resto (fondo, borde, padding…) al contenedor. El texto lleva el color
 * del tema como base para que se lea en modo oscuro.
 *
 * Un botón SUBMIT no ejecuta la acción por su cuenta: la delega en
 * form.submit, el mismo camino que usa el Enter de un Input. Así el estado
 * de envío es uno solo por form y no hay doble envío.
 */
export function Button({ label, style, action }: ButtonComponent) {
  const { navigate, resetTo } = useNavigation();
  const form = useOptionalFormContext();
  const styles = useThemedStyles(makeStyles);
  const [localBusy, setLocalBusy] = useState(false);

  const isSubmit = action?.type === 'SUBMIT' && form !== null;
  const busy = isSubmit ? form.submitting : localBusy;
  const { container, text } = splitStyle(useResolvedStyle(style));

  const handlePress = async () => {
    if (!action || busy) return;

    if (action.type === 'SUBMIT' && form !== null) {
      await form.submit(action);
      return;
    }

    setLocalBusy(true);
    try {
      await executeAction(action, { navigate, resetTo, form });
    } catch (error) {
      await handleActionError(error, resetTo);
    } finally {
      setLocalBusy(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={!action || busy}
      style={[mapStyle(container), busy && styles.busy]}
    >
      <RNText style={[styles.label, mapStyle(text)]}>{label}</RNText>
    </TouchableOpacity>
  );
}

const makeStyles = (t: AppTheme) => ({
  label: {
    color: t.colors.text,
  },
  busy: {
    opacity: t.opacity.busy,
  },
});