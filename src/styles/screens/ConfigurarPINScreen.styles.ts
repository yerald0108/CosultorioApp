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
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: -20,
    left: 0,
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#E3F2FD',
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#E3F2FD',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  pinContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  pinDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
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
  lengthText: {
    fontSize: 14,
    color: '#E3F2FD',
    textAlign: 'center',
  },
  numberPad: {
    alignItems: 'center',
    marginBottom: 20,
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
    alignItems: 'center',
    marginBottom: 20,
  },
  statusText: {
    fontSize: 16,
    color: '#E3F2FD',
    textAlign: 'center',
  },
  continueButton: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#4CAF50',
    elevation: 3,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  instructionsContainer: {
    position: 'absolute',
    bottom: 30,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  instructionsText: {
    fontSize: 12,
    color: '#E3F2FD',
    textAlign: 'center',
    marginBottom: 4,
  },
});
