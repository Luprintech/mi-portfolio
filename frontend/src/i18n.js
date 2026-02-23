import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';

// Arquitectura i18n Preparada para Producción / Escala
// Implementa Lazy Loading de JSONs, detección del navegador (navigator), persistencia (localStorage), fallback y sincronización de atributos HTML (SEO / a11y)

i18n
    .use(resourcesToBackend((language, namespace) => import(`./locales/${language}/${namespace}.json`)))
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: 'es',
        supportedLngs: ['es', 'en'],
        defaultNS: 'common',
        ns: ['common'],

        // React ya filtra (escape) los valores por defecto contra XSS
        interpolation: {
            escapeValue: false
        },

        detection: {
            // Priorizamos localStorage para persistencia explícita del usuario
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
            lookupLocalStorage: 'app_lang'
        }
    });

// Sincronizar el atributo 'lang' del document HTML puro al cambiar de idioma
i18n.on('languageChanged', (lng) => {
    document.documentElement.lang = lng;
});

export default i18n;
