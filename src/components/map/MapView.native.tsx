import type { FeatureCollection } from 'geojson';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Camera, GeoJSONSource, Layer, Map } from '@maplibre/maplibre-react-native';
import type { MapComponent, MapMarker } from '../../types/screen';
import type { AppTheme } from '../../theme/theme';
import { useTheme, useThemedStyles } from '../../theme/useTheme';
import { mapStyle, useResolvedStyle } from '../mapStyle';
import { MAP_STYLE_URLS } from './mapConfig';

/**
 * Mapa interactivo en Android/iOS con MapLibre (#5). Zoom y desplazamiento
 * los da el mapa nativo; región y marcadores vienen del backend.
 * Los marcadores se dibujan como una capa del propio mapa (círculos), que es
 * lo que recomienda MapLibre: el toque lo resuelve el mapa y escala a muchos
 * puntos. Al tocar uno se muestra su ficha; tocar la ficha la cierra.
 * El fondo del mapa sigue el modo claro/oscuro del teléfono.
 * El estilo de la API se aplica a la caja del mapa; `height` del componente
 * va al final porque es el alto que el backend definió para el mapa.
 * En la web se usa MapView.tsx (lista de ubicaciones).
 */
export function MapView({ id, height, region, markers, style }: MapComponent) {
  const current = useTheme();
  const styles = useThemedStyles(makeStyles);
  const resolved = useResolvedStyle(style);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = markers.find((marker) => marker.id === selectedId);

  return (
    <View style={[styles.box, mapStyle(resolved), { height }]}>
      <Map style={StyleSheet.absoluteFill} mapStyle={MAP_STYLE_URLS[current.scheme]}>
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
              'circle-color': current.colors.primary,
              'circle-stroke-color': current.colors.onPrimary,
              'circle-stroke-width': 2,
              'circle-radius': ['case', ['==', ['get', 'markerId'], selectedId ?? ''], 12, 9],
            }}
          />
        </GeoJSONSource>
      </Map>
      {selected !== undefined && (
        <Pressable style={styles.card} onPress={() => setSelectedId(null)}>
          <MarkerCardContent marker={selected} styles={styles} />
        </Pressable>
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

/** Contenido de la ficha del marcador seleccionado: título y descripción. */
function MarkerCardContent({ marker, styles }: { marker: MapMarker; styles: ReturnType<typeof makeStyles> }) {
  return (
    <>
      <Text style={styles.cardTitle}>{marker.title ?? marker.id}</Text>
      {marker.description !== undefined && (
        <Text style={styles.cardText}>{marker.description}</Text>
      )}
    </>
  );
}

const makeStyles = (t: AppTheme) => ({
  box: {
    borderRadius: t.radius.md,
    overflow: 'hidden' as const,
  },
  card: {
    position: 'absolute' as const,
    left: t.spacing.sm,
    right: t.spacing.sm,
    bottom: t.spacing.sm,
    padding: t.spacing.md,
    borderRadius: t.radius.md,
    backgroundColor: t.colors.surface,
    elevation: 4,
  },
  cardTitle: {
    color: t.colors.text,
    fontWeight: t.fontWeight.bold,
  },
  cardText: {
    color: t.colors.textSecondary,
  },
});
