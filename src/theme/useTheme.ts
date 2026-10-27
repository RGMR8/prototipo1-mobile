import { useMemo } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { darkTheme, lightTheme, type AppTheme } from './theme';

/**
 * Tema del modo actual del teléfono (#5). Se actualiza solo cuando el
 * usuario cambia entre claro y oscuro. Si el sistema no informa el modo,
 * se usa claro.
 */
export function useTheme(): AppTheme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkTheme : lightTheme;
}

/**
 * Estilos que dependen del tema. `factory` se define fuera del componente
 * (a nivel de archivo) para que sea estable; los estilos se recalculan solo
 * cuando cambia el modo.
 *
 * Uso:
 *   const makeStyles = (t: AppTheme) => ({ title: { color: t.colors.text } });
 *   const styles = useThemedStyles(makeStyles);
 */
export function useThemedStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  factory: (theme: AppTheme) => T & StyleSheet.NamedStyles<any>
): T {
  const current = useTheme();
  return useMemo(() => StyleSheet.create(factory(current)), [current, factory]);
}
