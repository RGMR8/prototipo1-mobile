import { useState } from 'react';
import { View, Text as RNText, Pressable, Modal, ScrollView, StyleSheet } from 'react-native';
import type { SelectComponent } from '../../types/screen';
import { mapStyle } from '../mapStyle';
import { theme } from '../../theme/theme';
import { useFormContext } from './FormContext';
import { fieldStyles } from './fieldStyles';
import { messages } from '../../i18n/messages';

/**
 * Select multiplataforma hecho con primitivas de RN (sin librerías):
 * funciona igual en web y en el APK, y no requiere módulos nativos.
 */
export function Select({ name, label, options, placeholder, required, style }: SelectComponent) {
  const { values, errors, setValue } = useFormContext();
  const [open, setOpen] = useState(false);
  const error = errors[name];
  const selected = options.find((option) => option.value === values[name]);

  return (
    <View style={fieldStyles.wrapper}>
      <RNText style={fieldStyles.label}>
        {label}{required ? messages.form.requiredMark : ''}
      </RNText>

      <Pressable
        onPress={() => setOpen(true)}
        style={[fieldStyles.box, error !== undefined && fieldStyles.boxError, mapStyle(style)]}
      >
        <RNText style={[styles.value, selected === undefined && styles.placeholder]}>
          {selected ? selected.label : placeholder ?? messages.form.selectPlaceholder}
        </RNText>
      </Pressable>

      {error ? <RNText style={fieldStyles.errorText}>{error}</RNText> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        {/* Tocar fuera de la lista cierra el modal */}
        <Pressable onPress={() => setOpen(false)} style={styles.overlay}>
          <View style={styles.sheet}>
            <ScrollView>
              {options.map((option) => (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    setValue(name, option.value);
                    setOpen(false);
                  }}
                  style={styles.option}
                >
                  <RNText style={[styles.optionText, option.value === values[name] && styles.optionSelected]}>
                    {option.label}
                  </RNText>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  value: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text,
  },
  placeholder: {
    color: theme.colors.placeholder,
  },
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    maxHeight: theme.field.modalMaxHeight,
  },
  option: {
    padding: theme.field.optionPadding,
    borderBottomWidth: theme.field.borderWidth,
    borderBottomColor: theme.colors.divider,
  },
  optionText: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.regular,
  },
  optionSelected: {
    fontWeight: theme.fontWeight.bold,
  },
});