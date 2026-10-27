import { useState } from 'react';
import { View, Text as RNText, Pressable, Modal, ScrollView } from 'react-native';
import type { SelectComponent } from '../../types/screen';
import type { AppTheme } from '../../theme/theme';
import { useThemedStyles } from '../../theme/useTheme';
import { mapStyle, splitStyle, useResolvedStyle } from '../mapStyle';
import { useFormContext } from './FormContext';
import { useFieldStyles } from './fieldStyles';
import { messages } from '../../i18n/messages';

/**
 * Select multiplataforma hecho con primitivas de RN (sin librerías):
 * funciona igual en web y en el APK, y no requiere módulos nativos.
 *
 * Estilo de la API (#5): la parte de contenedor va a la caja y la de texto
 * al valor elegido. El color del placeholder y el borde de error van al
 * final para que siempre se distingan.
 */
export function Select({ name, label, options, placeholder, required, style }: SelectComponent) {
  const { values, errors, setValue } = useFormContext();
  const fieldStyles = useFieldStyles();
  const styles = useThemedStyles(makeStyles);
  const [open, setOpen] = useState(false);
  const error = errors[name];
  const selected = options.find((option) => option.value === values[name]);
  const { container, text } = splitStyle(useResolvedStyle(style));

  return (
    <View style={fieldStyles.wrapper}>
      <RNText style={fieldStyles.label}>
        {label}{required ? messages.form.requiredMark : ''}
      </RNText>

      <Pressable
        onPress={() => setOpen(true)}
        style={[fieldStyles.box, mapStyle(container), error !== undefined && fieldStyles.boxError]}
      >
        <RNText style={[styles.value, mapStyle(text), selected === undefined && styles.placeholder]}>
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

const makeStyles = (t: AppTheme) => ({
  value: {
    fontSize: t.fontSize.body,
    color: t.colors.text,
  },
  placeholder: {
    color: t.colors.placeholder,
  },
  overlay: {
    flex: 1,
    backgroundColor: t.colors.overlay,
    justifyContent: 'center' as const,
    padding: t.spacing.xl,
  },
  sheet: {
    backgroundColor: t.colors.surface,
    borderRadius: t.radius.md,
    maxHeight: t.field.modalMaxHeight,
  },
  option: {
    padding: t.field.optionPadding,
    borderBottomWidth: t.field.borderWidth,
    borderBottomColor: t.colors.divider,
  },
  optionText: {
    fontSize: t.fontSize.body,
    fontWeight: t.fontWeight.regular,
    color: t.colors.text,
  },
  optionSelected: {
    fontWeight: t.fontWeight.bold,
  },
});
