import React, { useCallback } from 'react';
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
import { useAuth } from '../App';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';

type PersonalWord = {
  id: string;
  word: string;
  examples: { sentence: string; translation: string; }[];
};

const WordListScreen = () => {
  const authContext = useAuth();
  const navigation = useNavigation<any>();

  const words = authContext?.savedWords ?? [];
  const isLoading = authContext?.isLoading ?? true;


  useFocusEffect(
    useCallback(() => {

      authContext?.syncData();
    }, [authContext?.syncData])
  );

  const handleDelete = async (wordId: string) => {
    Alert.alert(
      'Supprimer le mot',
      'Êtes-vous sûr de vouloir supprimer ce mot de votre liste ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            authContext?.removeWord(wordId);

            try {
              await api.delete(`/personalwords/${wordId}`);
            } catch (error) {
              console.error('Delete failed, probably offline.', error);
              Alert.alert('Erreur', "L'opération a échoué. Vérifiez votre connexion internet.");
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
          <Text style={styles.emptyText}>Votre liste est vide.</Text>
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