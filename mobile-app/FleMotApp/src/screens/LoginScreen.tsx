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
import axios from 'axios';

const mapUserRole = (role: unknown): 'Standard' | 'Premium' => {
  switch (role) {
    case 'standard':
      return 'Standard';
    case 'premium':
      return 'Premium';
    default:
      throw new Error("Le rôle du profil utilisateur n'est pas reconnu.");
  }
};

const LoginScreen = () => {
  const authContext = useAuth();
  const navigation = useNavigation<any>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const app = getApp();
  const auth = getAuth(app);

  const cleanupFailedLogin = async () => {
    try {
      await authContext.signOut();
    } catch {
      console.error('Nettoyage de la connexion incomplet.');
    }
  };

  // --- Connexion Google ---
  const handleGoogleLogin = async () => {
    let firebaseAuthenticated = false;
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const userInfo = await GoogleSignin.signIn();

      if (userInfo.type === 'cancelled') return;
      const idToken = userInfo.data.idToken;
      if (!idToken) throw new Error('Google Sign-In failed to return an ID token.');

      const googleCredential = GoogleAuthProvider.credential(idToken);

      const firebaseUserCredential = await signInWithCredential(auth, googleCredential);
      firebaseAuthenticated = true;
      console.log('Connecté à Firebase !');

      const firebaseJwt = await firebaseUserCredential.user.getIdToken();

      const response = await axios.post<{ role: unknown }>('https://nancee-nonadoptable-incisively.ngrok-free.dev/api/auth/register', {}, {
        headers: { 'Authorization': `Bearer ${firebaseJwt}` }
      });

      console.log('Utilisateur enregistré dans notre BDD.');

      if (authContext && firebaseJwt) {
        await authContext.signIn(firebaseJwt, mapUserRole(response.data.role));
      } else {
        throw new Error("Auth context n'est pas disponible.");
      }

    } catch (error: any) {
      if (firebaseAuthenticated) await cleanupFailedLogin();
      console.error('Erreur lors de la connexion Google.');
      Alert.alert('Erreur', error.message || 'Une erreur est survenue lors de la connexion Google.');
    }
  };

  // --- Connexion e-mail/mot de passe ---
  const handleEmailLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir l\'e-mail et le mot de passe.');
      return;
    }

    let firebaseAuthenticated = false;
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      firebaseAuthenticated = true;
      const jwtToken = await userCredential.user.getIdToken();

      if (authContext && jwtToken) {
        const response = await axios.post<{ role: unknown }>('https://nancee-nonadoptable-incisively.ngrok-free.dev/api/auth/register', {}, {
          headers: { 'Authorization': `Bearer ${jwtToken}` }
        });
        await authContext.signIn(jwtToken, mapUserRole(response.data.role));
      }
    } catch (error: any) {
      if (firebaseAuthenticated) await cleanupFailedLogin();
      console.error('Erreur lors de la connexion e-mail.');
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
