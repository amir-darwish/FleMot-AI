import { useState } from 'react';
import { updateUserLanguage } from '../services/userService';
import Toast from 'react-native-toast-message';

export const useLanguageSelection = (onSuccess: () => void) => {
    const [selectedLang, setSelectedLang] = useState<string>('en');
    const [loading, setLoading] = useState(false);

    const saveLanguage = async () => {
        if (!selectedLang) {
            Toast.show({ type: 'error', text1: 'Veuillez choisir une langue.' });
            return;
        }

        setLoading(true);
        try {
            await updateUserLanguage(selectedLang);
            Toast.show({
                type: 'success',
                text1: 'Langue enregistrée',
                text2: 'Votre langue a été mise à jour.',
            });
            onSuccess();
        } catch (error) {
            console.error(error);
            Toast.show({
                type: 'error',
                text1: 'Erreur',
                text2: "Impossible d'enregistrer la langue.",
            });
        } finally {
            setLoading(false);
        }
    };

    return {
        selectedLang,
        setSelectedLang,
        saveLanguage,
        loading,
    };
};
