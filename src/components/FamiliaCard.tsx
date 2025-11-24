import * as React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FamiliaData } from '../types';
import { styles } from '../styles/components/FamiliaCard.styles';

interface FamiliaCardProps {
  familia: FamiliaData;
  integrantesCount: number;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const FamiliaCard: React.FC<FamiliaCardProps> = ({
  familia,
  integrantesCount,
  onPress,
  onEdit,
  onDelete,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.numero}>Familia #{familia.numero}</Text>
          <Text style={styles.familiaInfo}>
            🏠 {familia.direccion}
          </Text>
          <Text style={styles.familiaInfo}>
            📍 {familia.poblacion} - {familia.consultorio}
          </Text>
        </View>
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
              <Text style={styles.editText}>✏️</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
              <Text style={styles.deleteText}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.info}>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>📍 Consultorio:</Text>
          <Text style={styles.infoText}>{familia.consultorio}</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>👥 Integrantes:</Text>
          <Text style={styles.infoText}>
            {integrantesCount} persona{integrantesCount !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};


// Exportar con React.memo para optimización de performance
export default React.memo(FamiliaCard);
