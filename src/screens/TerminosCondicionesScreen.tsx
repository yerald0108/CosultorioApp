import * as React from 'react';
import {
  View,
  Text,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { styles } from '../styles/screens/TerminosCondicionesScreen.styles';

type TerminosCondicionesScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TerminosCondiciones'>;

interface Props {
  navigation: TerminosCondicionesScreenNavigationProp;
}

const TerminosCondicionesScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>📋 Términos y Condiciones</Text>
          <Text style={styles.subtitle}>
            Consultorio App - Sistema de Gestión Médica Familiar
          </Text>
          <Text style={styles.version}>
            Versión 1.0.0 | Última actualización: Octubre 2025
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. 🎯 Propósito de la Aplicación</Text>
          <Text style={styles.text}>
            Consultorio App es un sistema de gestión médica familiar diseñado específicamente para 
            trabajadores de salud comunitaria. Su propósito es facilitar el registro, seguimiento 
            y análisis de información médica de familias en comunidades, funcionando completamente 
            offline para garantizar acceso en áreas con conectividad limitada.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. 🏥 Uso Médico y Profesional</Text>
          <Text style={styles.text}>
            Esta aplicación está destinada exclusivamente para uso por parte de profesionales 
            de la salud autorizados, incluyendo:
          </Text>
          <Text style={styles.bulletPoint}>• Médicos generales y especialistas</Text>
          <Text style={styles.bulletPoint}>• Enfermeros y personal de salud</Text>
          <Text style={styles.bulletPoint}>• Trabajadores de salud comunitaria</Text>
          <Text style={styles.bulletPoint}>• Personal autorizado de consultorios médicos</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. 🔒 Privacidad y Confidencialidad</Text>
          <Text style={styles.text}>
            Nos comprometemos a proteger la privacidad de los datos médicos:
          </Text>
          <Text style={styles.bulletPoint}>• Todos los datos se almacenan localmente en el dispositivo</Text>
          <Text style={styles.bulletPoint}>• No se transmite información a servidores externos</Text>
          <Text style={styles.bulletPoint}>• El usuario es responsable de la seguridad del dispositivo</Text>
          <Text style={styles.bulletPoint}>• Se debe cumplir con las leyes locales de privacidad médica</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. 📱 Funcionamiento Offline</Text>
          <Text style={styles.text}>
            La aplicación opera completamente offline:
          </Text>
          <Text style={styles.bulletPoint}>• No requiere conexión a internet para funcionar</Text>
          <Text style={styles.bulletPoint}>• Todos los datos se guardan en el almacenamiento local</Text>
          <Text style={styles.bulletPoint}>• Las copias de seguridad son responsabilidad del usuario</Text>
          <Text style={styles.bulletPoint}>• Se recomienda realizar respaldos periódicos</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. 🛡️ Responsabilidades del Usuario</Text>
          <Text style={styles.text}>
            Al usar esta aplicación, el usuario se compromete a:
          </Text>
          <Text style={styles.bulletPoint}>• Usar la aplicación solo para fines médicos legítimos</Text>
          <Text style={styles.bulletPoint}>• Mantener la confidencialidad de los datos de pacientes</Text>
          <Text style={styles.bulletPoint}>• Asegurar que el dispositivo esté protegido con contraseña</Text>
          <Text style={styles.bulletPoint}>• Realizar copias de seguridad regulares de los datos</Text>
          <Text style={styles.bulletPoint}>• Cumplir con todas las regulaciones médicas aplicables</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. 📊 Gestión de Datos</Text>
          <Text style={styles.text}>
            Información sobre el manejo de datos médicos:
          </Text>
          <Text style={styles.bulletPoint}>• Los datos incluyen información personal y médica sensible</Text>
          <Text style={styles.bulletPoint}>• El usuario es el único responsable de los datos ingresados</Text>
          <Text style={styles.bulletPoint}>• Se debe verificar la exactitud de toda la información</Text>
          <Text style={styles.bulletPoint}>• Los datos pueden ser exportados para respaldo</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. ⚠️ Limitaciones y Exenciones</Text>
          <Text style={styles.text}>
            Limitaciones importantes a considerar:
          </Text>
          <Text style={styles.bulletPoint}>• La aplicación es una herramienta de apoyo, no reemplaza el juicio médico</Text>
          <Text style={styles.bulletPoint}>• No proporciona diagnósticos automáticos ni recomendaciones de tratamiento</Text>
          <Text style={styles.bulletPoint}>• El desarrollador no se hace responsable por decisiones médicas</Text>
          <Text style={styles.bulletPoint}>• Se debe consultar con supervisores médicos cuando sea necesario</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. 🔄 Actualizaciones y Soporte</Text>
          <Text style={styles.text}>
            Información sobre actualizaciones:
          </Text>
          <Text style={styles.bulletPoint}>• Las actualizaciones pueden incluir nuevas funcionalidades</Text>
          <Text style={styles.bulletPoint}>• Se notificarán cambios importantes en los términos</Text>
          <Text style={styles.bulletPoint}>• El soporte técnico está disponible para usuarios autorizados</Text>
          <Text style={styles.bulletPoint}>• Se recomienda mantener la aplicación actualizada</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. 🌍 Cumplimiento Legal</Text>
          <Text style={styles.text}>
            Aspectos legales importantes:
          </Text>
          <Text style={styles.bulletPoint}>• Cumplir con las leyes locales de práctica médica</Text>
          <Text style={styles.bulletPoint}>• Respetar las regulaciones de privacidad de datos médicos</Text>
          <Text style={styles.bulletPoint}>• Obtener consentimientos necesarios de los pacientes</Text>
          <Text style={styles.bulletPoint}>• Mantener registros según las normativas aplicables</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. 📞 Contacto y Soporte</Text>
          <Text style={styles.text}>
            Para soporte técnico o consultas:
          </Text>
          <Text style={styles.bulletPoint}>• Contactar al administrador del sistema de salud</Text>
          <Text style={styles.bulletPoint}>• Reportar problemas técnicos al equipo de TI</Text>
          <Text style={styles.bulletPoint}>• Consultar dudas médicas con supervisores</Text>
          <Text style={styles.bulletPoint}>• Solicitar capacitación adicional si es necesario</Text>
        </View>

        <View style={styles.acceptanceSection}>
          <Text style={styles.acceptanceTitle}>✅ Aceptación de Términos</Text>
          <Text style={styles.acceptanceText}>
            Al usar Consultorio App, usted confirma que:
          </Text>
          <Text style={styles.acceptanceBullet}>
            • Ha leído y comprendido estos términos y condiciones
          </Text>
          <Text style={styles.acceptanceBullet}>
            • Es un profesional de salud autorizado para usar esta aplicación
          </Text>
          <Text style={styles.acceptanceBullet}>
            • Se compromete a cumplir con todas las responsabilidades descritas
          </Text>
          <Text style={styles.acceptanceBullet}>
            • Entiende las limitaciones y alcance de la aplicación
          </Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🏥 Consultorio App v1.0.0
          </Text>
          <Text style={styles.footerSubtext}>
            Sistema de Gestión Médica Familiar
          </Text>
          <Text style={styles.footerSubtext}>
            Desarrollado para mejorar la atención médica comunitaria
          </Text>
          <Text style={styles.footerDate}>
            Octubre 2025
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};


export default TerminosCondicionesScreen;
