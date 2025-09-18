import React, { useState, useEffect, createContext, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Keychain from 'react-native-keychain';
import auth from '@react-native-firebase/auth';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ResultsScreen from './screens/ResultsScreen';

// Création d'un "contexte" pour partager l'état d'authentification dans toute l'app
const AuthContext = createContext<{ userToken: string | null; signIn: (token: string) => void; signOut: () => void; } | null>(null);

const Stack = createStackNavigator();

const App = () => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

useEffect(() => {

  const subscriber = auth().onIdTokenChanged(async (user) => {
    if (user) {
      const token = await user.getIdToken();
      await Keychain.setGenericPassword('userToken', token);
      setUserToken(token);
    } else {
      await Keychain.resetGenericPassword();
      setUserToken(null);
    }
    if (isLoading) {
      setIsLoading(false);
    }
  });

  return subscriber;
}, []);

  // Fonctions pour changer l'état de connexion depuis n'importe où dans l'app
  const authContext = {
    signIn: async (token: string) => {
      await Keychain.setGenericPassword('userToken', token);
      setUserToken(token);
    },
    signOut: async () => {
      await Keychain.resetGenericPassword();
      setUserToken(null);
    },
    userToken,
  };

  if (isLoading) {
    // On peut afficher un écran de chargement ici
    return null;
  }

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <Stack.Navigator>
          {userToken == null ? (
            // Si pas de token, on affiche l'écran de connexion
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          ) : (
            // Si un token existe, on affiche l'écran d'accueil
            <>
              <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Accueil' }}/>
              <Stack.Screen name="Results" component={ResultsScreen} options={{ title: 'Résultats' }} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
};

// On exporte le contexte pour pouvoir l'utiliser dans LoginScreen
export const useAuth = () => {
    return useContext(AuthContext);
}

export default App;