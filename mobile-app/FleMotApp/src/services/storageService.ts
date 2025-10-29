import AsyncStorage from '@react-native-async-storage/async-storage';
import { PersonalWord } from '../types/word';

export async function getLocalWords(): Promise<PersonalWord[] | null> {
    const json = await AsyncStorage.getItem('savedWords');
    return json ? JSON.parse(json) : null;
}

export async function saveLocalWords(words: PersonalWord[]) {
    await AsyncStorage.setItem('savedWords', JSON.stringify(words));
}

export async function clearLocalWords() {
    await AsyncStorage.removeItem('savedWords');
}
