import type { MapComponent } from '../../types/screen';
import { MapFallback } from './MapFallback';

/**
 * Componente Map en la web de vista previa: MapLibre nativo no funciona en
 * web, así que se muestra la lista de ubicaciones. En Android/iOS se usa
 * MapView.native.tsx.
 */
export function MapView(props: MapComponent) {
  return <MapFallback {...props} />;
}