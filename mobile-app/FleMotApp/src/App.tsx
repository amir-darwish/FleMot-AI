import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
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
  const netInfo = useNetInfo();


  const syncData = useCallback(async () => {
    if (!userToken || !netInfo.isConnected) {
        console.log("Offline or no token, skipping sync.");
        return;
    }
    if (!netInfo.isConnected) {
      console.log("Offline, skipping sync.");
      return;
    }
    try {
      console.log("Syncing data with server...");
      const response = await api.get('/personalwords');
      const serverWords: PersonalWord[] = response.data;
      await AsyncStorage.setItem('savedWords', JSON.stringify(serverWords));
      setSavedWords(serverWords);
      console.log("Sync complete!");
    } catch (e) {
      console.error("Failed to sync data", e);
    }
  }, [userToken ,netInfo.isConnected]);


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
      } catch (e) { console.error("Bootstrap error", e); }
      setIsLoading(false);
    };
    bootstrapAsync();
  }, []);

  useEffect(() => {
    if (userToken && netInfo.isConnected === true) {
      syncData();
    }
  }, [netInfo.isConnected, userToken, syncData]);

  const authContext: AuthContextType = {
    userToken,
    savedWords,
    isLoading,
    signIn: async (token: string) => {
      setIsLoading(true);
      await Keychain.setGenericPassword('userToken', token);
      setUserToken(token);
      await syncData();
      setIsLoading(false);
    },
    signOut: async () => {
      await auth().signOut();
      await Keychain.resetGenericPassword();
      await AsyncStorage.removeItem('savedWords');
      setSavedWords([]);
      setUserToken(null);
    },
    addWord: (newWord: PersonalWord) => {
      const newWords = [...savedWords, newWord];
      setSavedWords(newWords);
      AsyncStorage.setItem('savedWords', JSON.stringify(newWords));
    },
    removeWord: (wordId: string) => {
      const newWords = savedWords.filter(w => w.id !== wordId);
      setSavedWords(newWords);
      AsyncStorage.setItem('savedWords', JSON.stringify(newWords));
    },
    syncData,
  };

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