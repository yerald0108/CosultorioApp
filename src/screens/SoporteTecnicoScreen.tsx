import * as React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { styles } from '../styles/screens/SoporteTecnicoScreen.styles';

type SoporteTecnicoScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SoporteTecnico'>;

interface Props {
  navigation: SoporteTecnicoScreenNavigationProp;
}

const SoporteTecnicoScreen: React.FC<Props> = ({ navigation }) => {
  
  const handleContacto = (tipo: string, valor: string) => {
    switch (tipo) {
      case 'email':
        Linking.openURL(`mailto:${valor}`);
        break;
      case 'telefono':
        Linking.openURL(`tel:${valor}`);
        break;
      case 'whatsapp':
        Linking.openURL(`https://wa.me/${valor}`);
        break;
      default:
        Alert.alert('Error', 'Tipo de contacto no válido');
    }
  };

  const renderContactoItem = (icono: string, titulo: string, subtitulo: string, tipo: string, valor: string) => (
    <TouchableOpacity 
      style={styles.contactoItem}
      onPress={() => handleContacto(tipo, valor)}
    >
      <View style={styles.contactoIcono}>
        <Text style={styles.contactoEmojiIcono}>{icono}</Text>
      </View>
      <View style={styles.contactoInfo}>
        <Text style={styles.contactoTitulo}>{titulo}</Text>
        <Text style={styles.contactoSubtitulo}>{subtitulo}</Text>
        <Text style={styles.contactoValor}>{valor}</Text>
      </View>
      <View style={styles.contactoFlecha}>
        <Text style={styles.flechaTexto}>→</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSeccion = (titulo: string, contenido: React.ReactNode) => (
    <View style={styles.seccion}>
      <Text style={styles.seccionTitulo}>{titulo}</Text>
      {contenido}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🆘 Soporte Técnico</Text>
          <Text style={styles.subtitle}>
            ¿Necesitas ayuda? Estamos aquí para apoyarte
          </Text>
        </View>

        {/* Contactos Principales */}
        {renderSeccion('📞 Contactos de Soporte', (
          <View>
            {renderContactoItem(
              '📧', 
              'Soporte por Email', 
              'Respuesta en 24-48 horas',
              'email',
              'soporte@consultorioapp.com'
            )}
            
            {renderContactoItem(
              '📱', 
              'WhatsApp Soporte', 
              'Respuesta inmediata en horario laboral',
              'whatsapp',
              '1234567890'
            )}
            
            {renderContactoItem(
              '☎️', 
              'Teléfono de Emergencia', 
              'Lunes a Viernes 8:00 AM - 6:00 PM',
              'telefono',
              '+1-800-CONSULTORIO'
            )}
          </View>
        ))}

        {/* Horarios de Atención */}
        {renderSeccion('🕐 Horarios de Atención', (
          <View style={styles.horariosContainer}>
            <View style={styles.horarioItem}>
              <Text style={styles.horarioDia}>Lunes - Viernes</Text>
              <Text style={styles.horarioHora}>8:00 AM - 6:00 PM</Text>
            </View>
            <View style={styles.horarioItem}>
              <Text style={styles.horarioDia}>Sábados</Text>
              <Text style={styles.horarioHora}>9:00 AM - 2:00 PM</Text>
            </View>
            <View style={styles.horarioItem}>
              <Text style={styles.horarioDia}>Domingos</Text>
              <Text style={styles.horarioHora}>Solo emergencias</Text>
            </View>
          </View>
        ))}

        {/* Tipos de Soporte */}
        {renderSeccion('🔧 Tipos de Soporte Disponible', (
          <View style={styles.tiposSoporte}>
            <View style={styles.tipoItem}>
              <Text style={styles.tipoIcono}>🐛</Text>
              <View style={styles.tipoTexto}>
                <Text style={styles.tipoTitulo}>Reportar Errores</Text>
                <Text style={styles.tipoDescripcion}>
                  Problemas técnicos, fallos de la aplicación, errores de datos
                </Text>
              </View>
            </View>
            
            <View style={styles.tipoItem}>
              <Text style={styles.tipoIcono}>❓</Text>
              <View style={styles.tipoTexto}>
                <Text style={styles.tipoTitulo}>Consultas de Uso</Text>
                <Text style={styles.tipoDescripcion}>
                  Cómo usar funciones, dudas sobre procedimientos
                </Text>
              </View>
            </View>
            
            <View style={styles.tipoItem}>
              <Text style={styles.tipoIcono}>💡</Text>
              <View style={styles.tipoTexto}>
                <Text style={styles.tipoTitulo}>Sugerencias</Text>
                <Text style={styles.tipoDescripcion}>
                  Ideas para mejorar la aplicación, nuevas funcionalidades
                </Text>
              </View>
            </View>
            
            <View style={styles.tipoItem}>
              <Text style={styles.tipoIcono}>🔒</Text>
              <View style={styles.tipoTexto}>
                <Text style={styles.tipoTitulo}>Problemas de Acceso</Text>
                <Text style={styles.tipoDescripcion}>
                  Recuperación de contraseña, problemas de login
                </Text>
              </View>
            </View>
          </View>
        ))}

        {/* Información Adicional */}
        {renderSeccion('ℹ️ Información Adicional', (
          <View style={styles.infoAdicional}>
            <Text style={styles.infoTexto}>
              📱 <Text style={styles.infoBold}>Versión de la App:</Text> 1.0.0
            </Text>
            <Text style={styles.infoTexto}>
              🏥 <Text style={styles.infoBold}>Tipo de Aplicación:</Text> Consultorio Médico Offline
            </Text>
            <Text style={styles.infoTexto}>
              🔧 <Text style={styles.infoBold}>Última Actualización:</Text> Octubre 2025
            </Text>
            <Text style={styles.infoTexto}>
              📋 <Text style={styles.infoBold}>ID de Soporte:</Text> CONS-2025-001
            </Text>
          </View>
        ))}

        {/* Consejos Rápidos */}
        {renderSeccion('💡 Consejos Rápidos', (
          <View style={styles.consejosContainer}>
            <Text style={styles.consejoItem}>
              🔄 <Text style={styles.consejoBold}>Reinicia la app</Text> si experimentas problemas
            </Text>
            <Text style={styles.consejoItem}>
              💾 <Text style={styles.consejoBold}>Haz respaldos regulares</Text> de tus datos
            </Text>
            <Text style={styles.consejoItem}>
              📱 <Text style={styles.consejoBold}>Mantén la app actualizada</Text> para mejor rendimiento
            </Text>
            <Text style={styles.consejoItem}>
              📋 <Text style={styles.consejoBold}>Describe detalladamente</Text> cualquier problema
            </Text>
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTexto}>
            🏥 Consultorio App - Soporte Técnico
          </Text>
          <Text style={styles.footerSubtexto}>
            Comprometidos con tu experiencia médica digital
          </Text>
        </View>

      </ScrollView>
    </View>
  );
};


export default SoporteTecnicoScreen;
