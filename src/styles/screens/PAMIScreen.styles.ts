import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 20,
    paddingVertical: 30,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.9,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  moduloCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderLeftWidth: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  moduloHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moduloIcono: {
    fontSize: 40,
    marginRight: 15,
  },
  moduloInfo: {
    flex: 1,
  },
  moduloTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  moduloDescripcion: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  moduloTotal: {
    alignItems: 'center',
  },
  totalNumero: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  totalLabel: {
    fontSize: 12,
    color: '#666',
  },
  moduloFooter: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  verMasText: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
    textAlign: 'right',
  },
  estadisticasGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  estadisticaCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    borderTopWidth: 3,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  estadisticaIcono: {
    fontSize: 24,
    marginBottom: 8,
  },
  estadisticaValor: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  estadisticaTitulo: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  infoBold: {
    fontWeight: 'bold',
    color: '#333',
  },
  bottomSpacing: {
    height: 30,
  },
});
