import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './context/AuthContext';
import AppNavigator from './navigation/AppNavigator';
import Toast from 'react-native-toast-message';

export default function App() {
  return (
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
            <Toast />
        </NavigationContainer>
      </AuthProvider>
  );
}
