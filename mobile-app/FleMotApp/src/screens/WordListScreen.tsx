import React, { useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { useWordList } from '../hooks/useWordList';

const WordListScreen = () => {
  const navigation = useNavigation<any>();
  const { words, isSyncing, syncData, deleteWord } = useWordList();

  useFocusEffect(
      useCallback(() => {
        syncData();
      }, [syncData])
  );

  const handleDelete = (wordId: string) => {
    Alert.alert(
        'Supprimer le mot',
        'Êtes-vous sûr de vouloir supprimer ce mot de votre liste ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Supprimer', style: 'destructive', onPress: () => deleteWord(wordId) }
        ]
    );
  };

  const handleWordPress = (word: typeof words[0]) => {
    navigation.navigate('Results', {
      searchResult: {
        word: word.word,
        examples: word.examples,
        isAlreadySaved: true
      }
    });
  };

  if (isSyncing) {
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
            ListHeaderComponent={<Text style={styles.title}>Mes Mots Sauvegardés</Text>}
            ListEmptyComponent={<Text style={styles.emptyText}>Votre liste est vide.</Text>}

        />
          <TouchableOpacity onPress={syncData}>
              <Icon name="refresh-cw" size={20} color="#007AFF" />
          </TouchableOpacity>
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
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: 'gray' },
});

export default WordListScreen;
