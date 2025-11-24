import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF5722',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  seccion: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  seccionTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  contactoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  contactoIcono: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FF5722',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactoEmojiIcono: {
    fontSize: 20,
  },
  contactoInfo: {
    flex: 1,
  },
  contactoTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  contactoSubtitulo: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  contactoValor: {
    fontSize: 14,
    color: '#FF5722',
    fontWeight: 'bold',
  },
  contactoFlecha: {
    padding: 8,
  },
  flechaTexto: {
    fontSize: 18,
    color: '#FF5722',
    fontWeight: 'bold',
  },
  horariosContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
  },
  horarioItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  horarioDia: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  horarioHora: {
    fontSize: 14,
    color: '#666',
  },
  tiposSoporte: {
    gap: 12,
  },
  tipoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  tipoIcono: {
    fontSize: 24,
    marginRight: 12,
    marginTop: 2,
  },
  tipoTexto: {
    flex: 1,
  },
  tipoTitulo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  tipoDescripcion: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  infoAdicional: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
  },
  infoTexto: {
    fontSize: 14,
    color: '#1976D2',
    marginBottom: 6,
    lineHeight: 18,
  },
  infoBold: {
    fontWeight: 'bold',
  },
  consejosContainer: {
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 8,
  },
  consejoItem: {
    fontSize: 14,
    color: '#2E7D32',
    marginBottom: 8,
    lineHeight: 18,
  },
  consejoBold: {
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: '#FF5722',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  footerTexto: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  footerSubtexto: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },
});
