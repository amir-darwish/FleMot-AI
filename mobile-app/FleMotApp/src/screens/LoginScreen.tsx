import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useAuth } from '../App';
import auth, { GoogleAuthProvider } from '@react-native-firebase/auth';
import axios from 'axios';

const LoginScreen = () => {
  const authContext = useAuth();

  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      const userInfo = await GoogleSignin.signIn();

      const idToken = userInfo.data?.idToken;
      console.log("idToken de Google reçu !");

      if (!idToken) {
        throw new Error('Google Sign-In failed to return an ID token.');
      }

      const googleCredential = GoogleAuthProvider.credential(idToken);

      const firebaseUserCredential = await auth().signInWithCredential(googleCredential);
      console.log('Connecté à Firebase ! Utilisateur:', firebaseUserCredential.user.uid);


      const firebaseJwt = await firebaseUserCredential.user.getIdToken();
      console.log("Le JWT pour notre backend est prêt.");

      const response = await axios.post('http://10.0.2.2:8000/api/auth/register', {}, {
        headers: { 'Authorization': `Bearer ${firebaseJwt}` }
      });

      console.log('Utilisateur enregistré dans notre BDD:', response.data);

      if (authContext && firebaseJwt) {
          authContext.signIn(firebaseJwt);
      } else {
        throw new Error("Auth context n'est pas disponible.");
      }

    } catch (error: any) {
      console.error('Une erreur est survenue:', error);
      Alert.alert('Erreur', error.message || 'Une erreur est survenue lors de la connexion.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenue sur FleMot</Text>
      <Button
        title="Continuer avec Google"
        onPress={handleGoogleLogin}
      />
    </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 24, fontWeight: 'bold', marginBottom: 30 },
});

export default LoginScreen;