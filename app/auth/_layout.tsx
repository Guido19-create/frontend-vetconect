import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="loginCont" 
        options={{ 
          title: 'Iniciar Sesión',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="register" 
        options={{ 
          title: 'Crear Cuenta',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="recuperar-password" 
        options={{ 
          title: 'Recuperar Contraseña',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="RevisaTuCorreo" 
        options={{ 
          title: 'Revisa tu correo',
          headerShown: true,
          headerBackVisible: true
        }} 
      />
      <Stack.Screen 
        name="establecer-nueva-contrasena" 
        options={{ 
          title: 'Nueva Contraseña',
          headerShown: true,
          headerBackVisible: true
        }} 
      />
    </Stack>
  );
}