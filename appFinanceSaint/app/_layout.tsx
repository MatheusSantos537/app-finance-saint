import { DarkTheme, DefaultTheme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemeProvider } from '../contexts/ThemeProvider'; // 1. Importe seu provedor


export default function RootLayout() {
  
  // 2. "Envelope" todo o seu app com o ThemeProvider
  return (
    <ThemeProvider>
      {/* O resto do seu app vai aqui dentro.
          Ex: um Stack Navigator do Expo Router */}
      <Stack>
        <Stack.Screen name="index" />
        <Stack.Screen name="gastos" />
      </Stack>
    </ThemeProvider>
  );
}
