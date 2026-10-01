/**
 * Tipos para el screen-builder.
 *
 * Prototipo #1: Text, Container, Button, estilos básicos.
 * Prototipo #2: Form, FormGroup, Input (text, password), Select,
 *               acciones NAVIGATE y SUBMIT.
 * Personalización de estilos desde la API: Prototipo #5 en espera.
 */

/**
 * Propiedades de estilo que la API puede especificar por componente.
 * Subconjunto deliberadamente pequeño: no busca cubrir cada propiedad
 * CSS posible.
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

/** Acciones que un componente puede ejecutar. Unión discriminada por `type`. */
export type ScreenAction =
  | { type: 'NAVIGATE'; screenId: string }
  | { type: 'SUBMIT'; method: string }
  | { type: 'CALL'; function: string };

export interface TextComponent extends BaseComponent {
  type: 'Text';
  content: string;
}

export interface ButtonComponent extends BaseComponent {
  type: 'Button';
  label: string;
  action?: ScreenAction;
}

export interface ContainerComponent extends BaseComponent {
  type: 'Container';
  children: ScreenComponent[];
}

export interface FormComponent extends BaseComponent {
  type: 'Form';
  children: ScreenComponent[];
}

export interface FormGroupComponent extends BaseComponent {
  type: 'FormGroup';
  label?: string;
  children: ScreenComponent[];
}

export interface InputComponent extends BaseComponent {
  type: 'Input';
  name: string;
  inputType: 'text' | 'password';
  label: string;
  required?: boolean;
  placeholder?: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectComponent extends BaseComponent {
  type: 'Select';
  name: string;
  label: string;
  options: SelectOption[];
  required?: boolean;
  placeholder?: string;
}

/** Unión discriminada por `type` — así TypeScript sabe qué campos esperar en cada caso. */
export type ScreenComponent =
  | TextComponent
  | ButtonComponent
  | ContainerComponent
  | FormComponent
  | FormGroupComponent
  | InputComponent
  | SelectComponent;

/** Estructura completa de una pantalla, tal como la manda el backend. */
export interface ScreenDefinition {
  screenId: string;
  title: string;
  components: ScreenComponent[];
}

/** Respuesta del backend a un SUBMIT: el servidor decide qué sigue. */
export interface SubmitResponse {
  action: ScreenAction;
}

/**
 * Función que renderiza un hijo. La reciben los componentes contenedores
 * (Container, Form, FormGroup) como prop, en vez de importar
 * renderComponent directamente: así se evita el ciclo de imports.
 */
export type RenderChild = (props: { component: ScreenComponent }) => React.JSX.Element;

