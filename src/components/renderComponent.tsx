import type { ScreenComponent } from '../types/screen';
import { Text } from './primitives/Text';
import { Button } from './primitives/Button';
import { Container } from './primitives/Container';
import { Form } from './form/Form';
import { FormGroup } from './form/FormGroup';
import { Input } from './form/Input';
import { Select } from './form/Select';


export function ScreenComponentRenderer({ component }: { component: ScreenComponent }) {
  if (component.type === 'Text') {
    return <Text {...component} />;
  }

  if (component.type === 'Container') {
    return <Container {...component} renderChild={ScreenComponentRenderer} />;
  }

  if (component.type === 'Button') {
    return <Button {...component} />;
  }

  if (component.type === 'Form') {
    return <Form {...component} renderChild={ScreenComponentRenderer} />;
  }

  if (component.type === 'FormGroup') {
    return <FormGroup {...component} renderChild={ScreenComponentRenderer} />;
  }

  if (component.type === 'Input') {
    return <Input {...component} />;
  }

  if (component.type === 'Select') {
    return <Select {...component} />;
  }

  throw new Error(`Tipo de componente no soportado: ${(component as ScreenComponent).type}`);
}