import type { FeatureCollection } from 'geojson';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Camera, GeoJSONSource, Layer, Map } from '@maplibre/maplibre-react-native';
import type { MapComponent, MapMarker } from '../../types/screen';
import { mapStyle } from '../mapStyle';
import { theme } from '../../theme/theme';
import { MAP_STYLE_URL } from './mapConfig';

/**
 * Mapa interactivo en Android/iOS con MapLibre (#5). Zoom y desplazamiento
 * los da el mapa nativo; región y marcadores vienen del backend.
 * Los marcadores se dibujan como una capa del propio mapa (círculos), que es
 * lo que recomienda MapLibre: el toque lo resuelve el mapa y escala a muchos
 * puntos. Al tocar uno se muestra su ficha; tocar la ficha la cierra.
 * El estilo de la API se aplica a la caja del mapa; `height` del componente
 * va al final porque es el alto que el backend definió para el mapa.
 * En la web se usa MapView.tsx (lista de ubicaciones).
 */
export function MapView({ id, height, region, markers, style }: MapComponent) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = markers.find((marker) => marker.id === selectedId);

  return (
    <View style={[styles.box, mapStyle(style), { height }]}>
      <Map style={StyleSheet.absoluteFill} mapStyle={MAP_STYLE_URL}>
        <Camera
          initialViewState={{
            center: [region.longitude, region.latitude],
            zoom: region.zoom,
          }}
        />
        <GeoJSONSource
          id={`${id}-markers`}
          data={toGeoJson(markers)}
          hitbox={{ top: 12, right: 12, bottom: 12, left: 12 }}
          onPress={(event) => {
            const feature = event.nativeEvent.features[0];
            const markerId = feature?.properties?.markerId;
            if (typeof markerId !== 'string') return;
            setSelectedId(markerId);
          }}
        >
          <Layer
            type="circle"
            id={`${id}-markers-layer`}
            paint={{
              'circle-color': theme.colors.primary,
              'circle-stroke-color': theme.colors.onPrimary,
              'circle-stroke-width': 2,
              'circle-radius': ['case', ['==', ['get', 'markerId'], selectedId ?? ''], 12, 9],
            }}
          />
        </GeoJSONSource>
      </Map>
      {selected !== undefined && (
        <MarkerCard marker={selected} onClose={() => setSelectedId(null)} />
      )}
    </View>
  );
}

/** Marcadores del backend como puntos GeoJSON: [longitud, latitud]. */
function toGeoJson(markers: MapMarker[]): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: markers.map((marker) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [marker.longitude, marker.latitude] },
      properties: { markerId: marker.id },
    })),
  };
}

/** Ficha del marcador seleccionado: título y descripción. */
function MarkerCard({ marker, onClose }: { marker: MapMarker; onClose: () => void }) {
  return (
    <Pressable style={styles.card} onPress={onClose}>
      <Text style={styles.cardTitle}>{marker.title ?? marker.id}</Text>
      {marker.description !== undefined && (
        <Text style={styles.cardText}>{marker.description}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: theme.radius.md,
    overflow: 'hidden',
  },
  card: {
    position: 'absolute',
    left: theme.spacing.sm,
    right: theme.spacing.sm,
    bottom: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    elevation: 4,
  },
  cardTitle: {
    color: theme.colors.text,
    fontWeight: theme.fontWeight.bold,
  },
  cardText: {
    color: theme.colors.textSecondary,
  },
});