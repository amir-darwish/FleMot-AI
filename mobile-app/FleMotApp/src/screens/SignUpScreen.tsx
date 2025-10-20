import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  getIdToken
} from '@react-native-firebase/auth';

const SignUpScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const handleSignUp = async () => {
    if (!email || !password || !firstName || !lastName) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    setIsLoading(true);
    try {
      const auth = getAuth();

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`,
      });

      const firebaseJwt = await getIdToken(userCredential.user);
      console.log(' JWT récupéré:', firebaseJwt);

      const response = await axios.post(
              'http://10.0.2.2:8000/api/auth/register',
              { firstName, lastName },
              {
                headers: { Authorization: `Bearer ${firebaseJwt}` },
              }
            );

      console.log('Utilisateur créé avec succès !', response.data);
      Alert.alert('Succès', 'Votre compte a été créé. Veuillez vous connecter.');
      navigation.goBack();

    } catch (error: any) {
      console.error('Firebase SignUp error:', error);
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Erreur', 'Cet e-mail est déjà utilisé.');
      } else if (error.code === 'auth/weak-password') {
        Alert.alert('Erreur', 'Le mot de passe est trop faible.');
      } else {
        Alert.alert('Erreur', "Une erreur s'est produite lors de la création du compte.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Créer un compte</Text>

      <TextInput
        style={styles.input}
        placeholder="Prénom"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Nom de famille"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button
        title={isLoading ? "Création en cours..." : "Créer le compte"}
        onPress={handleSignUp}
        disabled={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 10,
    fontSize: 16,
  },
});

export default SignUpScreen;
