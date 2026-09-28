import { useCallback, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import type { FormComponent, ScreenComponent,ContainerComponent, RenderChild } from '../../types/screen';
import { mapStyle } from '../mapStyle';
import { FormContext } from './FormContext';
import { collectFields, validateFields } from './formValidation';
import { theme } from '../../theme/theme';

interface Props extends FormComponent {
  renderChild: RenderChild;
}

export function Form({ children, style, renderChild: RenderChild }: Props) {
  const fields = useMemo(() => collectFields(children), [children]);

  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, '']))
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setValue = useCallback((name: string, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    // Al corregir un campo se limpia su error; los demás se mantienen.
    setErrors((prev) => {
      if (!(name in prev)) return prev;
      const { [name]: _removed, ...rest } = prev;
      return rest;
    });
  }, []);

  const validate = useCallback(() => {
    const next = validateFields(fields, values);
    setErrors(next);
    return Object.keys(next).length === 0;
  }, [fields, values]);

  const ctx = useMemo(() => ({ values, errors, setValue, validate }), [values, errors, setValue, validate]);

  return (
    <FormContext.Provider value={ctx}>
      <View style={[styles.form, mapStyle(style)]}>
        {children.map((child) => (
          <RenderChild key={child.id} component={child} />
        ))}
      </View>
    </FormContext.Provider>
  );
}

const styles = StyleSheet.create({
  form: {
    flexDirection: 'column',
    gap: theme.spacing.md,
  },
});