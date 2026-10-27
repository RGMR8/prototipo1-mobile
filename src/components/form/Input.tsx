import { View, Text as RNText, TextInput, StyleSheet } from 'react-native';
import type { InputComponent } from '../../types/screen';
import { mapStyle } from '../mapStyle';
import { theme } from '../../theme/theme';
import { useFormContext } from './FormContext';
import { fieldStyles } from './fieldStyles';
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
        placeholderTextColor={theme.colors.placeholder}
        secureTextEntry={inputType === 'password'}
        autoCapitalize="none"
        returnKeyType="go"
        onSubmitEditing={() => {
          void submit();
        }}
        style={[fieldStyles.box, styles.input, mapStyle(style), error !== undefined && fieldStyles.boxError]}
      />
      {error ? <RNText style={fieldStyles.errorText}>{error}</RNText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text,
  },
});