import type { ScreenComponent } from '../types/screen';
import { Text } from './primitives/Text';
import { Button } from './primitives/Button';
import { Container } from './primitives/Container';
import { Form } from './form/Form';
import { FormGroup } from './form/FormGroup';
import { Input } from './form/Input';
import { Select } from './form/Select';

/**
 * Despachador: recibe un componente ya parseado y devuelve el elemento
 * de React que le corresponde según su `type`.
 *
 * - `{...component}` (spread) pasa las propiedades del JSON como props;
 *   TypeScript valida que coincidan con lo que espera cada componente.
 * - `renderChild` recibe la referencia a esta función (no la ejecuta)
 *   para que los contenedores rendericen a sus hijos sin importar este
 *   archivo (evita el ciclo de imports).
 * - Aquí no hay try/catch a propósito: el JSX solo crea una descripción
 *   del elemento; React ejecuta el componente después. Los errores de
 *   render se capturan con un Error Boundary (Prototipo #4) y los de
 *   parseo ya los reporta parseScreen con la ruta del nodo.
 */

export function ScreenComponentRenderer({ component }: { component: ScreenComponent }) {
  if (component.type === 'Text') {
    const text = <Text {...component} />;
    return text;
  }

  if (component.type === 'Container') {
    const container = <Container {...component} renderChild={ScreenComponentRenderer} />;
    return container;
  }

  if (component.type === 'Button') {
    const button = <Button {...component} />;
    return button;
  }

  if (component.type === 'Form') {
    const form = <Form {...component} renderChild={ScreenComponentRenderer} />;
    return form;
  }

  if (component.type === 'FormGroup') {
    const formGroup = <FormGroup {...component} renderChild={ScreenComponentRenderer} />;
    return formGroup;
  }

  if (component.type === 'Input') {
    const input = <Input {...component} />;
    return input;
  }

  if (component.type === 'Select') {
    const select = <Select {...component} />;
    return select;
  }

  throw new Error(`Tipo de componente no soportado: ${(component as ScreenComponent).type}`);
}