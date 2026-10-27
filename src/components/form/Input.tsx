import { View, Text as RNText, TextInput } from 'react-native';
import type { InputComponent } from '../../types/screen';
import type { AppTheme } from '../../theme/theme';
import { useTheme, useThemedStyles } from '../../theme/useTheme';
import { mapStyle, useResolvedStyle } from '../mapStyle';
import { useFormContext } from './FormContext';
import { useFieldStyles } from './fieldStyles';
import { messages } from '../../i18n/messages';

/**
 * Campo de texto. TextInput acepta a la vez estilo de caja y de texto, así
 * que el estilo de la API va completo a la caja, encima del estilo base.
 * El borde de error va al final para que siempre se vea, aunque la API
 * haya definido otro borderColor.
 *
 * Enter (web) o la tecla "Ir" del teclado (teléfono) envían el form por el
 * mismo camino que el botón SUBMIT.
 */
export function Input({ name, inputType, label, placeholder, required, style }: InputComponent) {
  const { values, errors, setValue, submit } = useFormContext();
  const { colors } = useTheme();
  const fieldStyles = useFieldStyles();
  const styles = useThemedStyles(makeStyles);
  const resolved = useResolvedStyle(style);
  const error = errors[name];

  return (
    <View style={fieldStyles.wrapper}>
      <RNText style={fieldStyles.label}>
        {label}{required ? messages.form.requiredMark : ''}
      </RNText>
      <TextInput
        value={values[name] ?? ''}
        onChangeText={(text) => setValue(name, text)}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        secureTextEntry={inputType === 'password'}
        autoCapitalize="none"
        returnKeyType="go"
        onSubmitEditing={() => {
          void submit();
        }}
        style={[fieldStyles.box, styles.input, mapStyle(resolved), error !== undefined && fieldStyles.boxError]}
      />
      {error ? <RNText style={fieldStyles.errorText}>{error}</RNText> : null}
    </View>
  );
}

const makeStyles = (t: AppTheme) => ({
  input: {
    fontSize: t.fontSize.body,
    color: t.colors.text,
  },
});
