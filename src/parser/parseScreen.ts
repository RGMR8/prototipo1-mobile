import type {
  ScreenDefinition,
  ScreenComponent,
  ComponentStyle,
  ScreenAction,
  SelectOption,
  SubmitResponse,
  MapComponent,
  MapMarker,
  MapRegion,
} from '../types/screen';
import { isRegisteredFunction } from '../actions/functionRegistry';

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
  'Text', 'Container', 'Button', 'Form', 'FormGroup', 'Input', 'Select', 'Map',
] as const;

type KnownComponentType = (typeof VALID_COMPONENT_TYPES)[number];

function isKnownComponentType(value: string): value is KnownComponentType {
  return (VALID_COMPONENT_TYPES as readonly string[]).includes(value);
}

const VALID_INPUT_TYPES = ['text', 'password'] as const;

type InputType = (typeof VALID_INPUT_TYPES)[number];

function isInputType(value: string): value is InputType {
  return (VALID_INPUT_TYPES as readonly string[]).includes(value);
}

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
    return {
      type: 'NAVIGATE',
      screenId: requireString(raw, 'screenId', 'NAVIGATE', path),
      reset: optionalBoolean(raw, 'reset', path),
    };
  }

  if (raw.type === 'SUBMIT') {
    if (ctx.formNames === null) {
      throw new ScreenParseError('SUBMIT solo puede usarse dentro de un Form', path);
    }
    return { type: 'SUBMIT', method: requireString(raw, 'method', 'SUBMIT', path) };
  }

  if (raw.type === 'CALL') {
    const fn = requireString(raw, 'function', 'CALL', path);
    if (!isRegisteredFunction(fn)) {
      throw new ScreenParseError(`La función "${fn}" no está registrada en la app`, path);
    }
    return { type: 'CALL', function: fn };
  }

  if (raw.type === 'LOGOUT') {
    return { type: 'LOGOUT' };
  }

  throw new ScreenParseError('"action.type" debe ser NAVIGATE, SUBMIT, CALL o LOGOUT', path);
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

/** Número obligatorio dentro de un rango (coordenadas, zoom). #5 */
function requireNumber(
  raw: Record<string, unknown>,
  field: string,
  owner: string,
  path: string,
  min: number,
  max: number
): number {
  const value = raw[field];
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    throw new ScreenParseError(`"${field}" debe ser un número entre ${min} y ${max} en ${owner}`, path);
  }
  return value;
}

/** Alto del mapa si el backend no lo manda. #5 */
const DEFAULT_MAP_HEIGHT = 300;

function parseMapHeight(raw: unknown, path: string): number {
  if (raw === undefined) return DEFAULT_MAP_HEIGHT;
  if (typeof raw !== 'number' || !Number.isInteger(raw) || raw < 100 || raw > 1000) {
    throw new ScreenParseError('"height" del mapa debe ser un entero entre 100 y 1000', path);
  }
  return raw;
}

/** Centro y zoom inicial del mapa. #5 */
function parseMapRegion(raw: unknown, path: string): MapRegion {
  if (!isPlainObject(raw)) {
    throw new ScreenParseError('Falta "region" (objeto) en Map', path);
  }
  return {
    latitude: requireNumber(raw, 'latitude', 'region', path, -90, 90),
    longitude: requireNumber(raw, 'longitude', 'region', path, -180, 180),
    zoom: requireNumber(raw, 'zoom', 'region', path, 0, 22),
  };
}

/** Marcadores: lista de datos. Sin marcadores es válido (mapa vacío). #5 */
function parseMapMarkers(raw: unknown, path: string): MapMarker[] {
  if (raw === undefined) return [];
  if (!Array.isArray(raw)) {
    throw new ScreenParseError('"markers" debe ser un array', path);
  }
  const ids = new Set<string>();
  return raw.map((marker, index) => {
    const markerPath = `${path}.markers[${index}]`;
    if (!isPlainObject(marker)) {
      throw new ScreenParseError('Cada marcador debe ser un objeto', markerPath);
    }
    const id = requireString(marker, 'id', 'el marcador', markerPath);
    if (ids.has(id)) {
      throw new ScreenParseError(`"id" de marcador duplicado: ${id}`, markerPath);
    }
    ids.add(id);
    return {
      id,
      latitude: requireNumber(marker, 'latitude', 'el marcador', markerPath, -90, 90),
      longitude: requireNumber(marker, 'longitude', 'el marcador', markerPath, -180, 180),
      title: optionalString(marker, 'title', markerPath),
      description: optionalString(marker, 'description', markerPath),
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

  if (typeof type !== 'string' || type.trim() === '') {
    throw new ScreenParseError('Falta "type" (string) en el componente', path);
  }

  // #4: un tipo que esta versión de la app no conoce no tumba la pantalla.
  // Se marca como Unknown y el dispatcher dibuja un fallback en su lugar.
  // Pasa, por ejemplo, cuando el backend ya usa un componente nuevo y el
  // APK instalado es anterior.
  if (!isKnownComponentType(type)) {
    return { type: 'Unknown', id, originalType: type };
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
    if (typeof inputType !== 'string' || !isInputType(inputType)) {
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
      inputType,
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

  if (type === 'Map') {
    const map: MapComponent = {
      type: 'Map',
      id,
      height: parseMapHeight(raw.height, path),
      region: parseMapRegion(raw.region, `${path}.region`),
      markers: parseMapMarkers(raw.markers, path),
      style,
    };
    return map;
  }

  // Inalcanzable en la práctica: VALID_COMPONENT_TYPES ya lo filtró arriba.
  // Se deja como error explícito, no como caso silencioso.
  throw new ScreenParseError(`Tipo de componente no soportado: ${type}`, path);
}

/** TTL en segundos (#4). Ausente = 0 (no se cachea). */
function parseTtl(raw: unknown): number {
  if (raw === undefined) return 0;
  if (typeof raw !== 'number' || !Number.isInteger(raw) || raw < 0) {
    throw new ScreenParseError('"ttl" debe ser un entero mayor o igual a 0 (segundos)', 'root');
  }
  return raw;
}

/**
 * Convierte el JSON crudo recibido del backend en un ScreenDefinition tipado.
 * Lanza ScreenParseError si la estructura no coincide con lo esperado.
 */
export function parseScreen(raw: unknown): ScreenDefinition {
  if (!isPlainObject(raw)) {
    throw new ScreenParseError('La raíz del JSON debe ser un objeto', 'root');
  }

  const { screenId, title, components, ttl } = raw;

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
    ttl: parseTtl(ttl),
    components: components.map((c, index) =>
      parseComponent(c, `root.components[${index}]`, rootCtx)
    ),
  };
}

function parseErrors(raw: unknown, path: string): Record<string, string> | undefined {
  if (raw === undefined) return undefined;
  if (!isPlainObject(raw)) {
    throw new ScreenParseError('"errors" debe ser un objeto { campo: mensaje }', path);
  }
  const errors: Record<string, string> = {};
  for (const [field, message] of Object.entries(raw)) {
    if (typeof message !== 'string') {
      throw new ScreenParseError(`El error de "${field}" debe ser string`, path);
    }
    errors[field] = message;
  }
  return errors;
}

function parseSession(raw: unknown, path: string): { token: string } | undefined {
  if (raw === undefined) return undefined;
  if (!isPlainObject(raw)) {
    throw new ScreenParseError('"session" debe ser un objeto', path);
  }
  return { token: requireString(raw, 'token', 'session', path) };
}

/**
 * Valida la respuesta del backend a un SUBMIT o al logout. Se parsea con
 * contexto fuera de Form, así que una respuesta que intente encadenar otro
 * SUBMIT se rechaza. Debe traer al menos `action` o `errors`.
 */
export function parseSubmitResponse(raw: unknown): SubmitResponse {
  if (!isPlainObject(raw)) {
    throw new ScreenParseError('La respuesta del SUBMIT debe ser un objeto', 'response');
  }
  const action = parseAction(raw.action, 'response.action', { formNames: null });
  const errors = parseErrors(raw.errors, 'response.errors');
  const session = parseSession(raw.session, 'response.session');

  if (action === undefined && errors === undefined) {
    throw new ScreenParseError('La respuesta debe traer "action" o "errors"', 'response');
  }
  return { action, errors, session };
}