import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/context/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#0A1628' },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen 
            name="person/[id]" 
            options={{ 
              presentation: 'modal',
              animation: 'slide_from_bottom'
            }} 
          />
          <Stack.Screen 
            name="add-person" 
            options={{ 
              presentation: 'modal',
              animation: 'slide_from_bottom'
            }} 
          />
          <Stack.Screen 
            name="add-link" 
            options={{ 
              presentation: 'modal',
              animation: 'slide_from_bottom'
            }} 
          />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
