import * as React from 'react';
import {
  View,
  Text,
  ScrollView,
} from 'react-native';
import { styles } from '../styles/screens/NotificacionScreen.styles';

const NotificacionScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Header de Desarrollo */}
        <View style={styles.developmentHeader}>
          <Text style={styles.developmentIcon}>🚧</Text>
          <Text style={styles.developmentTitle}>En Desarrollo</Text>
          <Text style={styles.developmentSubtitle}>
            Esta sección está siendo desarrollada
          </Text>
        </View>

        {/* Información de la Funcionalidad */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>🔔 Notificaciones</Text>
          <Text style={styles.description}>
            Esta sección permitirá gestionar todas las notificaciones y recordatorios 
            relacionados con la atención médica y seguimiento de pacientes.
          </Text>
        </View>

        {/* Funcionalidades Planeadas */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>📋 Funcionalidades Planeadas</Text>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>⏰</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Recordatorios Médicos</Text>
              <Text style={styles.featureDescription}>
                Alertas para seguimientos, citas y controles médicos programados
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📅</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Citas Programadas</Text>
              <Text style={styles.featureDescription}>
                Notificaciones de citas médicas y consultas pendientes
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📊</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Reportes Automáticos</Text>
              <Text style={styles.featureDescription}>
                Resúmenes semanales y mensuales de actividad médica
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🚨</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Alertas Críticas</Text>
              <Text style={styles.featureDescription}>
                Notificaciones urgentes para casos que requieren atención inmediata
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>💊</Text>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Medicamentos</Text>
              <Text style={styles.featureDescription}>
                Recordatorios de medicación y seguimiento de tratamientos
              </Text>
            </View>
          </View>
        </View>

        {/* Estado Actual */}
        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>📈 Estado de Desarrollo</Text>
          
          <View style={styles.statusItem}>
            <View style={styles.statusIndicator}>
              <Text style={styles.statusIcon}>🔄</Text>
            </View>
            <Text style={styles.statusText}>
              <Text style={styles.statusBold}>Fase de Planificación:</Text> Definiendo arquitectura y funcionalidades
            </Text>
          </View>

          <View style={styles.statusItem}>
            <View style={styles.statusIndicator}>
              <Text style={styles.statusIcon}>⏳</Text>
            </View>
            <Text style={styles.statusText}>
              <Text style={styles.statusBold}>Próxima Actualización:</Text> Implementación de recordatorios básicos
            </Text>
          </View>

          <View style={styles.statusItem}>
            <View style={styles.statusIndicator}>
              <Text style={styles.statusIcon}>🎯</Text>
            </View>
            <Text style={styles.statusText}>
              <Text style={styles.statusBold}>Objetivo:</Text> Sistema completo de notificaciones médicas
            </Text>
          </View>
        </View>

        {/* Información Adicional */}
        <View style={styles.additionalInfo}>
          <Text style={styles.infoTitle}>💡 Información Adicional</Text>
          <Text style={styles.infoText}>
            Las notificaciones estarán diseñadas específicamente para el entorno médico, 
            respetando la privacidad de los pacientes y cumpliendo con las normativas 
            de protección de datos médicos.
          </Text>
          <Text style={styles.infoText}>
            Esta funcionalidad se integrará perfectamente con el sistema offline existente, 
            permitiendo programar recordatorios que funcionen sin conexión a internet.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🔔 Notificaciones - Consultorio App
          </Text>
          <Text style={styles.footerSubtext}>
            Próximamente disponible
          </Text>
          <Text style={styles.footerVersion}>
            v1.0.0 - En Desarrollo
          </Text>
        </View>

      </ScrollView>
    </View>
  );
};


export default NotificacionScreen;
