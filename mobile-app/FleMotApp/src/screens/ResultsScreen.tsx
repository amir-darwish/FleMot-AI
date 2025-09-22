import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import api from '../services/api';

type ExamplePair = { sentence: string; translation: string; };
type SearchResult = { word: string; examples: ExamplePair[]; };

const ResultsScreen = ({ route }: any) => {
  const { searchResult } = route.params as { searchResult: SearchResult };

  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (feedback) {
      Alert.alert(
        feedback.type === 'success' ? 'Succès' : 'Erreur',
        feedback.message
      );
      setFeedback(null);
    }
  }, [feedback]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const saveData = {
        word: searchResult.word,
        examples: searchResult.examples,
      };
      await api.post('/personalwords', saveData);
      setIsSaved(true);
      setFeedback({ message: `Le mot "${searchResult.word}" a été sauvegardé !`, type: 'success' });
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || "Une erreur est survenue.";
        if (status === 403) {
          setFeedback({ message: "Vous avez atteint votre limite de sauvegarde de 10 mots.", type: 'error' });
        } else if (status === 409) {
          setFeedback({ message: "Vous avez déjà sauvegardé ce mot.", type: 'success' });
          setIsSaved(true);
        } else {
          setFeedback({ message, type: 'error' });
        }
      } else {
        setFeedback({ message: "Impossible de contacter le serveur.", type: 'error' });
      }
    } finally {
      setIsSaving(false);
    }
  };

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
        style={[styles.saveButton, (isSaved || isSaving) && styles.disabledButton]}
        onPress={handleSave}
        disabled={isSaved || isSaving}
      >
        {isSaving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : isSaved ? (
          <Text style={styles.saveButtonText}>Sauvegardé ✓</Text>
        ) : (
          <Text style={styles.saveButtonText}>+ Sauvegarder ce mot</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F5F5F5' },
  wordTitle: { fontSize: 32, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 10, padding: 16, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  sentence: { fontSize: 17, marginBottom: 8, lineHeight: 24, color: '#212121' },
  translation: { fontSize: 15, fontStyle: 'italic', color: '#666' },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: 'gray' },
  saveButton: { backgroundColor: '#28A745', paddingVertical: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  disabledButton: { backgroundColor: '#a5d6a7' },
});

export default ResultsScreen;