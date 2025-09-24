import React, { useState, useEffect, createContext, useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Keychain from 'react-native-keychain';
import auth from '@react-native-firebase/auth';
import api from './services/api';

import LoginScreen from './screens/LoginScreen';
import DrawerNavigator from './navigation/DrawerNavigator';

type AuthContextType = {
  userToken: string | null;
  savedWords: Set<string>;
  isLoading: boolean;
  updateSavedWords: (newWord: string) => void;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const Stack = createStackNavigator();

const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" />
  </View>
);

const App = () => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [savedWords, setSavedWords] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const credentials = await Keychain.getGenericPassword();
        if (credentials) {
          setUserToken(credentials.password);
        }
      } catch (e) {
        console.error("Erreur de bootstrap", e);
      }
      setIsLoading(false);
    };

    bootstrapAsync();
  }, []);

  const authContext: AuthContextType = {
    userToken,
    savedWords,
    isLoading,
    signIn: async (token: string) => {
      setIsLoading(true);
      await Keychain.setGenericPassword('userToken', token);
      try {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        const response = await api.get('/personalwords');
        const words = response.data.map((item: any) => item.word);
        setSavedWords(new Set(words));
      } catch (error) {
        console.error("Failed to fetch personal words on sign-in", error);
      }
      setUserToken(token);
      setIsLoading(false);
    },
    signOut: async () => {
      await auth().signOut();
      await Keychain.resetGenericPassword();
      setSavedWords(new Set());
      setUserToken(null);
    },
    updateSavedWords: (newWord: string) => {
      setSavedWords(prevWords => new Set(prevWords).add(newWord));
    },
  };

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <Stack.Navigator>
          {isLoading ? (
            <Stack.Screen name="Loading" component={LoadingScreen} options={{ headerShown: false }} />
          ) : userToken == null ? (
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          ) : (
            <Stack.Screen name="AppDrawer" component={DrawerNavigator} options={{ headerShown: false }} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export default App;