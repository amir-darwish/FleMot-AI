// src/context/AuthContext.tsx
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

//
// 🧠 تعريف نوع السياق (Context Type)
//
type AuthContextType = {
    userToken: string | null;
    userRole: 'Standard' | 'Premium' | null;
    savedWords: PersonalWord[];
    isLoading: boolean;
    addWord: (word: PersonalWord) => void;
    removeWord: (wordId: string) => void;
    signIn: (token: string, role: 'Standard' | 'Premium') => Promise<void>;
    signOut: () => Promise<void>;
    syncData: () => Promise<void>; // ✅ الاسم الصحيح هنا syncData
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

//
// 🧩 المزوّد (Provider)
//
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userToken, setUserToken] = useState<string | null>(null);
    const [savedWords, setSavedWords] = useState<PersonalWord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [userRole, setUserRole] = useState<'Standard' | 'Premium' | null>(null);

    // 🚀 تحميل البيانات عند بدء التطبيق
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
    // 🔐 تسجيل الدخول
    //
    const signIn = async (token: string, role: 'Standard' | 'Premium') => {
        setIsLoading(true);
        await saveUserToken(token);
        setUserToken(token);
        setUserRole(role);
        setIsLoading(false);
    };

    //
    // 🚪 تسجيل الخروج
    //
    const signOut = async () => {
        const results = await Promise.allSettled([
            firebaseSignOut(),
            clearUserToken(),
            clearLocalWords(),
        ]);
        setUserToken(null);
        setSavedWords([]);
        setUserRole(null);
        setIsLoading(false);
        if (results.some(result => result.status === 'rejected')) {
            throw new Error('Le nettoyage de la session est incomplet.');
        }
    };

    //
    // 💾 إضافة كلمة
    //
    const addWord = async (word: PersonalWord) => {
        const next = [...savedWords, word];
        setSavedWords(next);
        await saveLocalWords(next);
    };

    //
    // 🗑️ حذف كلمة
    //
    const removeWord = async (id: string) => {
        const next = savedWords.filter(w => w.id !== id);
        setSavedWords(next);
        await saveLocalWords(next);
    };

    //
    // 🔄 مزامنة البيانات مع الخادم
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


    //
    // 🧱 تمرير القيم إلى باقي التطبيق
    //
    return (
        <AuthContext.Provider
            value={{
                userToken,
                userRole,
                savedWords,
                isLoading,
                signIn,
                signOut,
                addWord,
                removeWord,
                syncData, // ✅ الاسم الصحيح هنا
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

//
// 🪄 Hook لاستخدام السياق بسهولة
//
export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
