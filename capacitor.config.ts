import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'cl.kuentu.app',
  appName: 'Kuentu',
  webDir: 'dist',
  backgroundColor: '#1C375B',
  android: {
    backgroundColor: '#1C375B',
  },
  ios: {
    backgroundColor: '#1C375B',
    contentInset: 'never',
  },
}

export default config
