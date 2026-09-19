/**
 * The app shell. Lane A owns this file — nobody else edits it.
 *
 * Two states, not two tabs: locked shows the decoy and nothing else, unlocked
 * shows the real stack. When the vault locks — panic button, or the app going
 * to the background — this swaps back to the decoy immediately, which is what
 * keeps the app-switcher preview clean.
 *
 * To add a screen: add it to AppStackParamList in ./types, then register it
 * below. Tell the group chat, since the param list is shared.
 */

import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useVault } from '../state/VaultState';
import { app } from '../theme';
import type { AppStackParamList } from './types';

import { Decoy } from '../screens/Decoy';
import Home from '../screens/Home';
import Assessment from '../screens/Assessment';
import Path from '../screens/Path';
import Directory from '../screens/Directory';
import Fund from '../screens/Fund';
import Vault from '../screens/Vault';
import AccountGuide from '../screens/AccountGuide';
import SetupCheck from '../screens/SetupCheck';

const Stack = createNativeStackNavigator<AppStackParamList>();

const theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: app.bg, card: app.bg, text: app.text },
};

export function RootNavigator() {
  const { unlocked } = useVault();

  if (!unlocked) return <Decoy />;

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Assessment" component={Assessment} />
        <Stack.Screen name="Path" component={Path} />
        <Stack.Screen name="Directory" component={Directory} />
        <Stack.Screen name="Fund" component={Fund} />
        <Stack.Screen name="Vault" component={Vault} />
        <Stack.Screen name="AccountGuide" component={AccountGuide} />
        <Stack.Screen name="SetupCheck" component={SetupCheck} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
