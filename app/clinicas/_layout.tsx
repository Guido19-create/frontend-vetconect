import { Stack } from 'expo-router';
import React from 'react';

export default function ClinicasLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          headerShown: false, // Ocultamos el header por defecto para usar nuestra UI personalizada
        }} 
      />
    </Stack>
  );
}