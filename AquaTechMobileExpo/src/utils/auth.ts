import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { resetToAuth } from '../navigation/navigationRef';

export async function logout() {
  try {
    await auth().signOut();
  } catch {}
  try {
    await AsyncStorage.multiRemove(['auth_token', 'guest_user']);
  } catch {}
  resetToAuth();
}
