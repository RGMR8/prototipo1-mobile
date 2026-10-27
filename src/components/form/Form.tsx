import { useCallback, useMemo, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import type { FormComponent, RenderChild, ScreenComponent, SubmitAction } from '../../types/screen';
import { mapStyle, useResolvedStyle } from '../mapStyle';
import { FormContext, type FormContextValue } from './FormContext';
import { collectFields, validateFields } from './formValidation';
import { executeAction } from '../../actions/executeAction';
import { handleActionError } from '../../errors/handleActionError';
import { useNavigation } from '../../navigation/NavigationContext';
import { theme } from '../../theme/theme';

interface Props extends FormComponent {
  renderChild: RenderChild;
}

export function Form({ children, style, renderChild: RenderChild }: Props) {
  const { navigate, resetTo } = useNavigation();
  const resolved = useResolvedStyle(style);
  const fields = useMemo(() => collectFields(children), [children]);
  const defaultSubmit = useMemo(() => findSubmitAction(children), [children]);

  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((f) => [f.name, '']))
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  // El estado se actualiza en el siguiente render; el ref corta en el acto
  // un segundo envío (ej. Enter y clic casi al mismo tiempo).
  const submittingRef = useRef(false);

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

  const setServerErrors = useCallback((serverErrors: Record<string, string>) => {
    setErrors(serverErrors);
  }, []);

  const submit = useCallback(
    async (action?: SubmitAction) => {
      const target = action ?? defaultSubmit;
      if (target === null || submittingRef.current) return;
      submittingRef.current = true;
      setSubmitting(true);
      try {
        await executeAction(target, {
          navigate,
          resetTo,
          form: { values, validate, setServerErrors },
        });
      } catch (error) {
        await handleActionError(error, resetTo);
      } finally {
        submittingRef.current = false;
        setSubmitting(false);
      }
    },
    [defaultSubmit, navigate, resetTo, values, validate, setServerErrors]
  );

  const ctx = useMemo<FormContextValue>(
    () => ({ values, errors, setValue, validate, setServerErrors, submit, submitting }),
    [values, errors, setValue, validate, setServerErrors, submit, submitting]
  );

  return (
    <FormContext.Provider value={ctx}>
      <View style={[styles.form, mapStyle(resolved)]}>
        {children.map((child) => (
          <RenderChild key={child.id} component={child} />
        ))}
      </View>
    </FormContext.Provider>
  );
}

/**
 * Primer botón SUBMIT del form, buscando también dentro de Container y
 * FormGroup. Es la acción que dispara el Enter de un Input. null si el
 * form no tiene botón de envío (el Enter entonces no hace nada).
 */
function findSubmitAction(components: ScreenComponent[]): SubmitAction | null {
  for (const component of components) {
    if (component.type === 'Button' && component.action?.type === 'SUBMIT') {
      return component.action;
    }
    if ('children' in component) {
      const found = findSubmitAction(component.children);
      if (found !== null) return found;
    }
  }
  return null;
}

const styles = StyleSheet.create({
  form: {
    flexDirection: 'column',
    gap: theme.spacing.md,
  },
});