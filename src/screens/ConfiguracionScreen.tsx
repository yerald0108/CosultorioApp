import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { StorageService } from '../services/StorageService';
import { BiometricService } from '../services/BiometricService';
import { AccessLogService } from '../services/AccessLogService';
import { PINService } from '../services/PINService';
import { AgeUpdateService } from '../services/AgeUpdateService';
import { useAppStore } from '../stores';
import { useTranslation } from '../i18n';
import { styles } from '../styles/screens/ConfiguracionScreen.styles';

type ConfiguracionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Configuracion'>;

interface Props {
  navigation: ConfiguracionScreenNavigationProp;
  onLogout: () => void;
}

const ConfiguracionScreen: React.FC<Props> = ({ navigation, onLogout }) => {
  // Zustand store para configuración
  const { theme, setTheme, language, setLanguage } = useAppStore();
  const { t } = useTranslation();

  const handleSeleccionarTema = () => {
    Alert.alert(
      '🎨 Seleccionar Tema',
      'Elige la apariencia de la aplicación',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: '☀️ Tema Claro',
          onPress: () => {
            setTheme('light');
            Alert.alert(
              '☀️ Tema Claro Activado',
              '✨ La aplicación ahora usa colores claros.\n\n🎨 Perfecto para uso durante el día y ambientes bien iluminados.',
              [{ text: 'Perfecto' }]
            );
          }
        },
        {
          text: '🌙 Tema Oscuro',
          onPress: () => {
            setTheme('dark');
            Alert.alert(
              '🌙 Tema Oscuro Activado',
              '✨ La aplicación ahora usa colores oscuros.\n\n👁️ Ideal para reducir la fatiga visual en ambientes con poca luz.',
              [{ text: 'Excelente' }]
            );
          }
        },
        {
          text: '🔄 Automático',
          onPress: () => {
            setTheme('auto');
            Alert.alert(
              '🔄 Tema Automático Activado',
              '✨ La aplicación seguirá el tema del sistema.\n\n📱 Cambiará automáticamente entre claro y oscuro según la configuración de tu dispositivo.',
              [{ text: 'Genial' }]
            );
          }
        }
      ]
    );
  };

  const getThemeDisplayName = () => {
    switch (theme) {
      case 'light': return '☀️ Claro';
      case 'dark': return '🌙 Oscuro';
      case 'auto': return '🔄 Automático';
      default: return '☀️ Claro';
    }
  };

  const handleSeleccionarIdioma = () => {
    Alert.alert(
      t('settings.selectLanguage'),
      'Elige el idioma de la aplicación / Choose the application language',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: '🇪🇸 Español',
          onPress: () => {
            setLanguage('es');
            Alert.alert(
              t('settings.spanishActivated'),
              t('settings.spanishMessage'),
              [{ text: 'Perfecto' }]
            );
          }
        },
        {
          text: '🇺🇸 English',
          onPress: () => {
            setLanguage('en');
            Alert.alert(
              t('settings.englishActivated'),
              t('settings.englishMessage'),
              [{ text: 'Perfect' }]
            );
          }
        },
        {
          text: t('settings.moreLanguagesSoon'),
          onPress: () => {
            Alert.alert(
              t('settings.moreLanguagesSoon'),
              t('settings.futureLanguagesMessage'),
              [{ text: '¡Genial! / Great!' }]
            );
          }
        }
      ]
    );
  };

  const getLanguageDisplayName = () => {
    switch (language) {
      case 'es': return '🇪🇸 Español';
      case 'en': return '🇺🇸 English';
      default: return '🇪🇸 Español';
    }
  };

  const handleExportarDatos = () => {
    Alert.alert(
      'Exportar Datos',
      'Esta funcionalidad estará disponible en una próxima versión',
      [{ text: 'OK' }]
    );
  };

  const handleImportarDatos = () => {
    Alert.alert(
      'Importar Datos',
      'Esta funcionalidad estará disponible en una próxima versión',
      [{ text: 'OK' }]
    );
  };

  const handleActualizacionEdades = async () => {
    try {
      const info = await AgeUpdateService.obtenerInfoActualizacion();
      
      let mensaje = '📅 **Estado de Actualización de Edades**\n\n';
      
      if (info.ultimaActualizacion) {
        const fechaFormateada = info.ultimaActualizacion.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        mensaje += `🕒 **Última actualización**: ${fechaFormateada}\n`;
        mensaje += `⏱️ **Hace**: ${Math.round(info.horasDesdeUltimaActualizacion)} horas\n\n`;
      } else {
        mensaje += `🆕 **Primera vez**: Las edades se actualizarán automáticamente\n\n`;
      }
      
      if (info.necesitaActualizacion) {
        mensaje += `🔄 **Estado**: Actualización pendiente\n`;
        mensaje += `💡 **Acción**: Se actualizará automáticamente al acceder a los datos\n\n`;
      } else {
        mensaje += `✅ **Estado**: Edades actualizadas\n`;
        mensaje += `🎯 **Próxima actualización**: Automática en menos de 24 horas\n\n`;
      }
      
      mensaje += `📋 **Funcionamiento**:\n`;
      mensaje += `• Las edades se calculan automáticamente desde la fecha de nacimiento\n`;
      mensaje += `• Se actualizan cada 24 horas automáticamente\n`;
      mensaje += `• También se actualizan al iniciar la aplicación\n`;
      mensaje += `• No requiere intervención manual`;

      Alert.alert(
        '🎂 Actualización Automática de Edades',
        mensaje,
        [
          { text: 'Entendido' },
          {
            text: 'Forzar Actualización',
            onPress: async () => {
              try {
                await AgeUpdateService.forzarActualizacion();
                Alert.alert(
                  '✅ Actualización Completada',
                  'Las edades han sido actualizadas manualmente.\n\n🎯 La próxima actualización automática será en 24 horas.',
                  [{ text: 'Perfecto' }]
                );
              } catch (error) {
                Alert.alert(
                  '❌ Error',
                  'No se pudo forzar la actualización. Inténtalo más tarde.',
                  [{ text: 'OK' }]
                );
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert(
        '❌ Error',
        'No se pudo obtener la información de actualización de edades.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleRespaldoLocal = () => {
    Alert.alert(
      'Respaldo Local',
      'Esta funcionalidad estará disponible en una próxima versión',
      [{ text: 'OK' }]
    );
  };

  const handleLimpiarDatos = () => {
    Alert.alert(
      'Limpiar Todos los Datos',
      '⚠️ Esta acción eliminará TODAS las familias e integrantes. ¿Estás seguro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar Todo',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.limpiarTodosLosDatos();
              Alert.alert('Éxito', '✅ Todos los datos han sido eliminados');
            } catch (error) {
              Alert.alert('Error', '❌ No se pudieron eliminar los datos');
            }
          },
        },
      ]
    );
  };

  const handleCerrarSesion = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: onLogout,
        },
      ]
    );
  };

  const handleAcercaDe = () => {
    Alert.alert(
      'Acerca de Consultorio App',
      'Versión 1.0.0\n\nAplicación para gestión de familias e integrantes en consultorios médicos.\n\nDesarrollada para uso offline.',
      [{ text: 'OK' }]
    );
  };

  // Funciones de Seguridad y Privacidad

  const handlePINAcceso = async () => {
    try {
      const status = await PINService.getStatus();
      
      if (status.hasPin) {
        // Ya tiene PIN configurado - mostrar opciones
        Alert.alert(
          '🔑 PIN de Acceso Rápido',
          `Estado: ${status.enabled ? '✅ Habilitado' : '❌ Deshabilitado'}\n\n¿Qué deseas hacer?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Cambiar PIN',
              onPress: () => navigation.navigate('ConfigurarPIN')
            },
            {
              text: status.enabled ? 'Deshabilitar' : 'Habilitar',
              onPress: async () => {
                if (status.enabled) {
                  // Deshabilitar PIN
                  Alert.alert(
                    '⚠️ Confirmar Deshabilitación',
                    '¿Estás seguro de que quieres deshabilitar el PIN de acceso?\n\n🚨 Esto eliminará tu PIN actual permanentemente.',
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      {
                        text: 'Deshabilitar',
                        style: 'destructive',
                        onPress: async () => {
                          await PINService.disable();
                          Alert.alert(
                            '✅ PIN Deshabilitado',
                            'El PIN de acceso rápido ha sido deshabilitado exitosamente.',
                            [{ text: 'Entendido' }]
                          );
                        }
                      }
                    ]
                  );
                } else {
                  // Habilitar PIN existente
                  navigation.navigate('ConfigurarPIN');
                }
              }
            }
          ]
        );
      } else {
        // No tiene PIN - configurar nuevo
        Alert.alert(
          '🔑 PIN de Acceso Rápido',
          '¿Deseas configurar un PIN de acceso rápido?\n\n✅ Ventajas:\n• Acceso rápido sin huella\n• Ideal para dispositivos sin biometría\n• Código de 4-6 dígitos personalizado\n• Seguridad adicional',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Configurar PIN',
              onPress: () => navigation.navigate('ConfigurarPIN')
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert(
        '❌ Error',
        'No se pudo verificar el estado del PIN. Intenta nuevamente.',
        [{ text: 'Entendido' }]
      );
    }
  };

  const handleAutenticacionBiometrica = async () => {
    try {
      // Verificar estado actual
      const status = await BiometricService.getStatus();
      
      if (!status.available) {
        Alert.alert(
          '❌ No Disponible',
          'La autenticación por huella digital no está disponible en este dispositivo.\n\n• Verifica que tengas huellas registradas\n• Asegúrate de que tu dispositivo soporte esta función',
          [{ text: 'Entendido' }]
        );
        return;
      }

      if (!status.fingerprintSupported) {
        Alert.alert(
          '❌ Huella No Soportada',
          'Este dispositivo no soporta autenticación por huella digital.\n\nTipos disponibles:\n' + 
          status.supportedTypes.join('\n'),
          [{ text: 'Entendido' }]
        );
        return;
      }

      const currentlyEnabled = status.enabled;
      
      Alert.alert(
        '👆 Autenticación por Huella Digital',
        `Estado actual: ${currentlyEnabled ? '✅ Habilitada' : '❌ Deshabilitada'}\n\n¿Qué deseas hacer?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: currentlyEnabled ? 'Deshabilitar' : 'Habilitar',
            style: currentlyEnabled ? 'destructive' : 'default',
            onPress: async () => {
              if (currentlyEnabled) {
                // Deshabilitar
                await BiometricService.disable();
                Alert.alert(
                  '❌ Huella Digital Deshabilitada',
                  '⚠️ Se ha deshabilitado la autenticación por huella digital.\n\n🔐 Ahora solo podrás acceder con tu contraseña.\n\n💡 Puedes volver a habilitarla cuando desees.',
                  [{ text: 'Entendido' }]
                );
              } else {
                // Habilitar
                const result = await BiometricService.enable();
                if (result.success) {
                  Alert.alert(
                    '✅ Huella Digital Habilitada',
                    '🎉 ¡Configuración exitosa!\n\n👆 Ahora puedes usar tu huella digital para:\n\n• Acceder a la aplicación\n• Confirmar acciones sensibles\n• Desbloquear datos cifrados\n\n🔒 Tu huella se almacena de forma segura en el dispositivo',
                    [{ text: 'Entendido' }]
                  );
                } else {
                  Alert.alert(
                    '❌ Error al Habilitar',
                    `No se pudo habilitar la autenticación por huella digital.\n\n${result.error}`,
                    [{ text: 'Entendido' }]
                  );
                }
              }
            }
          },
          {
            text: 'Probar Huella',
            onPress: async () => {
              const authResult = await BiometricService.authenticate('Probar autenticación por huella digital');
              if (authResult.success) {
                Alert.alert(
                  '✅ Autenticación Exitosa',
                  '🎉 ¡Tu huella digital fue reconocida correctamente!\n\n👆 La autenticación biométrica está funcionando perfectamente.',
                  [{ text: 'Excelente' }]
                );
              } else {
                Alert.alert(
                  '❌ Autenticación Fallida',
                  `No se pudo autenticar con tu huella digital.\n\n${authResult.error}`,
                  [{ text: 'Entendido' }]
                );
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert(
        '❌ Error Técnico',
        'Ocurrió un error al verificar la autenticación biométrica. Intenta nuevamente.',
        [{ text: 'Entendido' }]
      );
    }
  };

  const handleLogsAcceso = async () => {
    try {
      const stats = await AccessLogService.getLogStats();
      
      Alert.alert(
        '🛡️ Logs de Acceso',
        `📊 Estadísticas de Seguridad:\n\n📝 Total de registros: ${stats.totalLogs}\n🔐 Intentos de login: ${stats.loginAttempts}\n✅ Logins exitosos: ${stats.successfulLogins}\n❌ Logins fallidos: ${stats.failedLogins}\n👆 Intentos biométricos: ${stats.biometricAttempts}\n🛡️ Eventos de seguridad: ${stats.securityEvents}\n\n📅 Última actividad: ${stats.lastActivity ? stats.lastActivity.toLocaleString() : 'Ninguna'}`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Ver Logs Recientes', 
            onPress: async () => {
              const recentLogs = await AccessLogService.getRecentLogs(10);
              if (recentLogs.length === 0) {
                Alert.alert(
                  '📝 Sin Registros',
                  'No hay logs de acceso registrados aún.\n\n💡 Los logs se generarán automáticamente cuando uses la aplicación.',
                  [{ text: 'Entendido' }]
                );
                return;
              }

              let logsText = '📋 Últimos 10 registros:\n\n';
              recentLogs.forEach((log, index) => {
                const emoji = getLogEmoji(log.type);
                const time = log.timestamp.toLocaleString();
                logsText += `${emoji} ${time}\n${log.description}\n\n`;
              });

              Alert.alert('📝 Logs Recientes', logsText, [
                { text: 'Cerrar' },
                { 
                  text: 'Exportar Todos', 
                  onPress: async () => {
                    const exportText = await AccessLogService.exportLogsAsText();
                    // En una implementación real, aquí se podría compartir el archivo
                    Alert.alert(
                      '📤 Exportar Logs',
                      'Los logs han sido preparados para exportar.\n\n📱 En una versión futura podrás compartir este archivo por email o guardarlo en el dispositivo.',
                      [{ text: 'Entendido' }]
                    );
                  }
                }
              ]);
            }
          },
          {
            text: 'Gestionar',
            onPress: () => {
              Alert.alert(
                '⚙️ Gestión de Logs',
                '¿Qué acción deseas realizar?',
                [
                  { text: 'Cancelar', style: 'cancel' },
                  {
                    text: 'Limpiar Antiguos',
                    onPress: async () => {
                      const removedCount = await AccessLogService.cleanOldLogs(30);
                      Alert.alert(
                        '🧹 Limpieza Completada',
                        `Se eliminaron ${removedCount} registros antiguos (más de 30 días).\n\n📊 Los logs recientes se mantuvieron para seguridad.`,
                        [{ text: 'Entendido' }]
                      );
                    }
                  },
                  {
                    text: 'Eliminar Todos',
                    style: 'destructive',
                    onPress: () => {
                      Alert.alert(
                        '⚠️ Confirmar Eliminación',
                        'Esta acción eliminará TODOS los logs de acceso permanentemente.\n\n🚨 No se podrá deshacer esta acción.\n\n¿Estás seguro?',
                        [
                          { text: 'Cancelar', style: 'cancel' },
                          {
                            text: 'Eliminar Todo',
                            style: 'destructive',
                            onPress: async () => {
                              await AccessLogService.clearAllLogs();
                              Alert.alert(
                                '🗑️ Logs Eliminados',
                                'Todos los logs de acceso han sido eliminados.\n\n📝 Los nuevos logs se generarán automáticamente con el uso de la aplicación.',
                                [{ text: 'Entendido' }]
                              );
                            }
                          }
                        ]
                      );
                    }
                  }
                ]
              );
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert(
        '❌ Error',
        'No se pudieron cargar los logs de acceso. Intenta nuevamente.',
        [{ text: 'Entendido' }]
      );
    }
  };

  // Función auxiliar para obtener emoji del tipo de log
  const getLogEmoji = (type: string): string => {
    const emojiMap: { [key: string]: string } = {
      login: '🟢',
      logout: '🔴',
      biometric_success: '✅',
      biometric_failed: '❌',
      biometric_error: '⚠️',
      app_background: '📱',
      app_foreground: '📱',
      data_access: '📊',
      security_event: '🛡️'
    };
    return emojiMap[type] || '📝';
  };


  const renderMenuItem = (
    title: string,
    subtitle: string,
    icon: string,
    onPress: () => void,
    color: string = '#2196F3'
  ) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuIcon}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.chevron}>▶️</Text>
    </TouchableOpacity>
  );

  const renderSection = (title: string, children: React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {renderSection('📊 Datos', (
        <>
          {renderMenuItem(
            'Exportar Datos',
            'Exportar toda la información a un archivo',
            '📤',
            handleExportarDatos,
            '#4CAF50'
          )}
          {renderMenuItem(
            'Importar Datos',
            'Importar información desde un archivo',
            '📥',
            handleImportarDatos,
            '#FF9800'
          )}
          {renderMenuItem(
            'Actualización de Edades',
            'Ver estado y gestionar actualización automática',
            '🎂',
            handleActualizacionEdades,
            '#E91E63'
          )}
          {renderMenuItem(
            'Respaldo Local',
            'Crear copia de seguridad local',
            '💾',
            handleRespaldoLocal,
            '#9C27B0'
          )}
          {renderMenuItem(
            'Limpiar Todos los Datos',
            '⚠️ Eliminar todas las familias e integrantes',
            '🗑️',
            handleLimpiarDatos,
            '#F44336'
          )}
        </>
      ))}

      {renderSection(t('settings.personalization'), (
        <>
          {renderMenuItem(
            t('settings.theme'),
            `Apariencia actual: ${getThemeDisplayName()}`,
            '🎨',
            handleSeleccionarTema,
            '#673AB7'
          )}
          {renderMenuItem(
            t('settings.language'),
            t('settings.currentLanguage', { language: getLanguageDisplayName() }),
            '🌍',
            handleSeleccionarIdioma,
            '#4CAF50'
          )}
        </>
      ))}

      {renderSection('👤 Cuenta', (
        <>
          {renderMenuItem(
            'Mi Perfil',
            'Editar información personal y foto',
            '👤',
            () => navigation.navigate('MiPerfil'),
            '#4CAF50'
          )}
          {renderMenuItem(
            'Cerrar Sesión',
            'Salir de la aplicación',
            '🚪',
            handleCerrarSesion,
            '#F44336'
          )}
        </>
      ))}

      {renderSection('🔐 Seguridad y Privacidad', (
        <>
          {renderMenuItem(
            'Autenticación por Huella',
            'Acceso seguro con huella digital',
            '👆',
            handleAutenticacionBiometrica,
            '#FF5722'
          )}
          {renderMenuItem(
            'PIN de Acceso Rápido',
            'Código numérico para acceso rápido',
            '🔑',
            handlePINAcceso,
            '#4CAF50'
          )}
          {renderMenuItem(
            'Logs de Acceso',
            'Registro de quién accedió y cuándo',
            '🛡️',
            handleLogsAcceso,
            '#607D8B'
          )}
        </>
      ))}

      {renderSection('ℹ️ Información', (
        <>
          {renderMenuItem(
            'Soporte Técnico',
            'Información de contacto y ayuda\ntécnica',
            '🆘',
            () => navigation.navigate('SoporteTecnico'),
            '#FF5722'
          )}
          {renderMenuItem(
            'Manual de Usuario',
            'Guía completa de uso de la aplicación',
            '📖',
            () => navigation.navigate('ManualUsuario'),
            '#4CAF50'
          )}
          {renderMenuItem(
            'Términos y Condiciones',
            'Términos de uso y políticas de la aplicación',
            '📋',
            () => navigation.navigate('TerminosCondiciones'),
            '#607D8B'
          )}
          {renderMenuItem(
            'Acerca de',
            'Información de la aplicación y versión',
            'ℹ️',
            handleAcercaDe,
            '#607D8B'
          )}
        </>
      ))}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🏥 Consultorio App v1.0.0
        </Text>
        <Text style={styles.footerSubtext}>
          Sistema de gestión médica familiar
        </Text>
        <Text style={styles.footerSubtext}>
          ✅ Funcionando 100% offline
        </Text>
      </View>
    </ScrollView>
  );
};


export default ConfiguracionScreen;
