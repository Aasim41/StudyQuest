import { Platform } from 'react-native';

// Localhost server configuration
// For Android emulator: 10.0.2.2:3000
// For physical device over Wi-Fi: 192.168.20.20:3000
// For Web / iOS Simulator: localhost:3000
const LOCAL_IP = '192.168.20.20';

const API_BASE = Platform.select({
  web: 'http://localhost:3000',
  android: `http://${LOCAL_IP}:3000`,
  ios: 'http://localhost:3000',
  default: `http://${LOCAL_IP}:3000`,
});

export default API_BASE;

