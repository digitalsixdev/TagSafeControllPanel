import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import enTranslation from "../locales/en.json";
import ptTranslation from "../locales/pt.json";

i18next
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'pt',
        supportedLngs: ['pt', 'en'],
        detection: {
            order: ['localStorage', 'navigator'],
            lookupLocalStorage: 'lang',
            caches: ['localStorage'],
            convertDetectedLanguage: (lng) => lng.split('-')[0],
        },
        resources: {
            en: { translation: enTranslation },
            pt: { translation: ptTranslation },
        },
        interpolation: {
            escapeValue: false,
        },
    });

export default i18next;
