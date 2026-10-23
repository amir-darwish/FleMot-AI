// src/hooks/useWordList.ts
import { useState, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { PersonalWord } from '../types/word';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useWordList = () => {
    const { userToken, removeWord } = useAuth();
    const [words, setWords] = useState<PersonalWord[]>([]);
    const [isSyncing, setIsSyncing] = useState(false);

    // 🔄 جلب الكلمات من الخادم أو من التخزين المحلي
    const syncData = useCallback(async () => {
        if (!userToken) return;

        setIsSyncing(true);
        try {
            const response = await api.get('/personalwords');
            const serverWords: PersonalWord[] = response.data;

            setWords(serverWords);
            await AsyncStorage.setItem('savedWords', JSON.stringify(serverWords));
        } catch (e) {
            console.log('Sync failed, fallback to local storage', e);
            const local = await AsyncStorage.getItem('savedWords');
            if (local) {
                setWords(JSON.parse(local));
            }
        } finally {
            setIsSyncing(false);
        }
    }, [userToken]);

    // 🗑️ حذف كلمة
    const deleteWord = useCallback(async (wordId: string) => {
        removeWord(wordId);
        setWords(prev => prev.filter(w => w.id !== wordId));

        try {
            await api.delete(`/personalwords/${wordId}`);
        } catch (e) {
            console.warn('Delete failed, offline?');
        }
    }, [removeWord]);

    return { words, isSyncing, syncData, deleteWord };
};
