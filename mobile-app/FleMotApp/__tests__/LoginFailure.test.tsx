import React from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';
import axios, { AxiosHeaders } from 'axios';
import LoginScreen from '../src/screens/LoginScreen';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { clearUserToken, firebaseSignOut, getUserToken, saveUserToken } from '../src/services/authService';
import { clearLocalWords, getLocalWords } from '../src/services/storageService';

const mockGoogleSignIn = jest.fn();
const mockAuthenticate = jest.fn();
const mockGetIdToken = jest.fn();

jest.mock('@react-navigation/native', () => ({ useNavigation: () => ({}) }));
jest.mock('@react-native-firebase/app', () => ({ getApp: () => ({}) }));
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    hasPlayServices: async () => true,
    signIn: () => mockGoogleSignIn(),
  },
}));
jest.mock('@react-native-firebase/auth', () => ({
  getAuth: () => ({}),
  GoogleAuthProvider: { credential: () => ({}) },
  signInWithCredential: () => mockAuthenticate(),
  signInWithEmailAndPassword: () => mockAuthenticate(),
}));
jest.mock('../src/services/authService', () => ({
  getUserToken: jest.fn(),
  saveUserToken: jest.fn(),
  clearUserToken: jest.fn(),
  firebaseSignOut: jest.fn(),
}));
jest.mock('../src/services/storageService', () => ({
  getLocalWords: jest.fn(),
  saveLocalWords: jest.fn(),
  clearLocalWords: jest.fn(),
}));
jest.mock('../src/services/api', () => ({ __esModule: true, default: {} }));

let tree: ReactTestRenderer.ReactTestRenderer;
let authState: ReturnType<typeof useAuth> | undefined;

const Probe = () => {
  authState = useAuth();
  return null;
};

const currentAuth = () => {
  if (!authState) throw new Error('AuthProvider was not rendered.');
  return authState;
};

beforeEach(async () => {
  jest.clearAllMocks();
  authState = undefined;
  jest.mocked(getUserToken).mockResolvedValue(null);
  jest.mocked(getLocalWords).mockResolvedValue(null);
  jest.mocked(saveUserToken).mockResolvedValue(undefined);
  jest.mocked(firebaseSignOut).mockResolvedValue(undefined);
  jest.mocked(clearUserToken).mockResolvedValue(undefined);
  jest.mocked(clearLocalWords).mockResolvedValue(undefined);
  mockGoogleSignIn.mockResolvedValue({ type: 'success', data: { idToken: 'synthetic-google-token' } });
  mockAuthenticate.mockResolvedValue({ user: { getIdToken: mockGetIdToken } });
  mockGetIdToken.mockResolvedValue('synthetic-firebase-token');
  jest.spyOn(axios, 'post').mockResolvedValue({
    data: { role: 'standard' }, status: 200, statusText: 'OK',
    headers: {}, config: { headers: new AxiosHeaders() },
  });
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  await act(async () => {
    tree = ReactTestRenderer.create(<AuthProvider><LoginScreen /><Probe /></AuthProvider>);
  });
});

afterEach(async () => {
  await act(async () => tree.unmount());
  jest.restoreAllMocks();
});

const login = async (method: 'Google' | 'email') => {
  if (method === 'email') {
    await act(async () => {
      tree.root.findByProps({ placeholder: 'Email' }).props.onChangeText('demo@example.invalid');
      tree.root.findByProps({ placeholder: 'Mot de passe' }).props.onChangeText('synthetic-password');
    });
  }
  await act(async () => {
    if (method === 'Google') {
      await tree.root.findByProps({ title: 'Continuer avec Google' }).props.onPress();
    } else {
      await tree.root.findAllByType(TouchableOpacity)[0].props.onPress();
    }
  });
};

describe.each(['Google', 'email'] as const)('%s login completion', method => {
  test.each(['profile', 'role'] as const)('cleans up after %s failure', async failure => {
    if (failure === 'profile') {
      jest.mocked(axios.post).mockRejectedValueOnce(new Error('Profile unavailable.'));
    } else {
      jest.mocked(axios.post).mockResolvedValueOnce({
        data: { role: 'unknown' }, status: 200, statusText: 'OK',
        headers: {}, config: { headers: new AxiosHeaders() },
      });
    }
    await login(method);
    expect(firebaseSignOut).toHaveBeenCalledTimes(1);
    expect(clearUserToken).toHaveBeenCalledTimes(1);
    expect(clearLocalWords).toHaveBeenCalledTimes(1);
    expect(saveUserToken).not.toHaveBeenCalled();
    expect(currentAuth().userToken).toBeNull();
    expect(currentAuth().userRole).toBeNull();
    expect(currentAuth().isLoading).toBe(false);
  });

  test('saves only the Firebase token after profile validation', async () => {
    jest.mocked(axios.post).mockImplementationOnce(async () => {
      expect(saveUserToken).not.toHaveBeenCalled();
      return {
        data: { role: 'standard' }, status: 200, statusText: 'OK',
        headers: {}, config: { headers: new AxiosHeaders() },
      };
    });
    await login(method);
    expect(saveUserToken).toHaveBeenCalledTimes(1);
    expect(saveUserToken).toHaveBeenCalledWith('synthetic-firebase-token');
    expect(currentAuth().userRole).toBe('Standard');
    expect(firebaseSignOut).not.toHaveBeenCalled();
  });
});

test('Google cancellation preserves an existing application session', async () => {
  await act(async () => currentAuth().signIn('synthetic-existing-token', 'Standard'));
  mockGoogleSignIn.mockResolvedValueOnce({ type: 'cancelled', data: null });
  await login('Google');
  expect(mockAuthenticate).not.toHaveBeenCalled();
  expect(axios.post).not.toHaveBeenCalled();
  expect(firebaseSignOut).not.toHaveBeenCalled();
  expect(clearUserToken).not.toHaveBeenCalled();
  expect(currentAuth().userToken).toBe('synthetic-existing-token');
});

test.each(['firebase', 'credentials', 'cache'] as const)(
  'a %s cleanup error does not hide the profile error or stop other cleanup', async step => {
    await act(async () => {
      await currentAuth().signIn('synthetic-existing-token', 'Standard');
      currentAuth().addWord({ id: 'demo-word', word: 'bonjour', examples: [] });
    });
    const cleanup = { firebase: firebaseSignOut, credentials: clearUserToken, cache: clearLocalWords };
    jest.mocked(cleanup[step]).mockRejectedValueOnce(new Error('Cleanup unavailable.'));
    jest.mocked(axios.post).mockRejectedValueOnce(new Error('Original profile error.'));
    await login('Google');
    expect(firebaseSignOut).toHaveBeenCalledTimes(1);
    expect(clearUserToken).toHaveBeenCalledTimes(1);
    expect(clearLocalWords).toHaveBeenCalledTimes(1);
    expect(currentAuth().userToken).toBeNull();
    expect(currentAuth().userRole).toBeNull();
    expect(currentAuth().savedWords).toEqual([]);
    expect(currentAuth().isLoading).toBe(false);
    expect(Alert.alert).toHaveBeenCalledWith('Erreur', 'Original profile error.');
  }
);
