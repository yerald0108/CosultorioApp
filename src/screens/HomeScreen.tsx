import * as React from 'react';
import { useEffect, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useAuthStore, useFamiliesStore } from '../stores';
import { ErrorBoundary, useTheme } from '../components';
import { useTranslation } from '../i18n';
import { styles } from '../styles/screens/HomeScreen.styles';

const HomeScreen: React.FC = () => {
  // Hooks para tema y traducciones
  const { colors } = useTheme();
  const { t } = useTranslation();
  
  // Zustand stores
  const { user, getUserName, isSessionValid } = useAuthStore();
  const { 
    familias, 
    integrantes, 
    isLoading, 
    loadFamilies, 
    loadIntegrantes,
    getFamiliaStats 
  } = useFamiliesStore();

  // Cargar datos al montar el componente
  useEffect(() => {
    loadFamilies();
    loadIntegrantes();
  }, []);

  // Calcular estadísticas con useMemo para optimizar performance
  const stats = useMemo(() => getFamiliaStats(), [getFamiliaStats]);
  
  const totalFamilias = useMemo(() => familias.length, [familias.length]);
  const totalIntegrantes = useMemo(() => integrantes.length, [integrantes.length]);
  
  // Calcular estadísticas por grupo dispensarial con useMemo
  const grupoStats = useMemo(() => {
    return {
      grupoI: integrantes.filter(i => i.grupoDispensarial === 'I').length,
      grupoII: integrantes.filter(i => i.grupoDispensarial === 'II').length,
      grupoIII: integrantes.filter(i => i.grupoDispensarial === 'III').length,
      grupoIV: integrantes.filter(i => i.grupoDispensarial === 'IV').length,
    };
  }, [integrantes]);

  // Función para refrescar datos con useCallback
  const handleRefresh = useCallback(async () => {
    await Promise.all([
      loadFamilies(),
      loadIntegrantes()
    ]);
  }, [loadFamilies, loadIntegrantes]);

  return (
    <ErrorBoundary>
      <ScrollView 
        style={[styles.container, { backgroundColor: colors.background }]}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            colors={['#2196F3']}
          />
        }
      >
      {/* Header con información del usuario */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t('home.welcome', { name: getUserName() })}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {t('home.subtitle')}
        </Text>
        {!isSessionValid() && (
          <Text style={[styles.subtitle, { color: colors.warning, marginTop: 8 }]}>
            ⚠️ {t('home.sessionExpiring')}
          </Text>
        )}
      </View>

      <View style={styles.content}>
        {/* Estadísticas principales */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>📊 {t('home.generalSummary')}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.primary }}>{totalFamilias}</Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>{t('home.families')}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.secondary }}>{totalIntegrantes}</Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>{t('home.members')}</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#E91E63' }}>0</Text>
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>{t('home.pregnant')}</Text>
            </View>
          </View>
        </View>

        {/* Estadísticas por grupo dispensarial */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🏥 Grupos Dispensariales</Text>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 8, borderLeftWidth: 4, borderLeftColor: '#4CAF50' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#4CAF50', marginRight: 12 }}>{grupoStats.grupoI}</Text>
              <Text style={{ fontSize: 14, color: '#666' }}>Grupo I (Sanos)</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 8, borderLeftWidth: 4, borderLeftColor: '#FF9800' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#FF9800', marginRight: 12 }}>{grupoStats.grupoII}</Text>
              <Text style={{ fontSize: 14, color: '#666' }}>Grupo II (Riesgo)</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 8, borderLeftWidth: 4, borderLeftColor: '#F44336' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#F44336', marginRight: 12 }}>{grupoStats.grupoIII}</Text>
              <Text style={{ fontSize: 14, color: '#666' }}>Grupo III (Enfermos)</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 8, borderLeftWidth: 4, borderLeftColor: '#9C27B0' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#9C27B0', marginRight: 12 }}>{grupoStats.grupoIV}</Text>
              <Text style={{ fontSize: 14, color: '#666' }}>Grupo IV (Discapacidad)</Text>
            </View>
          </View>
        </View>

        {/* Acciones rápidas */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🚀 Acciones Rápidas</Text>
          <TouchableOpacity style={[styles.button, { marginTop: 8, marginBottom: 8 }]}>
            <Text style={styles.buttonText}>➕ Registrar Nueva Familia</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { marginTop: 8, marginBottom: 8, backgroundColor: '#2196F3' }]}>
            <Text style={styles.buttonText}>🔍 Búsqueda Avanzada</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, { marginTop: 8, marginBottom: 8, backgroundColor: '#FF9800' }]}>
            <Text style={styles.buttonText}>📊 Ver Estadísticas Completas</Text>
          </TouchableOpacity>
        </View>

        {/* Estado del sistema */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>💾 Estado del Sistema</Text>
          <Text style={styles.statusText}>✅ Datos sincronizados localmente</Text>
          <Text style={styles.statusText}>✅ {totalFamilias} familias registradas</Text>
          <Text style={styles.statusText}>✅ {totalIntegrantes} integrantes activos</Text>
          <Text style={styles.statusText}>✅ Funcionamiento offline</Text>
        </View>
      </View>
      </ScrollView>
    </ErrorBoundary>
  );
};

// Exportar con React.memo para optimización
export default React.memo(HomeScreen);
