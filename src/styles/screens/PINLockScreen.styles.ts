import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E3F2FD',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  pinContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  pinDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginHorizontal: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  pinDotEmpty: {
    backgroundColor: 'transparent',
  },
  pinDotFilled: {
    backgroundColor: '#fff',
  },
  attemptsText: {
    fontSize: 14,
    color: '#E3F2FD',
    textAlign: 'center',
  },
  numberPad: {
    alignItems: 'center',
  },
  numberRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  numberButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  numberButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  numberText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  backspaceButton: {
    backgroundColor: 'rgba(244, 67, 54, 0.3)',
    borderColor: 'rgba(244, 67, 54, 0.5)',
  },
  backspaceText: {
    fontSize: 20,
    color: '#fff',
  },
  statusContainer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    color: '#E3F2FD',
    textAlign: 'center',
  },
  lockedText: {
    fontSize: 16,
    color: '#FFCDD2',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  verifyButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#1976D2',
    elevation: 3,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  changeMethodButton: {
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
    marginTop: 20,
  },
  changeMethodText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
