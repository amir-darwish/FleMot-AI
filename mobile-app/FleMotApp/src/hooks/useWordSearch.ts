import { useState } from 'react';
import { searchWord as apiSearchWord } from '../services/api';

import { PersonalWord } from '../types/word';

type SearchResult = {
    data: any;
    isAlreadySaved: boolean;
};

export const useWordSearch = () => {
    const [isLoading, setIsLoading] = useState(false);

    const searchWord = async (token: string, word: string, savedWords: PersonalWord[]): Promise<SearchResult> => {
        setIsLoading(true);
        try {
            const response = await apiSearchWord(token, word);
            const isAlreadySaved = savedWords.some(w => w.word.toLowerCase() === word.toLowerCase());

            return { data: response, isAlreadySaved };
        } finally {
            setIsLoading(false);
        }
    };

    return { searchWord, isLoading };
};
