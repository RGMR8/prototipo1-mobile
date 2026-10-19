import { Alert, Platform } from 'react-native';

/** Alert.alert no está implementado en web (react-native-web): se usa window.alert. */
export function showAlert(title: string, message: string): void {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}