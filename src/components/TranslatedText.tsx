import React from 'react';
import { Text, TextStyle } from 'react-native';
import { useTranslation } from '../i18n';

interface TranslatedTextProps {
  translationKey: string;
  params?: Record<string, string>;
  style?: TextStyle;
  fallback?: string;
}

/**
 * Componente que muestra texto traducido automáticamente
 * según el idioma configurado en la aplicación
 */
export const TranslatedText: React.FC<TranslatedTextProps> = ({ 
  translationKey, 
  params, 
  style, 
  fallback 
}) => {
  const { t } = useTranslation();
  
  const translatedText = t(translationKey, params);
  const displayText = translatedText !== translationKey ? translatedText : (fallback || translationKey);
  
  return (
    <Text style={style}>
      {displayText}
    </Text>
  );
};

export default TranslatedText;
