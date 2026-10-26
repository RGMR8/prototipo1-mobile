import { StyleSheet, Text, View } from 'react-native';
import type { MapComponent } from '../../types/screen';
import { messages } from '../../i18n/messages';
import { theme } from '../../theme/theme';

/**
 * Representación del Map sin mapa interactivo: muestra el centro y la lista
 * de ubicaciones. Se usa en la web de vista previa, donde la librería de
 * mapas nativa no funciona.
 */
export function MapFallback({ height, region, markers }: MapComponent) {
  return (
    <View style={[styles.box, { minHeight: height }]}>
      <Text style={styles.title}>{messages.map.unavailable}</Text>
      <Text style={styles.secondary}>
        {messages.map.center} {formatCoords(region.latitude, region.longitude)}
      </Text>

      {markers.length === 0 && <Text style={styles.secondary}>{messages.map.noMarkers}</Text>}

      {markers.map((marker) => (
        <View key={marker.id} style={styles.marker}>
          <Text style={styles.markerTitle}>{marker.title ?? marker.id}</Text>
          {marker.description !== undefined && (
            <Text style={styles.secondary}>{marker.description}</Text>
          )}
          <Text style={styles.secondary}>{formatCoords(marker.latitude, marker.longitude)}</Text>
        </View>
      ))}
    </View>
  );
}

function formatCoords(latitude: number, longitude: number): string {
  return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderColor: theme.colors.textSecondary,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  title: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  marker: {
    gap: 2,
  },
  markerTitle: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  secondary: {
    color: theme.colors.textSecondary,
  },
});