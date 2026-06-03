import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslation from "../locales/en.json";
import ptTranslation from "../locales/pt.json";

i18next
    .use(initReactI18next)
    .init({
        lng: localStorage.getItem('lang') || 'en',
        fallbackLng: 'en',
        resources: {
            en: {
                translation: enTranslation,
            },
            pt: {
                translation: ptTranslation,
            },
        },
        interpolation: {
            escapeValue: false,
        },
    });

export default i18next;
