import api from './api';

export const updateUserLanguage = async (lang: string) => {
    return api.put('/User/language', { language: lang });
};