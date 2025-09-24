import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import ResultsScreen from '../screens/ResultsScreen';
import WordListScreen from '../screens/WordListScreen'

const Stack = createStackNavigator();

const MainStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Results" component={ResultsScreen} options={{ title: 'Résultats de la recherche' }} />
      <Stack.Screen name="WordList" component={WordListScreen} options={{ title: 'Mes Mots Sauvegardés' }} />

    </Stack.Navigator>
  );
};

export default MainStackNavigator;