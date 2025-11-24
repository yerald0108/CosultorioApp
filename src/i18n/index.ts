// Importar useAppStore para el hook de traducción
import { useAppStore } from '../stores';

// Sistema de internacionalización básico
export const translations = {
  es: {
    common: {
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar',
      edit: 'Editar',
      search: 'Buscar',
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
    },
    navigation: {
      home: 'Inicio',
      families: 'Familias',
      search: 'Búsqueda',
      statistics: 'Estadísticas',
      pami: 'PAMI',
      profile: 'Mi Perfil',
      settings: 'Configuración',
    },
    home: {
      welcome: '¡Bienvenido, {{name}}!',
      subtitle: 'Sistema de Gestión Médica Familiar',
      sessionExpiring: 'Sesión próxima a expirar',
      generalSummary: 'Resumen General',
      families: 'Familias',
      members: 'Integrantes',
      pregnant: 'Gestantes',
    },
    settings: {
      personalization: 'Personalización',
      theme: 'Tema de la Aplicación',
      language: 'Idioma de la Aplicación',
      selectLanguage: 'Seleccionar Idioma',
      currentLanguage: 'Idioma actual: {{language}}',
      spanish: 'Español',
      english: 'Inglés',
      languageChanged: 'Idioma Cambiado',
      spanishActivated: '🇪🇸 Español Activado',
      spanishMessage: '✨ La aplicación ahora está en español.\n\n🌍 Perfecto para usuarios hispanohablantes.\n\n📱 Todos los textos y mensajes aparecerán en español.',
      englishActivated: '🇺🇸 English Activated',
      englishMessage: '✨ The application is now in English.\n\n🌍 Perfect for English-speaking users.\n\n📱 All texts and messages will appear in English.',
      moreLanguagesSoon: '🌍 Más idiomas próximamente',
      futureLanguagesMessage: '🚀 En futuras actualizaciones agregaremos más idiomas como:\n\n• 🇫🇷 Francés\n• 🇩🇪 Alemán\n• 🇮🇹 Italiano\n• 🇵🇹 Portugués\n• Y muchos más...\n\n📧 ¿Necesitas otro idioma? ¡Contáctanos!',
    },
  },
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      search: 'Search',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
    },
    navigation: {
      home: 'Home',
      families: 'Families',
      search: 'Search',
      statistics: 'Statistics',
      pami: 'PAMI',
      profile: 'My Profile',
      settings: 'Settings',
    },
    home: {
      welcome: 'Welcome, {{name}}!',
      subtitle: 'Family Medical Management System',
      sessionExpiring: 'Session about to expire',
      generalSummary: 'General Summary',
      families: 'Families',
      members: 'Members',
      pregnant: 'Pregnant',
    },
    settings: {
      personalization: 'Personalization',
      theme: 'Application Theme',
      language: 'Application Language',
      selectLanguage: 'Select Language',
      currentLanguage: 'Current language: {{language}}',
      spanish: 'Spanish',
      english: 'English',
      languageChanged: 'Language Changed',
      spanishActivated: '🇪🇸 Español Activado',
      spanishMessage: '✨ La aplicación ahora está en español.\n\n🌍 Perfecto para usuarios hispanohablantes.\n\n📱 Todos los textos y mensajes aparecerán en español.',
      englishActivated: '🇺🇸 English Activated',
      englishMessage: '✨ The application is now in English.\n\n🌍 Perfect for English-speaking users.\n\n📱 All texts and messages will appear in English.',
      moreLanguagesSoon: '🌍 More languages coming soon',
      futureLanguagesMessage: '🚀 In future updates we will add more languages like:\n\n• 🇫🇷 French\n• 🇩🇪 German\n• 🇮🇹 Italian\n• 🇵🇹 Portuguese\n• And many more...\n\n📧 Need another language? Contact us!',
    },
  },
};

// Hook para usar traducciones conectado con Zustand
export const useTranslation = () => {
  // Usar el hook directamente para reaccionar a cambios
  const language = useAppStore((state) => state.language);
  
  const t = (key: string, params?: Record<string, string>) => {
    const keys = key.split('.');
    let value: any = translations[language as keyof typeof translations];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    if (typeof value === 'string' && params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey] || match;
      });
    }
    
    return value || key;
  };
  
  return { 
    t, 
    currentLanguage: language,
    isSpanish: language === 'es',
    isEnglish: language === 'en'
  };
};
