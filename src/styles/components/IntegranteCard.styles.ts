import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
    marginHorizontal: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  sexoIcon: {
    fontSize: 20,
    marginLeft: 8,
  },
  raza: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 4,
    marginLeft: 8,
  },
  actionText: {
    fontSize: 16,
  },
  info: {
    marginTop: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  edadBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  edadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  enfermedadesContainer: {
    marginTop: 8,
  },
  enfermedadesLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  enfermedadesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  enfermedadTag: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
    marginBottom: 2,
  },
  enfermedadText: {
    fontSize: 12,
    color: '#E65100',
  },
  masEnfermedades: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  grupoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  grupoEmoji: {
    fontSize: 12,
    marginRight: 4,
  },
  grupoText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: 'bold',
  },
});
