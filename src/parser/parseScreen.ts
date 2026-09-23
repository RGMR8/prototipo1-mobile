import type {
  ScreenDefinition,
  ScreenComponent,
  ComponentStyle,
} from '../types/screen';

/**
 * Error de parseo. Se define esta clase mínima (no un sistema de manejo
 * de errores completo — eso es Prototipo #4) solo para que quien llame
 * a parseScreen() pueda distinguir "el JSON no tiene la forma esperada"
 * de cualquier otro tipo de error.
 */
export class ScreenParseError extends Error {
  constructor(message: string, public readonly path: string) {
    super(`${message} (en ${path})`);
    this.name = 'ScreenParseError';
  }
}

const VALID_COMPONENT_TYPES = ['Text', 'Container', 'Button'] as const;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseStyle(raw: unknown, path: string): ComponentStyle | undefined {
  if (raw === undefined) return undefined;
  if (!isPlainObject(raw)) {
    throw new ScreenParseError('El campo "style" debe ser un objeto', path);
  }
  // Se pasa tal cual: el Prototipo #1 no valida cada propiedad de estilo
  // individualmente, solo que la forma general sea un objeto.
  return raw as ComponentStyle;
}

function parseComponent(raw: unknown, path: string): ScreenComponent {
  if (!isPlainObject(raw)) {
    throw new ScreenParseError('Cada componente debe ser un objeto', path);
  }

  const { type, id } = raw;

  if (typeof id !== 'string' || id.length === 0) {
    throw new ScreenParseError('Falta "id" (string) en el componente', path);
  }

  if (typeof type !== 'string' || !VALID_COMPONENT_TYPES.includes(type as any)) {
    throw new ScreenParseError(
      `"type" debe ser uno de: ${VALID_COMPONENT_TYPES.join(', ')}`,
      path
    );
  }

  const style = parseStyle(raw.style, `${path}.style`);

  if (type === 'Text') {
    if (typeof raw.content !== 'string') {
      throw new ScreenParseError('Falta "content" (string) en Text', path);
    }
    return { type: 'Text', id, content: raw.content, style };
  }

  if (type === 'Button') {
    if (typeof raw.label !== 'string') {
      throw new ScreenParseError('Falta "label" (string) en Button', path);
    }
    return { type: 'Button', id, label: raw.label, style };
  }

  if (type === 'Container') {
    if (!Array.isArray(raw.children)) {
      throw new ScreenParseError('Falta "children" (array) en Container', path);
    }
    const children = raw.children.map((child, index) =>
      parseComponent(child, `${path}.children[${index}]`)
    );
    return { type: 'Container', id, children, style };
  }

  // Inalcanzable en la práctica: VALID_COMPONENT_TYPES ya lo filtró arriba.
  // Se deja como error explícito, no como caso silencioso.
  throw new ScreenParseError(`Tipo de componente no soportado: ${type}`, path);
}


/**
 * Convierte el JSON crudo recibido del backend en un ScreenDefinition tipado.
 * Lanza ScreenParseError si la estructura no coincide con lo esperado.
 */
export function parseScreen(raw: unknown): ScreenDefinition {
  if (!isPlainObject(raw)) {
    throw new ScreenParseError('La raíz del JSON debe ser un objeto', 'root');
  }

  const { screenId, title, components } = raw;

  if (typeof screenId !== 'string') {
    throw new ScreenParseError('Falta "screenId" (string)', 'root');
  }
  if (typeof title !== 'string') {
    throw new ScreenParseError('Falta "title" (string)', 'root');
  }
  if (!Array.isArray(components)) {
    throw new ScreenParseError('Falta "components" (array)', 'root');
  }

  return {
    screenId,
    title,
    components: components.map((c, index) =>
      parseComponent(c, `root.components[${index}]`)
    ),
  };
}
