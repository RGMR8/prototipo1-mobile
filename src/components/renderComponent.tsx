import type { ScreenComponent } from '../types/screen';
import { Text } from './primitives/Text';
import { Button } from './primitives/Button';
import { Container } from './primitives/Container';

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

  throw new Error(`Tipo de componente no soportado: ${(component as ScreenComponent).type}`);
}