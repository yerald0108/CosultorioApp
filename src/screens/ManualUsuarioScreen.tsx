import * as React from 'react';
import {
  View,
  Text,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../types';
import { styles } from '../styles/screens/ManualUsuarioScreen.styles';

type ManualUsuarioScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ManualUsuario'>;

interface Props {
  navigation: ManualUsuarioScreenNavigationProp;
}

const ManualUsuarioScreen: React.FC<Props> = ({ navigation }) => {

  const renderSeccion = (titulo: string, contenido: React.ReactNode) => (
    <View style={styles.seccion}>
      <Text style={styles.seccionTitulo}>{titulo}</Text>
      {contenido}
    </View>
  );

  const renderPaso = (numero: string, titulo: string, descripcion: string) => (
    <View style={styles.pasoContainer}>
      <View style={styles.pasoNumero}>
        <Text style={styles.pasoNumeroTexto}>{numero}</Text>
      </View>
      <View style={styles.pasoContenido}>
        <Text style={styles.pasoTitulo}>{titulo}</Text>
        <Text style={styles.pasoDescripcion}>{descripcion}</Text>
      </View>
    </View>
  );

  const renderFuncion = (icono: string, nombre: string, descripcion: string) => (
    <View style={styles.funcionItem}>
      <Text style={styles.funcionIcono}>{icono}</Text>
      <View style={styles.funcionTexto}>
        <Text style={styles.funcionNombre}>{nombre}</Text>
        <Text style={styles.funcionDescripcion}>{descripcion}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>📖 Manual de Usuario</Text>
          <Text style={styles.subtitle}>
            Guía completa para usar Consultorio App
          </Text>
          <Text style={styles.version}>
            Versión 1.0.0 | Octubre 2025
          </Text>
        </View>

        {/* Introducción */}
        {renderSeccion('🎯 ¿Qué es Consultorio App?', (
          <View>
            <Text style={styles.texto}>
              Consultorio App es una aplicación médica diseñada específicamente para profesionales 
              de la salud que trabajan en comunidades. Permite gestionar información de familias 
              e integrantes de manera offline, sin necesidad de conexión a internet.
            </Text>
            <Text style={styles.textoDestacado}>
              ✨ <Text style={styles.bold}>Características principales:</Text>
            </Text>
            <Text style={styles.bulletPoint}>• Funcionamiento 100% offline</Text>
            <Text style={styles.bulletPoint}>• Gestión de familias e integrantes</Text>
            <Text style={styles.bulletPoint}>• Estadísticas médicas en tiempo real</Text>
            <Text style={styles.bulletPoint}>• Búsqueda avanzada de pacientes</Text>
            <Text style={styles.bulletPoint}>• Organización por manzanas</Text>
          </View>
        ))}

        {/* Primeros Pasos */}
        {renderSeccion('🚀 Primeros Pasos', (
          <View>
            {renderPaso('1', 'Iniciar Sesión', 'Ingresa con tu usuario y contraseña de doctor autorizado')}
            {renderPaso('2', 'Configurar Perfil', 'Ve a Configuración → Mi Perfil para actualizar tu información')}
            {renderPaso('3', 'Crear Primera Familia', 'Usa el botón "+" para registrar tu primera familia')}
            {renderPaso('4', 'Agregar Integrantes', 'Dentro de cada familia, agrega los miembros con su información médica')}
          </View>
        ))}

        {/* Navegación Principal */}
        {renderSeccion('🧭 Navegación Principal', (
          <View>
            {renderFuncion('🏠', 'Familias', 'Lista todas las familias registradas. Puedes crear, editar y ver detalles de cada familia.')}
            {renderFuncion('🔍', 'Búsqueda', 'Busca integrantes por nombre, edad, sexo, raza, enfermedad o dirección de familia.')}
            {renderFuncion('📊', 'Estadísticas', 'Visualiza resúmenes estadísticos: total de familias, integrantes, manzanas y distribuciones.')}
            {renderFuncion('⚙️', 'Configuración', 'Accede a tu perfil, términos, soporte técnico y otras opciones de la app.')}
          </View>
        ))}

        {/* Gestión de Familias */}
        {renderSeccion('👨‍👩‍👧‍👦 Gestión de Familias', (
          <View>
            <Text style={styles.textoDestacado}>
              📋 <Text style={styles.bold}>Crear Nueva Familia:</Text>
            </Text>
            <Text style={styles.bulletPoint}>• Número de familia (requerido)</Text>
            <Text style={styles.bulletPoint}>• Dirección completa (requerido)</Text>
            <Text style={styles.bulletPoint}>• Número de manzana (opcional, 1-999)</Text>
            <Text style={styles.bulletPoint}>• Población y consultorio (automático)</Text>
            
            <Text style={styles.textoDestacado}>
              ✏️ <Text style={styles.bold}>Editar Familia:</Text>
            </Text>
            <Text style={styles.texto}>
              Toca una familia en la lista y selecciona "Editar Familia" para modificar 
              cualquier información, incluyendo el número de manzana.
            </Text>
          </View>
        ))}

        {/* Gestión de Integrantes */}
        {renderSeccion('👤 Gestión de Integrantes', (
          <View>
            <Text style={styles.textoDestacado}>
              ➕ <Text style={styles.bold}>Agregar Integrante:</Text>
            </Text>
            <Text style={styles.bulletPoint}>• Información personal: nombre, edad, sexo</Text>
            <Text style={styles.bulletPoint}>• Información étnica: raza/etnia</Text>
            <Text style={styles.bulletPoint}>• Información médica: enfermedades (opcional)</Text>
            
            <Text style={styles.textoDestacado}>
              🏥 <Text style={styles.bold}>Enfermedades:</Text>
            </Text>
            <Text style={styles.texto}>
              Puedes agregar múltiples enfermedades separadas por comas. 
              Ejemplo: "Diabetes, Hipertensión, Asma"
            </Text>
          </View>
        ))}

        {/* Búsqueda Avanzada */}
        {renderSeccion('🔍 Búsqueda Avanzada', (
          <View>
            <Text style={styles.textoDestacado}>
              🎯 <Text style={styles.bold}>Filtros Disponibles:</Text>
            </Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Información Personal:</Text> Nombre, edad (rango)</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Género:</Text> Masculino o Femenino</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Raza/Etnia:</Text> Búsqueda por texto</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Ubicación:</Text> Dirección de la familia</Text>
            <Text style={styles.bulletPoint}>• <Text style={styles.bold}>Médica:</Text> Enfermedad específica</Text>
            
            <Text style={styles.textoDestacado}>
              💡 <Text style={styles.bold}>Consejos de Búsqueda:</Text>
            </Text>
            <Text style={styles.bulletPoint}>• Puedes combinar múltiples filtros</Text>
            <Text style={styles.bulletPoint}>• La búsqueda por dirección busca en toda la familia</Text>
            <Text style={styles.bulletPoint}>• Usa "Limpiar" para resetear todos los filtros</Text>
          </View>
        ))}

        {/* Estadísticas */}
        {renderSeccion('📊 Estadísticas', (
          <View>
            <Text style={styles.textoDestacado}>
              📈 <Text style={styles.bold}>Resumen General:</Text>
            </Text>
            <Text style={styles.bulletPoint}>• Total de familias registradas</Text>
            <Text style={styles.bulletPoint}>• Total de integrantes</Text>
            <Text style={styles.bulletPoint}>• Total de manzanas únicas</Text>
            <Text style={styles.bulletPoint}>• Promedio de integrantes por familia</Text>
            
            <Text style={styles.textoDestacado}>
              👥 <Text style={styles.bold}>Distribuciones:</Text>
            </Text>
            <Text style={styles.bulletPoint}>• Por sexo (masculino/femenino con porcentajes)</Text>
            <Text style={styles.bulletPoint}>• Por edad (niños, adultos, adultos mayores)</Text>
            <Text style={styles.bulletPoint}>• Enfermedades más comunes</Text>
            <Text style={styles.bulletPoint}>• Personas sin enfermedades registradas</Text>
          </View>
        ))}

        {/* Configuración */}
        {renderSeccion('⚙️ Configuración', (
          <View>
            <Text style={styles.textoDestacado}>
              👤 <Text style={styles.bold}>Mi Perfil:</Text>
            </Text>
            <Text style={styles.bulletPoint}>• Actualizar foto de perfil</Text>
            <Text style={styles.bulletPoint}>• Cambiar información personal</Text>
            <Text style={styles.bulletPoint}>• Modificar contraseña</Text>
            
            <Text style={styles.textoDestacado}>
              ℹ️ <Text style={styles.bold}>Información:</Text>
            </Text>
            <Text style={styles.bulletPoint}>• Términos y condiciones</Text>
            <Text style={styles.bulletPoint}>• Manual de usuario (esta pantalla)</Text>
            <Text style={styles.bulletPoint}>• Soporte técnico</Text>
            <Text style={styles.bulletPoint}>• Información de la aplicación</Text>
          </View>
        ))}

        {/* Consejos y Mejores Prácticas */}
        {renderSeccion('💡 Consejos y Mejores Prácticas', (
          <View>
            <Text style={styles.textoDestacado}>
              🔒 <Text style={styles.bold}>Seguridad:</Text>
            </Text>
            <Text style={styles.bulletPoint}>• Usa contraseñas seguras</Text>
            <Text style={styles.bulletPoint}>• Cierra sesión al terminar</Text>
            <Text style={styles.bulletPoint}>• No compartas tu usuario y contraseña</Text>
            
            <Text style={styles.textoDestacado}>
              💾 <Text style={styles.bold}>Gestión de Datos:</Text>
            </Text>
            <Text style={styles.bulletPoint}>• Verifica la información antes de guardar</Text>
            <Text style={styles.bulletPoint}>• Usa números de familia únicos</Text>
            <Text style={styles.bulletPoint}>• Mantén las direcciones actualizadas</Text>
            
            <Text style={styles.textoDestacado}>
              🚀 <Text style={styles.bold}>Rendimiento:</Text>
            </Text>
            <Text style={styles.bulletPoint}>• Reinicia la app si experimentas lentitud</Text>
            <Text style={styles.bulletPoint}>• Mantén la app actualizada</Text>
            <Text style={styles.bulletPoint}>• Libera espacio en tu dispositivo</Text>
          </View>
        ))}

        {/* Solución de Problemas */}
        {renderSeccion('🔧 Solución de Problemas Comunes', (
          <View>
            <Text style={styles.textoDestacado}>
              ❓ <Text style={styles.bold}>Problemas Frecuentes:</Text>
            </Text>
            
            <View style={styles.problemaItem}>
              <Text style={styles.problemaTitulo}>🐛 La app se cierra inesperadamente</Text>
              <Text style={styles.problemaSolucion}>
                → Reinicia la aplicación y el dispositivo. Si persiste, contacta soporte técnico.
              </Text>
            </View>
            
            <View style={styles.problemaItem}>
              <Text style={styles.problemaTitulo}>🔍 No encuentro una familia</Text>
              <Text style={styles.problemaSolucion}>
                → Verifica el número de familia o usa la búsqueda por dirección.
              </Text>
            </View>
            
            <View style={styles.problemaItem}>
              <Text style={styles.problemaTitulo}>📊 Las estadísticas no se actualizan</Text>
              <Text style={styles.problemaSolucion}>
                → Usa "pull to refresh" en la pantalla de estadísticas.
              </Text>
            </View>
            
            <View style={styles.problemaItem}>
              <Text style={styles.problemaTitulo}>🔐 Olvidé mi contraseña</Text>
              <Text style={styles.problemaSolucion}>
                → Usa la opción "Recuperar Contraseña" en la pantalla de login.
              </Text>
            </View>
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTexto}>
            📖 Manual de Usuario - Consultorio App v1.0.0
          </Text>
          <Text style={styles.footerSubtexto}>
            Para más ayuda, contacta nuestro soporte técnico
          </Text>
          <Text style={styles.footerFecha}>
            Última actualización: Octubre 2025
          </Text>
        </View>

      </ScrollView>
    </View>
  );
};


export default ManualUsuarioScreen;
