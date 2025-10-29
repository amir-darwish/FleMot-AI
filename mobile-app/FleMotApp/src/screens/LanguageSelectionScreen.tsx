import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { COLORS } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const LANGUAGES = [
    { code: 'English', name: 'English 🇬🇧' },
    { code: 'Arabe', name: 'العربية 🇸🇦' },
    { code: 'Español', name: 'Español 🇪🇸' },
    { code: 'Português', name: 'Português 🇵🇹' },
    { code: 'Deutsch', name: 'Deutsch 🇩🇪' },
    { code: 'Türkçe', name: 'Türkçe 🇹🇷' },
    { code: 'Українська', name: 'Українська 🇺🇦' },
    { code: 'Pashto', name: 'پښتو 🇦🇫' },// إضافة الباشتو


];

const LanguageSelectionScreen = () => {
    const navigation = useNavigation<any>();
    const { userToken, setUserLanguage, setHasSelectedLanguage } = useAuth();
    const [selectedLang, setSelectedLang] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleConfirm = async () => {
        if (!selectedLang) {
            Toast.show({
                type: 'info',
                text1: 'Select a language first!',
            });
            return;
        }

        try {
            setLoading(true);
            // ✅ استدعاء الـ PUT إلى الباك
            await api.put(
                '/User/language',
                { language: selectedLang },
                { headers: { Authorization: `Bearer ${userToken}` } }
            );

            // تحديث الحالة محليًا
            setUserLanguage(selectedLang);
            setHasSelectedLanguage(true);

            Toast.show({
                type: 'success',
                text1: 'Language updated successfully 🌍',
            });

            // الانتقال إلى الصفحة الرئيسية
            setTimeout(() => {
                navigation.replace('AppDrawer');
            }, 1200);
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de changer la langue.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🌍 Select Your Native Language</Text>

            <View style={styles.listContainer}>
                {LANGUAGES.map((lang) => (
                    <TouchableOpacity
                        key={lang.code}
                        style={[
                            styles.languageOption,
                            selectedLang === lang.code && styles.languageOptionSelected,
                        ]}
                        onPress={() => setSelectedLang(lang.code)}
                    >
                        <Text
                            style={[
                                styles.languageText,
                                selectedLang === lang.code && styles.languageTextSelected,
                            ]}
                        >
                            {lang.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity
                style={[styles.confirmButton, loading && styles.disabledButton]}
                onPress={handleConfirm}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.confirmText}>Continue</Text>
                )}
            </TouchableOpacity>

            <Toast position="top" visibilityTime={2000} topOffset={70} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        padding: 24,
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 30,
        color: COLORS.text,
    },
    listContainer: {
        marginBottom: 30,
    },
    languageOption: {
        backgroundColor: '#FFF',
        paddingVertical: 14,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    languageOptionSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    languageText: {
        textAlign: 'center',
        fontSize: 18,
        color: COLORS.text,
    },
    languageTextSelected: {
        color: '#FFF',
        fontWeight: '700',
    },
    confirmButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
    },
    confirmText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '600',
    },
    disabledButton: {
        backgroundColor: '#B0BEC5',
    },
});

export default LanguageSelectionScreen;
