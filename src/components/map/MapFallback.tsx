import { Text, View } from 'react-native';
import type { MapComponent } from '../../types/screen';
import type { AppTheme } from '../../theme/theme';
import { useThemedStyles } from '../../theme/useTheme';
import { messages } from '../../i18n/messages';
import { mapStyle, useResolvedStyle } from '../mapStyle';

/**
 * Representación del Map sin mapa interactivo: muestra el centro y la lista
 * de ubicaciones. Se usa en la web de vista previa, donde la librería de
 * mapas nativa no funciona. El estilo de la API se aplica a la caja.
 */
export function MapFallback({ height, region, markers, style }: MapComponent) {
  const styles = useThemedStyles(makeStyles);
  const resolved = useResolvedStyle(style);

  return (
    <View style={[styles.box, mapStyle(resolved), { minHeight: height }]}>
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

const makeStyles = (t: AppTheme) => ({
  box: {
    borderWidth: t.field.borderWidth,
    borderColor: t.colors.border,
    borderRadius: t.radius.md,
    padding: t.spacing.md,
    gap: t.spacing.sm,
  },
  title: {
    color: t.colors.text,
    fontSize: t.fontSize.subtitle,
    fontWeight: t.fontWeight.bold,
  },
  marker: {
    gap: t.spacing.xs,
  },
  markerTitle: {
    color: t.colors.text,
    fontWeight: t.fontWeight.bold,
  },
  secondary: {
    color: t.colors.textSecondary,
  },
});
