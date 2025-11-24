import * as React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { styles } from '../styles/components/GrupoDispensarialSelector.styles';

interface Props {
  selectedGroup: 'I' | 'II' | 'III' | 'IV';
  onGroupChange: (group: 'I' | 'II' | 'III' | 'IV') => void;
  style?: any;
}

const GrupoDispensarialSelector: React.FC<Props> = ({
  selectedGroup,
  onGroupChange,
  style,
}) => {
  const grupos = [
    {
      value: 'I' as const,
      label: 'Grupo I',
      description: 'Supuestamente Sano',
      color: '#4CAF50',
      emoji: '✅'
    },
    {
      value: 'II' as const,
      label: 'Grupo II',
      description: 'De Riesgos',
      color: '#FF9800',
      emoji: '⚠️'
    },
    {
      value: 'III' as const,
      label: 'Grupo III',
      description: 'Enfermos',
      color: '#F44336',
      emoji: '🏥'
    },
    {
      value: 'IV' as const,
      label: 'Grupo IV',
      description: 'Discapacitados',
      color: '#9C27B0',
      emoji: '♿'
    }
  ];

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Grupo Dispensarial</Text>
      <Text style={styles.subtitle}>Selecciona la clasificación médica del integrante</Text>
      
      <View style={styles.groupsContainer}>
        {grupos.map((grupo) => (
          <TouchableOpacity
            key={grupo.value}
            style={[
              styles.groupOption,
              selectedGroup === grupo.value && [
                styles.selectedOption,
                { borderColor: grupo.color }
              ]
            ]}
            onPress={() => onGroupChange(grupo.value)}
          >
            <View style={styles.groupHeader}>
              <Text style={styles.groupEmoji}>{grupo.emoji}</Text>
              <Text style={[
                styles.groupLabel,
                selectedGroup === grupo.value && { color: grupo.color }
              ]}>
                {grupo.label}
              </Text>
            </View>
            <Text style={[
              styles.groupDescription,
              selectedGroup === grupo.value && { color: grupo.color }
            ]}>
              {grupo.description}
            </Text>
            
            {/* Indicador de selección */}
            <View style={styles.radioContainer}>
              <View style={[
                styles.radioButton,
                selectedGroup === grupo.value && [
                  styles.radioSelected,
                  { backgroundColor: grupo.color }
                ]
              ]}>
                {selectedGroup === grupo.value && (
                  <View style={styles.radioInner} />
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>
      
      {/* Información adicional */}
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          ℹ️ Los grupos dispensariales son una clasificación médica estándar para organizar la atención sanitaria según el estado de salud de cada persona.
        </Text>
      </View>
    </View>
  );
};


export default GrupoDispensarialSelector;
