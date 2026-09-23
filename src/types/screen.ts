/**
 * Tipos para el screen-builder — Prototipo #1
 *
 * Alcance de este prototipo (según Plan de acción | Prototipado):
 * - Componentes: Text, Container, Button
 * - Estilos básicos definidos desde la app (NO personalización desde la API todavía — eso es Prototipo #5)
 * - Sin acciones (navigate/submit llegan en el Prototipo #2)
 * - Sin forms (Prototipo #2)
 */

/**
 * Propiedades de estilo que la API puede especificar por componente.
 * Es un subconjunto deliberadamente pequeño: el Prototipo #1 solo valida
 * que el flujo JSON → componente → estilo funcione, no busca cubrir
 * cada propiedad CSS posible.
 */
export interface ComponentStyle {
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  padding?: number;
  margin?: number;
  borderRadius?: number;
  gap?: number;
  flexDirection?: 'row' | 'column';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between';
  width?: string | number;
  height?: string | number;
}

interface BaseComponent {
  id: string;
  style?: ComponentStyle;
}

export interface TextComponent extends BaseComponent {
  type: 'Text';
  content: string;
}

export interface ButtonComponent extends BaseComponent {
  type: 'Button';
  label: string;
}

export interface ContainerComponent extends BaseComponent {
  type: 'Container';
  children: ScreenComponent[];
}

/** Unión discriminada por `type` — así TypeScript sabe qué campos esperar en cada caso. */
export type ScreenComponent = TextComponent | ButtonComponent | ContainerComponent;

/** Estructura completa de una pantalla, tal como la manda el backend. */
export interface ScreenDefinition {
  screenId: string;
  title: string;
  components: ScreenComponent[];
}
