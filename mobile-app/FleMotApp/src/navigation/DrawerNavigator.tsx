import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Button } from 'react-native';

import MainStackNavigator from './MainStackNavigator'; //
//import WordListScreen from '../screens/WordListScreen';
import SubscriptionScreen from '../screens/SubscriptionScreen';
import { useAuth } from '../context/AuthContext';

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  const authContext = useAuth();

  return (
    <Drawer.Navigator
      initialRouteName="AccueilStack"
      screenOptions={{
        headerRight: () => (
          <Button
            onPress={() => authContext?.signOut()}
            title="Déconnexion"
            color="#d9534f"
          />
        ),
      }}
    >

      <Drawer.Screen
        name="AccueilStack"
        component={MainStackNavigator}
        options={{ title: 'Accueil' }}
      />
      <Drawer.Screen
        name="Mes Mots"
        component={MainStackNavigator}
        initialParams={{ screen: 'WordList' }}
      />
      <Drawer.Screen name="Mon Abonnement" component={SubscriptionScreen} />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;