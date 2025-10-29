import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getApp } from '@react-native-firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential
} from '@react-native-firebase/auth';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import Keychain from 'react-native-keychain';
import axios from 'axios';

const LoginScreen = () => {
  const authContext = useAuth();
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const app = getApp();
  const auth = getAuth(app);

  // --- Connexion Google ---
  const handleGoogleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const userInfo = await GoogleSignin.signIn();

      const idToken = userInfo.data?.idToken || userInfo.idToken;
      if (!idToken) throw new Error('Google Sign-In failed to return an ID token.');

      const googleCredential = GoogleAuthProvider.credential(idToken);

      await Keychain.setGenericPassword('firebase_token', idToken);

      const firebaseUserCredential = await signInWithCredential(auth, googleCredential);
      console.log('Connecté à Firebase ! UID:', firebaseUserCredential.user.uid);

      const firebaseJwt = await firebaseUserCredential.user.getIdToken();
      console.log('JWT récupéré:', firebaseJwt);

      const response = await axios.post('https://nancee-nonadoptable-incisively.ngrok-free.dev/api/auth/register', {}, {
        headers: { 'Authorization': `Bearer ${firebaseJwt}` }
      });

      console.log('Utilisateur enregistré dans notre BDD:', response.data);

      if (authContext && firebaseJwt) {
        authContext.signIn(firebaseJwt);
      } else {
        throw new Error("Auth context n'est pas disponible.");
      }

    } catch (error: any) {
      console.error('Erreur Google:', error);
      Alert.alert('Erreur', error.message || 'Une erreur est survenue lors de la connexion Google.');
    }
  };

  // --- Connexion e-mail/mot de passe ---
  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir l\'e-mail et le mot de passe.');
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const jwtToken = await userCredential.user.getIdToken();

      if (authContext && jwtToken) {
        console.log(jwtToken);
        authContext.signIn(jwtToken);
      }
    } catch (error: any) {
      console.error('Erreur email login:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        Alert.alert('Erreur', 'E-mail ou mot de passe incorrect.');
      } else {
        Alert.alert('Erreur', error.message || 'Une erreur est survenue lors de la connexion.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!isLoading}
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        editable={!isLoading}
      />

      <TouchableOpacity
        style={[styles.button, styles.emailButton]}
        onPress={handleEmailLogin}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>Se connecter</Text>
      </TouchableOpacity>

      <Text style={styles.separator}>ou</Text>

      <Button
        title="Continuer avec Google"
        onPress={handleGoogleLogin}
        disabled={isLoading}
      />

      <TouchableOpacity style={{ marginTop: 20 }} onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.linkText}>Pas de compte ? Créez-en un ici.</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  button: { paddingVertical: 15, borderRadius: 8, alignItems: 'center' },
  emailButton: { backgroundColor: '#007AFF' },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  separator: { textAlign: 'center', marginVertical: 15, fontSize: 16, color: 'gray' },
  linkText: { color: '#007AFF', fontSize: 16, textAlign: 'center' },
});

export default LoginScreen;
