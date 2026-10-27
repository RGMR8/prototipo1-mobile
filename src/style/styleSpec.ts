import type { BaseStyle } from '../types/screen';

/**
 * Vocabulario de estilos que acepta la API (#5): una regla por propiedad.
 * Es la única fuente de verdad: el parser valida con estas reglas y
 * splitStyle separa texto/contenedor con el campo `text`.
 * El tipo obliga a que cada propiedad de BaseStyle tenga su regla.
 * `dark` no está aquí: no es una propiedad, es un bloque (ver parseStyle).
 */
export type StyleRule =
  | { kind: 'color'; text: boolean }
  | { kind: 'number'; text: boolean; min: number; max: number }
  | { kind: 'dimension'; text: boolean }
  | { kind: 'enum'; text: boolean; values: readonly string[] };

export type StyleKey = keyof BaseStyle;

const color = (text: boolean): StyleRule => ({ kind: 'color', text });
const number = (text: boolean, min: number, max: number): StyleRule => ({ kind: 'number', text, min, max });
const dimension: StyleRule = { kind: 'dimension', text: false };
const oneOf = (text: boolean, values: readonly string[]): StyleRule => ({ kind: 'enum', text, values });

/** Límite razonable para tamaños en dp: evita valores absurdos del backend. */
const MAX_SIZE = 1000;

export const STYLE_SPEC: Record<StyleKey, StyleRule> = {
  color: color(true),
  fontSize: number(true, 1, 200),
  fontWeight: oneOf(true, ['normal', 'bold']),
  fontStyle: oneOf(true, ['normal', 'italic']),
  textAlign: oneOf(true, ['left', 'center', 'right', 'justify']),
  lineHeight: number(true, 1, 400),
  textDecorationLine: oneOf(true, ['none', 'underline', 'line-through']),

  backgroundColor: color(false),
  opacity: number(false, 0, 1),
  borderWidth: number(false, 0, 50),
  borderColor: color(false),
  borderRadius: number(false, 0, MAX_SIZE),

  padding: number(false, 0, MAX_SIZE),
  paddingHorizontal: number(false, 0, MAX_SIZE),
  paddingVertical: number(false, 0, MAX_SIZE),
  margin: number(false, -MAX_SIZE, MAX_SIZE),
  marginHorizontal: number(false, -MAX_SIZE, MAX_SIZE),
  marginVertical: number(false, -MAX_SIZE, MAX_SIZE),
  marginTop: number(false, -MAX_SIZE, MAX_SIZE),
  marginBottom: number(false, -MAX_SIZE, MAX_SIZE),
  gap: number(false, 0, MAX_SIZE),

  flex: number(false, 0, 100),
  flexDirection: oneOf(false, ['row', 'column']),
  flexWrap: oneOf(false, ['wrap', 'nowrap']),
  alignItems: oneOf(false, ['flex-start', 'center', 'flex-end', 'stretch']),
  alignSelf: oneOf(false, ['auto', 'flex-start', 'center', 'flex-end', 'stretch']),
  justifyContent: oneOf(false, ['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly']),

  width: dimension,
  height: dimension,
  minHeight: dimension,
  maxWidth: dimension,
};

export function isStyleKey(key: string): key is StyleKey {
  return Object.prototype.hasOwnProperty.call(STYLE_SPEC, key);
}

/** #RGB, #RGBA, #RRGGBB, #RRGGBBAA, rgb(r, g, b), rgba(r, g, b, a) o transparent. */
const COLOR_PATTERN =
  /^(#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})|rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*(0|1|0?\.\d+)\s*)?\)|transparent)$/i;

/** Porcentaje como texto: "50%", "33.3%". */
const PERCENT_PATTERN = /^\d+(\.\d+)?%$/;

/**
 * Valida un valor contra su regla. Devuelve null si es válido o el motivo
 * del rechazo (el parser lo convierte en ScreenParseError con la ruta).
 */
export function checkStyleValue(rule: StyleRule, value: unknown): string | null {
  if (rule.kind === 'color') {
    if (typeof value === 'string' && COLOR_PATTERN.test(value.trim())) return null;
    return 'debe ser un color: #RRGGBB, #RGB, rgb(), rgba() o transparent';
  }
  if (rule.kind === 'number') {
    if (typeof value === 'number' && Number.isFinite(value) && value >= rule.min && value <= rule.max) return null;
    return `debe ser un número entre ${rule.min} y ${rule.max}`;
  }
  if (rule.kind === 'dimension') {
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= MAX_SIZE) return null;
    if (typeof value === 'string' && PERCENT_PATTERN.test(value)) return null;
    return `debe ser un número entre 0 y ${MAX_SIZE} o un porcentaje como "50%"`;
  }
  if (typeof value === 'string' && rule.values.includes(value)) return null;
  return `debe ser uno de: ${rule.values.join(', ')}`;
}
