import React, { useState, useEffect, createContext, useContext, useCallback, useMemo, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import Keychain from 'react-native-keychain';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './services/api';
import { useNetInfo } from '@react-native-community/netinfo';
import LoginScreen from './screens/LoginScreen';
import DrawerNavigator from './navigation/DrawerNavigator';

type PersonalWord = { id: string; word: string; examples: any[] };
type AuthContextType = {
  userToken: string | null;
  savedWords: PersonalWord[];
  isLoading: boolean;
  addWord: (word: PersonalWord) => void;
  removeWord: (wordId: string) => void;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  syncData: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const App = () => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [savedWords, setSavedWords] = useState<PersonalWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const isSyncingRef = useRef(false);
  const netInfo = useNetInfo();

  const syncData = useCallback(async () => {
    if (!userToken) {
      console.log('[syncData] no token — skipping');
      return;
    }
    if (!netInfo.isConnected) {
      console.log('[syncData] offline — skipping');
      return;
    }
    if (isSyncingRef.current) {
      console.log('[syncData] already syncing — skipping');
      return;
    }

    try {
      isSyncingRef.current = true;
      setIsSyncing(true);

      console.log('Syncing data with server...');
      const response = await api.get('/personalwords');
      const serverWords: PersonalWord[] = response.data;

      const serverJson = JSON.stringify(serverWords);
      await AsyncStorage.setItem('savedWords', serverJson);

      setSavedWords(prev => {
        const prevJson = JSON.stringify(prev);
        if (prevJson === serverJson) {
          return prev;
        }
        return serverWords;
      });

      console.log('Sync complete!');
    } catch (e) {
      console.error('Failed to sync data', e);
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, [userToken, netInfo.isConnected]);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const credentials = await Keychain.getGenericPassword();
        if (credentials) {
          const token = credentials.password;
          setUserToken(token);
          const localData = await AsyncStorage.getItem('savedWords');
          if (localData) {
            setSavedWords(JSON.parse(localData));
          }
        }
      } catch (e) {
        console.error('Bootstrap error', e);
      } finally {
        setIsLoading(false);
      }
    };
    bootstrapAsync();
  }, []);

  useEffect(() => {
    if (userToken && netInfo.isConnected === true) {
      syncData();
    }
  }, [userToken, netInfo.isConnected]);

  const addWord = useCallback((newWord: PersonalWord) => {
    setSavedWords(prev => {
      const next = [...prev, newWord];
      AsyncStorage.setItem('savedWords', JSON.stringify(next));
      return next;
    });
  }, []);

  const removeWord = useCallback((wordId: string) => {
    setSavedWords(prev => {
      const next = prev.filter(w => w.id !== wordId);
      AsyncStorage.setItem('savedWords', JSON.stringify(next));
      return next;
    });
  }, []);

  const signIn = useCallback(async (token: string) => {
    setIsLoading(true);
    await Keychain.setGenericPassword('firebase_token', token);
    setUserToken(token);
    await syncData();
    setIsLoading(false);
  }, [syncData]);

  const signOut = useCallback(async () => {
    await auth().signOut();
    await Keychain.resetGenericPassword();
    await AsyncStorage.removeItem('savedWords');
    setSavedWords([]);
    setUserToken(null);
  }, []);

  const authContext = useMemo(() => ({
    userToken,
    savedWords,
    isLoading,
    addWord,
    removeWord,
    signIn,
    signOut,
    syncData,
  }), [userToken, savedWords, isLoading, addWord, removeWord, signIn, signOut, syncData]);

  if (isLoading) {
    return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator size="large" /></View>;
  }

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        {userToken == null ? <LoginScreen /> : <DrawerNavigator />}
      </NavigationContainer>
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default App;
