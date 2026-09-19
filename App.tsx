/**
 * Entry point. Lane A owns this file — nobody else edits it.
 *
 * Deliberately almost empty: providers, then the navigator. Screens go in
 * src/screens/ and get registered in src/navigation/RootNavigator.tsx.
 *
 * No StatusBar style is set here on purpose — the decoy is light and the real
 * app is dark, so each sets its own.
 */

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { VaultProvider } from './src/state/VaultState';
import { AppDataProvider } from './src/state/AppData';
import { ExitWarningProvider } from './src/components/ExitWarning';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <VaultProvider>
        <AppDataProvider>
          <ExitWarningProvider>
            <RootNavigator />
          </ExitWarningProvider>
        </AppDataProvider>
      </VaultProvider>
    </SafeAreaProvider>
  );
}
