import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import api from '../services/api';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';

type PersonalWord = {
  id: string;
  word: string;
  examples: { sentence: string; translation: string; }[];
};

const WordListScreen = () => {
  const [words, setWords] = useState<PersonalWord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigation = useNavigation<any>();
  const isFocused = useIsFocused();

  const fetchWords = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/personalwords');
      setWords(response.data);
    } catch (error) {
      Alert.alert("Erreur", "Impossible de charger votre liste de mots.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      fetchWords();
    }
  }, [isFocused]);

  const handleDelete = async (wordId: string) => {
    Alert.alert(
      "Supprimer le mot",
      "Êtes-vous sûr de vouloir supprimer ce mot de votre liste ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/personalwords/${wordId}`);
              setWords(currentWords => currentWords.filter(word => word.id !== wordId));
            } catch (error) {
              Alert.alert("Erreur", "Impossible de supprimer le mot.");
            }
          }
        }
      ]
    );
  };

  const handleWordPress = (word: PersonalWord) => {
    navigation.navigate('Results', {
      searchResult: {
        word: word.word,
        examples: word.examples,
         isAlreadySaved: true
      }
    });
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={words}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handleWordPress(item)}>
            <Text style={styles.wordText}>{item.word}</Text>
            <TouchableOpacity onPress={() => handleDelete(item.id)}>
              <Icon name="trash-2" size={24} color="#d9534f" />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        ListHeaderComponent={
          <Text style={styles.title}>Mes Mots Sauvegardés</Text>
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>Votre liste est vide. Commencez par sauvegarder des mots !</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginVertical: 20, color: '#333' },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginHorizontal: 15,
    marginBottom: 10,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  wordText: { fontSize: 18, fontWeight: '500' },
  deleteText: { fontSize: 20 },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: 'gray' },
});

export default WordListScreen;