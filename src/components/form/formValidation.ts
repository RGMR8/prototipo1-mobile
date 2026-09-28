import type { ScreenComponent, SelectOption } from '../../types/screen';
import { messages } from '../../i18n/messages';

export interface FieldRule {
  name: string;
  required: boolean;
  options?: SelectOption[]; // solo Select: el valor debe ser una opción válida
}

/** Recorre el árbol de hijos del Form y extrae los campos con sus reglas. */
export function collectFields(children: ScreenComponent[]): FieldRule[] {
  const fields: FieldRule[] = [];
  for (const child of children) {
    if (child.type === 'Input') {
      fields.push({ name: child.name, required: child.required === true });
      continue;
    }
    if (child.type === 'Select') {
      fields.push({ name: child.name, required: child.required === true, options: child.options });
      continue;
    }
    if (child.type === 'Container' || child.type === 'FormGroup') {
      fields.push(...collectFields(child.children));
    }
  }
  return fields;
}
/** Devuelve { name: mensaje } por cada campo inválido. Vacío = formulario válido. */
export function validateFields(fields: FieldRule[], values: Record<string, string>): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    const value = (values[field.name] ?? '').trim();
    if (field.required && value === '') {
      errors[field.name] = messages.form.requiredField;
      continue;
    }
    if (field.options && value !== '' && !field.options.some((o) => o.value === value)) {
      errors[field.name] = messages.form.invalidOption;
    }
  }
  return errors;
}