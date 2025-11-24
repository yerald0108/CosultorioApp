import * as React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { IntegranteData } from '../types';
import { styles } from '../styles/components/IntegranteCard.styles';

interface IntegranteCardProps {
  integrante: IntegranteData;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

const IntegranteCard: React.FC<IntegranteCardProps> = ({
  integrante,
  onPress,
  onEdit,
  onDelete,
  showActions = true,
}) => {
  const getEdadColor = (edad: number) => {
    if (edad < 18) return '#4CAF50'; // Verde para niños
    if (edad >= 65) return '#FF9800'; // Naranja para adultos mayores
    return '#2196F3'; // Azul para adultos
  };

  const getSexoIcon = (sexo: string) => {
    return sexo === 'Masculino' ? '👨' : '👩';
  };

  const getGrupoDispensarialInfo = (grupo: 'I' | 'II' | 'III' | 'IV') => {
    const grupos = {
      'I': { emoji: '✅', label: 'Grupo I', color: '#4CAF50', description: 'Sano' },
      'II': { emoji: '⚠️', label: 'Grupo II', color: '#FF9800', description: 'Riesgo' },
      'III': { emoji: '🏥', label: 'Grupo III', color: '#F44336', description: 'Enfermo' },
      'IV': { emoji: '♿', label: 'Grupo IV', color: '#9C27B0', description: 'Discapacitado' }
    };
    return grupos[grupo] || grupos['I'];
  };

  return (
    <TouchableOpacity 
      style={styles.card} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.nombre}>{integrante.nombre}</Text>
            <Text style={styles.sexoIcon}>{getSexoIcon(integrante.sexo)}</Text>
          </View>
          <Text style={styles.raza}>{integrante.raza}</Text>
        </View>
        {showActions && (
          <View style={styles.actions}>
            {onEdit && (
              <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
                <Text style={styles.actionText}>✏️</Text>
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
                <Text style={styles.actionText}>🗑️</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
      
      <View style={styles.info}>
        <View style={styles.infoItem}>
          <View style={[styles.edadBadge, { backgroundColor: getEdadColor(integrante.edad) }]}>
            <Text style={styles.edadText}>{integrante.edad} años</Text>
          </View>
          
          {/* Grupo Dispensarial */}
          <View style={[
            styles.grupoBadge, 
            { backgroundColor: getGrupoDispensarialInfo(integrante.grupoDispensarial || 'I').color }
          ]}>
            <Text style={styles.grupoEmoji}>
              {getGrupoDispensarialInfo(integrante.grupoDispensarial || 'I').emoji}
            </Text>
            <Text style={styles.grupoText}>
              {getGrupoDispensarialInfo(integrante.grupoDispensarial || 'I').description}
            </Text>
          </View>
        </View>
        
        {integrante.enfermedades.length > 0 && (
          <View style={styles.enfermedadesContainer}>
            <Text style={styles.enfermedadesLabel}>🏥 Enfermedades:</Text>
            <View style={styles.enfermedadesList}>
              {integrante.enfermedades.slice(0, 3).map((enfermedad, index) => (
                <View key={index} style={styles.enfermedadTag}>
                  <Text style={styles.enfermedadText}>{enfermedad}</Text>
                </View>
              ))}
              {integrante.enfermedades.length > 3 && (
                <Text style={styles.masEnfermedades}>
                  +{integrante.enfermedades.length - 3} más
                </Text>
              )}
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};


// Exportar con React.memo para optimización de performance
export default React.memo(IntegranteCard);
