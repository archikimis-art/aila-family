import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import des fichiers de traduction
import fr from './locales/fr.json';
import en from './locales/en.json';
import es from './locales/es.json';
import pt from './locales/pt.json';
import de from './locales/de.json';
import it from './locales/it.json';

const LANGUAGE_STORAGE_KEY = 'aila_user_language';

// Configuration des langues disponibles
export const LANGUAGES = [
  { code: 'fr', name: 'Français', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'en', name: 'English', flag: '🇬🇧', nativeName: 'English' },
  { code: 'es', name: 'Español', flag: '🇪🇸', nativeName: 'Español' },
  { code: 'pt', name: 'Português', flag: '🇧🇷', nativeName: 'Português' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', nativeName: 'Deutsch' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', nativeName: 'Italiano' },
];

// Ressources de traduction
const resources = {
  fr: { translation: fr },
  en: { translation: en },
  es: { translation: es },
  pt: { translation: pt },
  de: { translation: de },
  it: { translation: it },
};

// Détection de la langue du navigateur
const detectBrowserLanguage = (): string => {
  if (typeof navigator !== 'undefined') {
    const browserLang = navigator.language?.split('-')[0];
    if (browserLang && LANGUAGES.some(l => l.code === browserLang)) {
      return browserLang;
    }
  }
  return 'fr'; // Français par défaut
};

// Charger la langue sauvegardée
export const loadSavedLanguage = async (): Promise<string> => {
  try {
    const savedLang = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLang && LANGUAGES.some(l => l.code === savedLang)) {
      return savedLang;
    }
  } catch (e) {
    console.error('Error loading saved language:', e);
  }
  return detectBrowserLanguage();
};

// Sauvegarder la langue choisie
export const saveLanguage = async (langCode: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, langCode);
  } catch (e) {
    console.error('Error saving language:', e);
  }
};

// Changer la langue
export const changeLanguage = async (langCode: string): Promise<void> => {
  await i18n.changeLanguage(langCode);
  await saveLanguage(langCode);
};

// Obtenir la langue actuelle
export const getCurrentLanguage = (): string => {
  return i18n.language || 'fr';
};

// Obtenir les infos de la langue actuelle
export const getCurrentLanguageInfo = () => {
  const currentLang = getCurrentLanguage();
  return LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];
};

// Initialisation i18n
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr', // Langue par défaut (sera mise à jour après chargement)
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false, // React gère déjà l'échappement
    },
    react: {
      useSuspense: false, // Désactivé pour éviter les problèmes avec React Native
    },
  });

// Initialisation asynchrone de la langue
(async () => {
  const savedLang = await loadSavedLanguage();
  if (savedLang !== i18n.language) {
    await i18n.changeLanguage(savedLang);
  }
})();

export default i18n;
