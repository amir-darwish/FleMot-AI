import React from 'react';
import { View, Text, Button } from 'react-native';

const HomeScreen = () => {
  // TODO: Ajouter une fonction de déconnexion
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Bienvenue sur l'écran d'accueil !</Text>
      <Button title="Se déconnecter" onPress={() => { /* Logique de déconnexion */ }} />
    </View>
  );
};

export default HomeScreen;