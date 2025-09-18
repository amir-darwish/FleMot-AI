import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

type ExamplePair = {
  sentence: string;
  translation: string;
};

type SearchResult = {
  word: string;
  examples: ExamplePair[];
};

const ResultsScreen = ({ route }: any) => {
  const { searchResult } = route.params as { searchResult: SearchResult };

  const renderItem = ({ item }: { item: ExamplePair }) => (
    <View style={styles.card}>
      <Text style={styles.sentence}>{item.sentence}</Text>
      <Text style={styles.translation}>{item.translation}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.wordTitle}>{searchResult.word}</Text>
      <FlatList
        data={searchResult.examples}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={<Text style={styles.emptyText}>Aucun exemple trouvé.</Text>}
      />

      <TouchableOpacity
        style={styles.saveButton}
        onPress={() => { /* Logique de sauvegarde pour US-03 */ }}
      >
        <Text style={styles.saveButtonText}>+ Sauvegarder ce mot</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  wordTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sentence: {
    fontSize: 17,
    marginBottom: 8,
    lineHeight: 24,
    color: '#212121',
  },
  translation: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: 'gray',
  },
  saveButton: {
    backgroundColor: '#28A745',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ResultsScreen;