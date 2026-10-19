import { ApiError } from '../api/apiError';
import { endSession } from '../session/endSession';
import { LOGIN_SCREEN_ID } from '../navigation/constants';
import { showAlert } from '../ui/showAlert';
import { errorMessage } from './errorMessage';
import { messages } from '../i18n/messages';

/**
 * Qué hacer cuando falla una acción (SUBMIT, CALL, LOGOUT…):
 * - 401: la sesión ya no sirve → cerrar sesión e ir a login.
 * - cualquier otro error: avisar al usuario sin sacarlo de la pantalla,
 *   así no pierde lo que escribió en el formulario.
 */
export async function handleActionError(error: unknown, resetTo: (screenId: string) => void): Promise<void> {
  if (error instanceof ApiError && error.isUnauthorized) {
    await endSession();
    resetTo(LOGIN_SCREEN_ID);
    return;
  }
  console.error('Error al ejecutar la acción:', error);
  showAlert(messages.errors.title, errorMessage(error));
}