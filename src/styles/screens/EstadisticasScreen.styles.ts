import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  listContainer: {
    marginTop: 8,
  },
  listItem: {
    paddingVertical: 4,
  },
  listText: {
    fontSize: 14,
    color: '#333',
  },
  sexoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  sexoItem: {
    alignItems: 'center',
    flex: 1,
  },
  sexoEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  sexoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  sexoValue: {
    fontSize: 20,
    color: '#333',
    fontWeight: 'bold',
    marginTop: 4,
  },
  sexoPorcentaje: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  enfermedadItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  enfermedadLabel: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  enfermedadValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
  enfermedadPorcentaje: {
    fontSize: 12,
    color: '#888',
    minWidth: 50,
    textAlign: 'right',
  },
  masEnfermedades: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
  // Estilos para grupos dispensariales
  grupoDispensarialContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  grupoDispensarialItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  grupoEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  grupoLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  grupoSubLabel: {
    fontSize: 11,
    color: '#666',
    marginBottom: 6,
    textAlign: 'center',
  },
  grupoValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  grupoPorcentaje: {
    fontSize: 12,
    color: '#888',
  },
  grupoProgressContainer: {
    marginVertical: 16,
  },
  grupoProgressBar: {
    flexDirection: 'row',
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  grupoProgressFill: {
    height: '100%',
  },
  grupoInfoContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  grupoInfoText: {
    fontSize: 12,
    color: '#1976D2',
    lineHeight: 16,
  },
});
