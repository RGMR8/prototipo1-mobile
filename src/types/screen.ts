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
  | { type: 'NAVIGATE'; screenId: string; reset?: boolean }
  | { type: 'SUBMIT'; method: string }
  | { type: 'CALL'; function: string }
  | { type: 'LOGOUT' };

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
  | SelectComponent
  | UnknownComponent;

/** Estructura completa de una pantalla, tal como la manda el backend. */
export interface ScreenDefinition {
  screenId: string;
  title: string;
  components: ScreenComponent[];
}

/** Respuesta del backend a un SUBMIT: el servidor decide qué sigue. */
/**
 * Respuesta del backend a un SUBMIT (o al logout). Trae al menos
 * `action` o `errors`:
 * - session: el servidor abre sesión (login) → la app guarda el token.
 * - errors:  errores por campo → el Form los pinta y no se navega.
 * - action:  qué hacer después (el servidor decide).
 */
export interface SubmitResponse {
  action?: ScreenAction;
  session?: { token: string };
  errors?: Record<string, string>;
}

/**
 * Función que renderiza un hijo. La reciben los componentes contenedores
 * (Container, Form, FormGroup) como prop, en vez de importar
 * renderComponent directamente: así se evita el ciclo de imports.
 */
export type RenderChild = (props: { component: ScreenComponent }) => React.JSX.Element;

/**
 * Componente que esta versión de la app no conoce (#4).
 * No viene así del backend: lo crea el parser cuando recibe un `type`
 * que no está en su vocabulario, para dibujar un fallback en su lugar.
 */
export interface UnknownComponent {
  type: 'Unknown';
  id: string;
  /** El type que mandó el backend, para el aviso y el diagnóstico. */
  originalType: string;
}

