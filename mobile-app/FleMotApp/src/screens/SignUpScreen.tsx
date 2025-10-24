import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  getIdToken
} from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Feather';

const SignUpScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigation = useNavigation();


  const passwordRequirements = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

``````````````````````````````````````````````````````````  const isPasswordValid = Object.values(passwordRequirements).every(Boolean);

  const validateForm = () => {
    if (!email || !password || !firstName || !lastName) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return false;
    }

    if (!isPasswordValid) {
      Alert.alert('Erreur', 'Le mot de passe ne respecte pas toutes les exigences de sécurité.');
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

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
        'https://nancee-nonadoptable-incisively.ngrok-free.dev/api/auth/register',
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

  const RequirementItem = ({ met, text }) => (
    <View style={styles.requirementItem}>
      <Icon
        name={met ? "check" : "x"}
        size={16}
        color={met ? "#4CAF50" : "#F44336"}
      />
      <Text style={[styles.requirementText, met && styles.requirementMet]}>
        {text}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            <Text style={styles.title}>Créer un compte</Text>

            <View style={styles.inputContainer}>
              <Icon name="user" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Prénom"
                placeholderTextColor="#999"
                value={firstName}
                onChangeText={setFirstName}
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="users" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Nom de famille"
                placeholderTextColor="#999"
                value={lastName}
                onChangeText={setLastName}
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="mail" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
              />
            </View>

            <View style={styles.inputContainer}>
              <Icon name="lock" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                returnKeyType="done"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Icon
                  name={showPassword ? "eye-off" : "eye"}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            {/* مؤشر قوة كلمة المرور */}
            <View style={styles.passwordStrengthContainer}>
              <Text style={styles.passwordStrengthTitle}>Exigences du mot de passe:</Text>

              <RequirementItem
                met={passwordRequirements.minLength}
                text="Au moins 8 caractères"
              />
              <RequirementItem
                met={passwordRequirements.hasUpperCase}
                text="Au moins une lettre majuscule"
              />
              <RequirementItem
                met={passwordRequirements.hasLowerCase}
                text="Au moins une lettre minuscule"
              />
              <RequirementItem
                met={passwordRequirements.hasNumber}
                text="Au moins un chiffre"
              />
              <RequirementItem
                met={passwordRequirements.hasSpecialChar}
                text="Au moins un caractère spécial"
              />

              {password.length > 0 && (
                <View style={[
                  styles.passwordStatus,
                  isPasswordValid ? styles.passwordValid : styles.passwordInvalid
                ]}>
                  <Text style={styles.passwordStatusText}>
                    {isPasswordValid ? '✓ Mot de passe sécurisé' : '✗ Mot de passe faible'}
                  </Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[styles.button, (!isPasswordValid || isLoading) && styles.buttonDisabled]}
              onPress={handleSignUp}
              disabled={!isPasswordValid || isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <Icon name="loader" size={20} color="#FFF" style={styles.spinner} />
                  <Text style={styles.buttonText}>Création en cours...</Text>
                </View>
              ) : (
                <Text style={styles.buttonText}>Créer le compte</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginLink}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.loginText}>
                Déjà un compte? <Text style={styles.loginLinkText}>Se connecter</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    paddingVertical: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 15,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: 50,
    borderColor: '#DDD',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 45,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
    color: '#333',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    padding: 10,
  },
  passwordStrengthContainer: {
    backgroundColor: '#F8F9FA',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  passwordStrengthTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  requirementMet: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  passwordStatus: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  passwordValid: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
    borderWidth: 1,
  },
  passwordInvalid: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
    borderWidth: 1,
  },
  passwordStatusText: {
    fontWeight: '600',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    backgroundColor: '#CCC',
    shadowColor: '#000',
    shadowOpacity: 0.1,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spinner: {
    marginRight: 10,
  },
  loginLink: {
    alignItems: 'center',
    marginTop: 10,
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLinkText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default SignUpScreen;