// app/auth/establecerNuevaContrasena.tsx
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

// Importamos tu servicio de autenticación conectado al backend
import { AuthService } from '@/services/auth.service';

export default function EstablecerNuevaContraseña() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // 🔑 AQUÍ CAPTURAMOS EL TOKEN: Viene desde const expoUrl = `exp://.../auth/establecerNuevaContrasena?token=${token}`
  const token = (params.token as string) || ''; 
  
  const [nuevaContraseña, setNuevaContraseña] = useState('');
  const [confirmarContraseña, setConfirmarContraseña] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const COLORS = {
    primary: '#2b6777',
    secondary: '#52ab98',
    background: '#f8fafc',
    white: '#ffffff',
    textDark: '#1e293b',
    textLight: '#64748b',
  };

  const handleRestablecer = async () => {
    // 🛡️ Validación de seguridad por si abren la pantalla sin token
    if (!token) {
      Alert.alert('Error', 'El token de recuperación no es válido o ya expiró. Por favor solicita un nuevo correo.');
      return;
    }

    if (!nuevaContraseña || !confirmarContraseña) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (nuevaContraseña.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (nuevaContraseña !== confirmarContraseña) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);
    Keyboard.dismiss();

    try {
      // 🚀 PASO 3 EN ACCIÓN: Llamamos al endpoint @Post('recover-confirm') de tu backend
      console.log('Enviando confirmación de contraseña para el token:', token);
      
      await AuthService.confirmPasswordReset({
        token: token,
        newPassword: nuevaContraseña.trim()
      });

      setIsLoading(false);
      
      Alert.alert(
        '¡Éxito!',
        'Tu contraseña ha sido restablecida correctamente.',
        [
          {
            text: 'Iniciar Sesión',
            onPress: () => router.replace('/auth/loginContrasena')
          }
        ]
      );
      
    } catch (error: any) {
      setIsLoading(false);
      // Capturamos el error estructurado que devuelve tu NestJS (ej: 401 Unauthorized)
      const errorMessage = error.response?.data?.message || 'No se pudo restablecer la contraseña. Intenta de nuevo.';
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={styles.container}>
        {/* Título */}
        <Text style={styles.title}>Establecer nueva contraseña</Text>

        {/* Subtítulo */}
        <Text style={styles.subtitle}>
          Ingresa tu nueva contraseña a continuación para recuperar el acceso a tu cuenta.
        </Text>

        {/* Campo Nueva Contraseña */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Nueva Contraseña</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              placeholder="Ingresa tu nueva contraseña"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              value={nuevaContraseña}
              onChangeText={setNuevaContraseña}
              autoCapitalize="none"
              editable={!isLoading}
            />
            <TouchableOpacity 
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Campo Confirmar Contraseña */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirmar Contraseña</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.input}
              placeholder="Confirma tu nueva contraseña"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              value={confirmarContraseña}
              onChangeText={setConfirmarContraseña}
              autoCapitalize="none"
              editable={!isLoading}
              onSubmitEditing={handleRestablecer}
            />
          </View>
        </View>

        {/* Botón Restablecer */}
        <TouchableOpacity 
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleRestablecer}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Restablecer Contraseña</Text>
          )}
        </TouchableOpacity>

        {/* Enlace Volver */}
        <TouchableOpacity 
          style={styles.backLink}
          onPress={() => router.replace('/auth/loginContrasena')}
          disabled={isLoading}
        >
          <Text style={styles.backLinkText}>Volver al inicio de sesión</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#F9F9F9',
    height: 55,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000',
  },
  eyeButton: {
    paddingHorizontal: 15,
    justifyContent: 'center',
  },
  eyeText: {
    fontSize: 20,
  },
  button: {
    backgroundColor: '#2b6777',
    borderRadius: 27,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#99C4FF',
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backLink: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backLinkText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});