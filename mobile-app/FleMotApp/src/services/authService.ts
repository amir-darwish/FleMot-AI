import auth from '@react-native-firebase/auth';
import Keychain from 'react-native-keychain';

export async function getUserToken() {
    const credentials = await Keychain.getGenericPassword();
    return credentials ? credentials.password : null;
}

export async function saveUserToken(token: string) {
    await Keychain.setGenericPassword('firebase_token', token);
}

export async function clearUserToken() {
    await Keychain.resetGenericPassword();
}

export async function firebaseSignOut() {
    await auth().signOut();
}
