import React, { useState } from 'react';
import { Text, TextInput, StyleSheet, Alert, TouchableOpacity, ActivityIndicator, ScrollView, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useWordSearch } from '../hooks/useWordSearch';

const HomeScreen = () => {
  const [word, setWord] = useState('');
  const navigation = useNavigation<any>();
  const { userToken, savedWords } = useAuth();
  const { searchWord, isLoading } = useWordSearch();

  const handleSearch = async () => {
    if (!word.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un mot.');
      return;
    }
    if (!userToken) {
      Alert.alert('Erreur', 'Vous devez être connecté.');
      return;
    }

    try {
      const result = await searchWord(userToken, word, savedWords);
      navigation.navigate('Results', { searchResult: result.data, isAlreadySaved: result.isAlreadySaved });
    } catch (error: any) {
      console.error(error);
      Alert.alert('Erreur', 'Une erreur est survenue.');
    }
  };

  return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F5F5' }}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Rechercher un mot</Text>
            <TextInput style={styles.input} placeholder="Entrez un mot français..." placeholderTextColor="#999" value={word} onChangeText={setWord} />
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch} disabled={isLoading}>
              {isLoading ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.searchButtonText}>Rechercher</Text>}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
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