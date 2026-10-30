/**
 * Configuración de la app (#6). Reemplaza a app.json.
 *
 * Dos variantes que conviven en el mismo teléfono:
 * - Normal:      APP_VARIANT sin definir → com.ivitecdev.prototipo1mobile
 * - Desarrollo:  APP_VARIANT=development → com.ivitecdev.prototipo1mobile.dev
 *
 * La variante la define el perfil de eas.json. Solo la de desarrollo
 * permite http:// para probar contra el servidor local (Laragon); la
 * normal exige https.
 */
const IS_DEV = process.env.APP_VARIANT === 'development';

const PACKAGE = 'com.ivitecdev.prototipo1mobile';

const plugins = [
  'expo-secure-store',
  '@maplibre/maplibre-react-native',
];

if (IS_DEV) {
  plugins.push(['expo-build-properties', { android: { usesCleartextTraffic: true } }]);
}

module.exports = {
  expo: {
    name: IS_DEV ? 'prototipo1-mobile (Dev)' : 'prototipo1-mobile',
    slug: 'prototipo1-mobile',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    // automatic: la app sigue el modo claro/oscuro del teléfono (requiere expo-system-ui).
    userInterfaceStyle: 'automatic',
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        backgroundColor: '#E6F4FE',
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      predictiveBackGestureEnabled: false,
      package: IS_DEV ? `${PACKAGE}.dev` : PACKAGE,
      // Sin respaldos: el caché y los datos locales no se pueden extraer con adb backup.
      allowBackup: false,
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins,
    extra: {
      eas: {
        projectId: '0d147f7a-9726-49c1-91c9-3c929ed27704',
      },
    },
    owner: 'ivitec-dev',
  },
};
