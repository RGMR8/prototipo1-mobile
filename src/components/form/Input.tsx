import { View, Text as RNText, TextInput, StyleSheet } from 'react-native';
import type { InputComponent } from '../../types/screen';
import { mapStyle } from '../mapStyle';
import { theme } from '../../theme/theme';
import { useFormContext } from './FormContext';
import { fieldStyles } from './fieldStyles';
import { messages } from '../../i18n/messages';

export function Input({ name, inputType, label, placeholder, required, style }: InputComponent) {
  const { values, errors, setValue } = useFormContext();
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
        style={[fieldStyles.box, styles.input, error !== undefined && fieldStyles.boxError, mapStyle(style)]}
      />
      {error ? <RNText style={fieldStyles.errorText}>{error}</RNText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    fontSize: theme.fontSize.body,
  },
});