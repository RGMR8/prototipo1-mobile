import type {
  ScreenDefinition,
  ScreenComponent,
  ComponentStyle,
  ScreenAction,
  SelectOption,
  SubmitResponse,
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

const VALID_COMPONENT_TYPES = [
  'Text', 'Container', 'Button', 'Form', 'FormGroup', 'Input', 'Select',
] as const;

const VALID_INPUT_TYPES = ['text', 'password'] as const;

/**
 * Contexto que viaja por el árbol durante el parseo.
 * formNames === null  no estamos dentro de un Form.
 * formNames = Set estamos dentro de un Form; guarda los `name` ya usados
 *                       para detectar duplicados (un valor pisaría al otro).
 */
interface ParseContext {
  formNames: Set<string> | null;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function requireString(raw: Record<string, unknown>, field: string, owner: string, path: string): string {
  const value = raw[field];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ScreenParseError(`Falta "${field}" (string) en ${owner}`, path);
  }
  return value;
}

function optionalString(raw: Record<string, unknown>, field: string, path: string): string | undefined {
  const value = raw[field];
  if (value === undefined) return undefined;
  if (typeof value !== 'string') {
    throw new ScreenParseError(`"${field}" debe ser string`, path);
  }
  return value;
}

function optionalBoolean(raw: Record<string, unknown>, field: string, path: string): boolean | undefined {
  const value = raw[field];
  if (value === undefined) return undefined;
  if (typeof value !== 'boolean') {
    throw new ScreenParseError(`"${field}" debe ser boolean`, path);
  }
  return value;
}

function parseStyle(raw: unknown, path: string): ComponentStyle | undefined {
  if (raw === undefined) return undefined;
  if (!isPlainObject(raw)) {
    throw new ScreenParseError('El campo "style" debe ser un objeto', path);
  }
  // Se pasa tal cual: no se valida cada propiedad de estilo
  // individualmente, solo que la forma general sea un objeto.
  return raw as ComponentStyle;
}

function parseAction(raw: unknown, path: string, ctx: ParseContext): ScreenAction | undefined {
  if (raw === undefined) return undefined;
  if (!isPlainObject(raw)) {
    throw new ScreenParseError('"action" debe ser un objeto', path);
  }

  if (raw.type === 'NAVIGATE') {
    return { type: 'NAVIGATE', screenId: requireString(raw, 'screenId', 'NAVIGATE', path) };
  }

  if (raw.type === 'SUBMIT') {
    if (ctx.formNames === null) {
      throw new ScreenParseError('SUBMIT solo puede usarse dentro de un Form', path);
    }
    return { type: 'SUBMIT', method: requireString(raw, 'method', 'SUBMIT', path) };
  }

  throw new ScreenParseError('"action.type" debe ser NAVIGATE o SUBMIT', path);
}

/** Registra el `name` de un campo en su Form. Falla si está fuera de un Form o si se repite. */
function registerFieldName(name: string, owner: string, path: string, ctx: ParseContext): void {
  if (ctx.formNames === null) {
    throw new ScreenParseError(`${owner} debe estar dentro de un Form`, path);
  }
  if (ctx.formNames.has(name)) {
    throw new ScreenParseError(`"name" duplicado en el Form: ${name}`, path);
  }
  ctx.formNames.add(name);
}

function parseOptions(raw: unknown, path: string): SelectOption[] {
  if (!Array.isArray(raw) || raw.length === 0) {
    throw new ScreenParseError('Falta "options" (array no vacío) en Select', path);
  }
  return raw.map((option, index) => {
    const optionPath = `${path}.options[${index}]`;
    if (!isPlainObject(option)) {
      throw new ScreenParseError('Cada opción debe ser un objeto', optionPath);
    }
    return {
      value: requireString(option, 'value', 'la opción', optionPath),
      label: requireString(option, 'label', 'la opción', optionPath),
    };
  });
}

function parseChildren(
  raw: Record<string, unknown>,
  owner: string,
  path: string,
  ctx: ParseContext
): ScreenComponent[] {
  if (!Array.isArray(raw.children)) {
    throw new ScreenParseError(`Falta "children" (array) en ${owner}`, path);
  }
  return raw.children.map((child, index) =>
    parseComponent(child, `${path}.children[${index}]`, ctx)
  );
}

function parseComponent(raw: unknown, path: string, ctx: ParseContext): ScreenComponent {
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
    const action = parseAction(raw.action, `${path}.action`, ctx);
    return { type: 'Button', id, label: raw.label, action, style };
  }

  if (type === 'Container') {
    return { type: 'Container', id, children: parseChildren(raw, 'Container', path, ctx), style };
  }

  if (type === 'Form') {
    if (ctx.formNames !== null) {
      throw new ScreenParseError('No se soportan Forms anidados', path);
    }
    // Contexto nuevo: los hijos saben que están dentro de este Form.
    const formCtx: ParseContext = { formNames: new Set<string>() };
    return { type: 'Form', id, children: parseChildren(raw, 'Form', path, formCtx), style };
  }

  if (type === 'FormGroup') {
    return {
      type: 'FormGroup',
      id,
      label: optionalString(raw, 'label', path),
      children: parseChildren(raw, 'FormGroup', path, ctx),
      style,
    };
  }

  if (type === 'Input') {
    const name = requireString(raw, 'name', 'Input', path);
    const inputType = raw.inputType;
    if (typeof inputType !== 'string' || !VALID_INPUT_TYPES.includes(inputType as any)) {
      throw new ScreenParseError(
        `"inputType" debe ser uno de: ${VALID_INPUT_TYPES.join(', ')}`,
        path
      );
    }
    registerFieldName(name, 'Input', path, ctx);
    return {
      type: 'Input',
      id,
      name,
      inputType: inputType as (typeof VALID_INPUT_TYPES)[number],
      label: requireString(raw, 'label', 'Input', path),
      required: optionalBoolean(raw, 'required', path),
      placeholder: optionalString(raw, 'placeholder', path),
      style,
    };
  }

  if (type === 'Select') {
    const name = requireString(raw, 'name', 'Select', path);
    registerFieldName(name, 'Select', path, ctx);
    return {
      type: 'Select',
      id,
      name,
      label: requireString(raw, 'label', 'Select', path),
      options: parseOptions(raw.options, path),
      required: optionalBoolean(raw, 'required', path),
      placeholder: optionalString(raw, 'placeholder', path),
      style,
    };
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

  const rootCtx: ParseContext = { formNames: null };

  return {
    screenId,
    title,
    components: components.map((c, index) =>
      parseComponent(c, `root.components[${index}]`, rootCtx)
    ),
  };
}

/**
 * Valida la respuesta del backend a un SUBMIT. Se parsea con contexto
 * fuera de Form, así que una respuesta que intente encadenar otro SUBMIT
 * se rechaza: el servidor solo puede responder con NAVIGATE.
 */
export function parseSubmitResponse(raw: unknown): SubmitResponse {
  if (!isPlainObject(raw)) {
    throw new ScreenParseError('La respuesta del SUBMIT debe ser un objeto', 'response');
  }
  const action = parseAction(raw.action, 'response.action', { formNames: null });
  if (action === undefined) {
    throw new ScreenParseError('Falta "action" en la respuesta del SUBMIT', 'response');
  }
  return { action };
}