import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Camera, Map, Marker } from '@maplibre/maplibre-react-native';
import type { MapComponent, MapMarker } from '../../types/screen';
import { theme } from '../../theme/theme';
import { MAP_STYLE_URL } from './mapConfig';

/**
 * Mapa interactivo en Android/iOS con MapLibre (#5). Zoom y desplazamiento
 * los da el mapa nativo; región y marcadores vienen del backend.
 * Al tocar un marcador se muestra su ficha abajo del mapa; tocar la ficha la
 * cierra. En la web se usa MapView.tsx (lista de ubicaciones).
 */
export function MapView({ height, region, markers }: MapComponent) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = markers.find((marker) => marker.id === selectedId);

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
          <Marker key={marker.id} id={marker.id} lngLat={[marker.longitude, marker.latitude]}>
            <Pressable
              onPress={() => setSelectedId(marker.id)}
              hitSlop={12}
              style={[styles.pin, marker.id === selectedId && styles.pinSelected]}
            />
          </Marker>
        ))}
      </Map>
      {selected !== undefined && (
        <MarkerCard marker={selected} onClose={() => setSelectedId(null)} />
      )}
    </View>
  );
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
  pinSelected: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  card: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 8,
    padding: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.onPrimary,
    elevation: 4,
  },
  cardTitle: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  cardText: {
    color: theme.colors.textSecondary,
  },
});