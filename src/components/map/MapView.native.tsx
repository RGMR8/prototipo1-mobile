import { StyleSheet, Text, View } from 'react-native';
import { Callout, Camera, Map, ViewAnnotation } from '@maplibre/maplibre-react-native';
import type { MapComponent, MapMarker } from '../../types/screen';
import { theme } from '../../theme/theme';
import { MAP_STYLE_URL } from './mapConfig';

/**
 * Mapa interactivo en Android/iOS con MapLibre (#5). Zoom y desplazamiento
 * los da el mapa nativo; región y marcadores vienen del backend.
 * En la web se usa MapView.tsx (lista de ubicaciones).
 */
export function MapView({ height, region, markers }: MapComponent) {
  return (
    <View style={[styles.box, { height }]}>
      <Map style={StyleSheet.absoluteFill} mapStyle={MAP_STYLE_URL}>
        <Camera
          initialViewState={{
            center: [region.longitude, region.latitude],
            zoom: region.zoom,
          }}
        />
        {markers.map((marker) => (
          <MarkerPin key={marker.id} marker={marker} />
        ))}
      </Map>
    </View>
  );
}

/** Un marcador: el punto en el mapa y, al tocarlo, su título y descripción. */
function MarkerPin({ marker }: { marker: MapMarker }) {
  return (
    <ViewAnnotation
      id={marker.id}
      lngLat={[marker.longitude, marker.latitude]}
      title={marker.title ?? marker.id}
      anchor="bottom"
    >
      <View style={styles.pin} />
      <Callout>
        <View style={styles.callout}>
          <Text style={styles.calloutTitle}>{marker.title ?? marker.id}</Text>
          {marker.description !== undefined && (
            <Text style={styles.calloutText}>{marker.description}</Text>
          )}
        </View>
      </Callout>
    </ViewAnnotation>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  pin: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: theme.colors.onPrimary,
    backgroundColor: theme.colors.primary,
  },
  callout: {
    padding: 8,
    maxWidth: 220,
  },
  calloutTitle: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  calloutText: {
    color: theme.colors.textSecondary,
  },
});