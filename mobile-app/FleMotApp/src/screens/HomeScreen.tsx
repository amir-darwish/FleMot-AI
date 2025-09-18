import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, Alert,Button,
  TouchableOpacity, ActivityIndicator
} from 'react-native';
import axios from 'axios';
import Keychain from 'react-native-keychain';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../App';

const HomeScreen = () => {
  const [word, setWord] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<any>();
  const authContext = useAuth();

  const handleSearch = async () => {
    if (!word.trim()) {
      Alert.alert("Erreur", "Veuillez saisir un mot.");
      return;
    }

    setIsLoading(true);
    try {
      const credentials = await Keychain.getGenericPassword();
      if (!credentials) {
        throw new Error("Token non trouvé, veuillez vous reconnecter.");
      }
      const token = credentials.password;

      const response = await axios.post('http://10.0.2.2:8000/api/words/search',
        { word: word },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      navigation.navigate('Results', { searchResult: response.data });

    } catch (error: any) {
      console.error("Erreur de recherche:", error.response?.data || error.message);
      Alert.alert("Erreur", error.response?.data || "Une erreur est survenue.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rechercher un mot </Text>
      <TextInput
        style={styles.input}
        placeholder="Entrez un mot français..."
        value={word}
        onChangeText={setWord}
      />

      <TouchableOpacity
        style={styles.searchButton}
        onPress={handleSearch}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.searchButtonText}>Rechercher</Text>
        )}
      </TouchableOpacity>

      <View style={styles.logoutButtonContainer}>
        <Button title="Se déconnecter" color="#d9534f" onPress={() => authContext?.signOut()} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    height: 50,
    backgroundColor: '#FFFFFF',
    borderColor: '#DDD',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButtonContainer: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center'
  }
});

export default HomeScreen;