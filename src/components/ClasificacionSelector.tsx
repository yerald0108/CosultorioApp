import * as React from 'react';
import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { ClasificacionRiesgo, CLASIFICACIONES_RIESGO } from '../types/PAMITypes';
import { styles } from '../styles/components/ClasificacionSelector.styles';

interface Props {
  value: ClasificacionRiesgo | null;
  onValueChange: (clasificacion: ClasificacionRiesgo) => void;
  placeholder?: string;
  disabled?: boolean;
}

const ClasificacionSelector: React.FC<Props> = ({
  value,
  onValueChange,
  placeholder = "Seleccionar clasificación",
  disabled = false
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSelect = (clasificacion: ClasificacionRiesgo) => {
    onValueChange(clasificacion);
    setModalVisible(false);
  };

  const getSelectedInfo = () => {
    if (!value) return null;
    return CLASIFICACIONES_RIESGO[value];
  };

  const selectedInfo = getSelectedInfo();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.selector,
          disabled && styles.selectorDisabled,
          selectedInfo && { borderColor: selectedInfo.color }
        ]}
        onPress={() => !disabled && setModalVisible(true)}
        disabled={disabled}
      >
        {selectedInfo ? (
          <View style={styles.selectedContainer}>
            <View style={[styles.colorIndicator, { backgroundColor: selectedInfo.color }]} />
            <View style={styles.selectedTextContainer}>
              <Text style={styles.selectedCode}>{selectedInfo.codigo}</Text>
              <Text style={styles.selectedName}>{selectedInfo.nombre}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.placeholder}>{placeholder}</Text>
        )}
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Clasificación de Riesgo</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.optionsContainer}>
              {Object.values(CLASIFICACIONES_RIESGO).map((clasificacion) => (
                <TouchableOpacity
                  key={clasificacion.codigo}
                  style={[
                    styles.option,
                    value === clasificacion.codigo && styles.optionSelected
                  ]}
                  onPress={() => handleSelect(clasificacion.codigo as ClasificacionRiesgo)}
                >
                  <View style={styles.optionContent}>
                    <View style={[styles.optionColorIndicator, { backgroundColor: clasificacion.color }]} />
                    <View style={styles.optionTextContainer}>
                      <Text style={styles.optionCode}>{clasificacion.codigo}</Text>
                      <Text style={styles.optionName}>{clasificacion.nombre}</Text>
                      <Text style={styles.optionDescription}>{clasificacion.descripcion}</Text>
                    </View>
                  </View>
                  {value === clasificacion.codigo && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalFooter}>
              <Text style={styles.footerText}>
                💡 Selecciona la clasificación según los factores de riesgo identificados
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};


export default ClasificacionSelector;
