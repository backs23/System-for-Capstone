import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { resetToAuth } from '../navigation/navigationRef';

export async function logout() {
  try {
    await GoogleSignin.revokeAccess();
    await GoogleSignin.signOut();
    await auth().signOut();
  } catch {}
  try {
    await AsyncStorage.multiRemove(['auth_token', 'guest_user']);
  } catch {}
  resetToAuth();
}
