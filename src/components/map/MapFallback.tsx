import { StyleSheet, Text, View } from 'react-native';
import type { MapComponent } from '../../types/screen';
import { messages } from '../../i18n/messages';
import { mapStyle } from '../mapStyle';
import { theme } from '../../theme/theme';

/**
 * Representación del Map sin mapa interactivo: muestra el centro y la lista
 * de ubicaciones. Se usa en la web de vista previa, donde la librería de
 * mapas nativa no funciona. El estilo de la API se aplica a la caja.
 */
export function MapFallback({ height, region, markers, style }: MapComponent) {
  return (
    <View style={[styles.box, mapStyle(style), { minHeight: height }]}>
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
    borderWidth: theme.field.borderWidth,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.fontSize.subtitle,
    fontWeight: theme.fontWeight.bold,
  },
  marker: {
    gap: theme.spacing.xs,
  },
  markerTitle: {
    color: theme.colors.text,
    fontWeight: theme.fontWeight.bold,
  },
  secondary: {
    color: theme.colors.textSecondary,
  },
});