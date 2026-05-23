// ForgotPasswordScreen.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importamos tu servicio de autenticación
import { AuthService } from '@/services/auth.service';

const COLORS = {
  primary: '#2b6777',
  secondary: '#52ab98',
  background: '#f8fafc',
  white: '#ffffff',
  textDark: '#1e293b',
  textLight: '#64748b',
  border: '#e2e8f0',
  error: '#ef4444',
  success: '#22c55e',
};

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('El correo electrónico es requerido');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Ingresa un correo electrónico válido');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) validateEmail(text);
  };

  // FLUJO DE PETICIÓN DE RECUPERACIÓN CONECTADO A NESTJS
  const handleSendCode = async () => {
    if (!validateEmail(email)) return;

    setIsLoading(true);
    Keyboard.dismiss(); // Cierra el teclado automáticamente al enviar

    try {
      const emailFormatted = email.trim().toLowerCase();
      console.log('Enviando solicitud de recuperación para:', emailFormatted);

      // LLAMADA AL ENDPOINT: @Post('recover-request')
      // Nota: Asegúrate de que en tu auth.service tengas implementado este método apuntando a tu backend
      const response = await AuthService.recoverPasswordRequest(emailFormatted);
      
      console.log('Respuesta de recuperación recibida:', response);

      // Guardamos el email localmente para recordar el contexto en los siguientes pasos
      await AsyncStorage.setItem('tempEmail', emailFormatted);

      const successMessage = typeof response === 'string' ? response : (response?.message || 'Recuperación procesada correctamente.');

      if (Platform.OS === 'web') {
        alert(`${successMessage} Revisa tu bandeja de entrada.`);
        router.push('/auth/revisaTuCorreo');
      } else {
        Alert.alert(
          'Solicitud Procesada',
          'Si el correo está registrado, recibirás un enlace de recuperación en breve. Revisa tu bandeja de entrada.',
          [
            {
              text: 'Entendido',
              onPress: () => router.push('/auth/revisaTuCorreo'),
            },
          ]
        );
      }
    } catch (error: any) {
      console.log('ℹ️ Error en recoverRequest:', error.message || error);
      
      const errorMessage = error.message || 'No se pudo enviar el correo de recuperación. Por favor, inténtelo más tarde.';

      if (Platform.OS === 'web') {
        alert(errorMessage);
      } else {
        Alert.alert('Error de Envío', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Componente para descartar el teclado al hacer tap en cualquier lugar vacío
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.centerContent}
        >
          <View style={styles.card}>
            {/* Botón volver */}
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
              disabled={isLoading}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
            </TouchableOpacity>

            {/* Icono/Logo */}
            <View style={styles.iconContainer}>
              <View style={styles.iconCircle}>
                <Ionicons name="key-outline" size={40} color={COLORS.primary} />
              </View>
            </View>

            {/* Título */}
            <Text style={styles.title}>Recuperar Contraseña</Text>
            
            {/* Descripción */}
            <Text style={styles.description}>
              Ingresa tu correo electrónico para recibir un enlace de recuperación.
            </Text>

            {/* Input Correo Electrónico */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <View style={[styles.inputWrapper, emailError && styles.inputWrapperError]}>
                <Ionicons name="mail-outline" size={20} color={COLORS.textLight} />
                <TextInput
                  style={styles.input}
                  placeholder="nombre@ejemplo.com"
                  value={email}
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  onSubmitEditing={handleSendCode} // Permite enviar desde el botón del teclado
                />
                {email !== '' && !emailError && (
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
                )}
              </View>
              {emailError ? (
                <Text style={styles.errorText}>{emailError}</Text>
              ) : null}
            </View>

            {/* Botón Enviar Código */}
            <TouchableOpacity 
              style={[styles.sendBtn, isLoading && styles.sendBtnDisabled]}
              onPress={handleSendCode}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.sendBtnText}>Enviar Código</Text>
              )}
            </TouchableOpacity>

            {/* Link Volver al inicio de sesión */}
            <Pressable 
              style={styles.backToLogin}
              onPress={() => router.push('/auth/loginContrasena')}
              disabled={isLoading}
            >
              <Ionicons name="log-in-outline" size={16} color={COLORS.primary} />
              <Text style={styles.backToLoginText}>Volver al inicio de sesión</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  centerContent: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  card: {
    backgroundColor: COLORS.white,
    width: '100%',
    maxWidth: 450,
    borderRadius: 20,
    padding: 30,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 8,
    zIndex: 1,
  },
  iconContainer: {
    marginBottom: 24,
    marginTop: 20,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 20,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 32,
  },
  label: {
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 8,
    fontSize: 14,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 55,
    backgroundColor: COLORS.white,
  },
  inputWrapperError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: COLORS.textDark,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  sendBtn: {
    backgroundColor: COLORS.primary,
    width: '100%',
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 24,
  },
  sendBtnDisabled: {
    opacity: 0.7,
  },
  sendBtnText: { 
    color: COLORS.white, 
    fontSize: 16, 
    fontWeight: '700' 
  },
  backToLogin: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backToLoginText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
});