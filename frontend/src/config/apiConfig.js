import { Platform } from 'react-native';

// Localhost server configuration
// For Android emulator: 10.0.2.2:3000
// For physical device over Wi-Fi: 10.45.207.59:3000
// For Web / iOS Simulator: localhost:3000
const LOCAL_IP = '10.45.207.59'; // Auto-detected Wi-Fi IP

const API_BASE = Platform.select({
  android: `http://${LOCAL_IP}:3000`,
  ios: 'http://localhost:3000',
  default: `http://${LOCAL_IP}:3000`,
});

export default API_BASE;
