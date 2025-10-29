import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import {
    getUserToken,
    saveUserToken,
    clearUserToken,
    firebaseSignOut
} from '../services/authService';
import {
    getLocalWords,
    saveLocalWords,
    clearLocalWords
} from '../services/storageService';
import { PersonalWord } from '../types/word';
import api from '../services/api';


type AuthContextType = {
    userToken: string | null;
    userRole: 'Standard' | 'Premium' | null;
    userLanguage: string | null;
    savedWords: PersonalWord[];
    isLoading: boolean;
    hasSelectedLanguage: boolean;
    addWord: (word: PersonalWord) => void;
    removeWord: (wordId: string) => void;

    signIn: (token: string, role: 'Standard' | 'Premium') => Promise<void>;
    signOut: () => Promise<void>;
    syncData: () => Promise<void>;

    updateLanguage: (language: string) => Promise<void>;
    setUserLanguage: React.Dispatch<React.SetStateAction<string | null>>;
    setHasSelectedLanguage: React.Dispatch<React.SetStateAction<boolean>>;
};


const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userToken, setUserToken] = useState<string | null>(null);
    const [savedWords, setSavedWords] = useState<PersonalWord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userRole, setUserRole] = useState<'Standard' | 'Premium' | null>(null);
    const [userLanguage, setUserLanguage] = useState<string | null>('English');
    const [hasSelectedLanguage, setHasSelectedLanguage] = useState(false);


    // get token and words
    useEffect(() => {
        (async () => {
            const token = await getUserToken();
            const words = await getLocalWords();
            if (token) setUserToken(token);
            if (words) setSavedWords(words);
            setIsLoading(false);
        })();
    }, []);

    //
    // sign in
    //
    const signIn = async (
        token: string,
        role: 'Standard' | 'Premium',
        language?: string
    ) => {
        setIsLoading(true);
        await saveUserToken(token);
        setUserToken(token);
        setUserRole(role);
        setUserLanguage(language || null);
        setIsLoading(false);
    };


    //
    // sing out
    //
    const signOut = async () => {
        await firebaseSignOut();
        await clearUserToken();
        await clearLocalWords();
        setUserToken(null);
        setSavedWords([]);
        setUserRole(null);
    };

    //
    // add word
    //
    const addWord = async (word: PersonalWord) => {
        const next = [...savedWords, word];
        setSavedWords(next);
        await saveLocalWords(next);
    };

    //
    // delete word
    //
    const removeWord = async (id: string) => {
        const next = savedWords.filter(w => w.id !== id);
        setSavedWords(next);
        await saveLocalWords(next);
    };

    //
    // sync data with backend
    //
    const syncData = async () => {
        if (!userToken) return;
        try {
            const response = await api.get('/personalwords');
            setSavedWords(response.data);
            await saveLocalWords(response.data);
        } catch (e) {
            Alert.alert('Erreur', 'Échec de la synchronisation');
        }
    };
    const updateLanguage = async (language: string) => {
        if (!userToken) return;

        try {
            await api.put('/api/User/language', { language });
            setUserLanguage(language);
        } catch (error) {
            console.error('Failed to update language:', error);
            Alert.alert('Erreur', 'Impossible de sauvegarder la langue.');
        }
    };

    //
    // send context values
    //
    return (
        <AuthContext.Provider
            value={{
                userToken,
                userRole,
                userLanguage,
                hasSelectedLanguage,
                savedWords,
                isLoading,
                signIn,
                signOut,
                addWord,
                removeWord,
                syncData,
                updateLanguage,
                setUserLanguage,
                setHasSelectedLanguage,

            }}
        >
            {children}
        </AuthContext.Provider>
    );
};


export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
