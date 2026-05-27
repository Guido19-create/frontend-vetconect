// app/auth/loginContrasena.tsx
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, Stack } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';

// Importamos el servicio de autenticación
import { AuthService } from '@/services/auth.service';

const COLORS = {
  primary: '#2b6777',
  secondary: '#52ab98',
  background: '#f8fafc',
  white: '#ffffff',
  textDark: '#1e293b',
  textLight: '#64748b',
  border: '#e2e8f0',
};

export default function LoginContrasenaScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Cargar el email guardado en el paso anterior
    const loadEmail = async () => {
      const savedEmail = await AsyncStorage.getItem('tempEmail');
      if (savedEmail) {
        setEmail(savedEmail);
      }
    };
    loadEmail();
  }, []);

  // FLUJO DE INICIO DE SESIÓN INTEGRADO CON NESTJS
  const handleLogin = async () => {
    if (!email) {
      if (Platform.OS === 'web') alert('Correo electrónico no encontrado');
      else Alert.alert('Error', 'Correo electrónico no encontrado');
      router.push('/auth/login');
      return;
    }
    
    if (!password) {
      if (Platform.OS === 'web') alert('Por favor ingresa tu contraseña');
      else Alert.alert('Error', 'Por favor ingresa tu contraseña');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Iniciando sesión en login/init con:', email);
      
      // Llamada al endpoint de NestJS para validar contraseña e iniciar 2FA
      const response = await AuthService.loginInit(email, password);
      
      // Capturamos el mensaje que envía tu backend
      const successMessage = response.message || 'Se ha enviado un código al correo. Por favor revise.';
      
      // ✨ NOTA: Ya NO pisamos 'tempUserId' aquí porque fue guardado de forma segura en la pantalla 'login.tsx'

      if (Platform.OS === 'web') {
        alert(successMessage);
        router.push('/auth/verificarContrasena'); 
      } else {
        Alert.alert('Código Enviado', successMessage, [
          { 
            text: 'Ir a verificar', 
            onPress: () => router.push('/auth/verificarContrasena') 
          }
        ]);
      }

    } catch (error: any) {
      console.log('ℹ️ Intento de Login rechazado:', error.message);

      const backendError = error.message || '';
      let alertMessage = 'Credenciales inválidas o usuario sin contraseña configurada';
      
      if (backendError.includes('contraseña configurada')) {
        alertMessage = 'Este usuario no tiene una contraseña configurada (registrado vía red social).';
      } else if (backendError.includes('invalidas') || backendError.includes('401')) {
        alertMessage = 'Credenciales inválidas. Por favor, verifica tus datos.';
      }

      if (Platform.OS === 'web') {
        alert(alertMessage);
      } else {
        Alert.alert('No se pudo iniciar sesión', alertMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: false 
        }} 
      />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <SafeAreaView style={styles.container}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.centerContent}
          >
            <View style={styles.card}>
              {/* Flecha de volver y título */}
              <View style={styles.headerRow}>
                <TouchableOpacity 
                  onPress={() => router.back()} 
                  style={styles.backButton}
                >
                  <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Iniciar Sesión</Text>
                <View style={styles.placeholderView} />
              </View>

              {/* LOGO */}
              <View style={styles.logoRow}>
                <View style={styles.logoIcon}>
                  <Ionicons name="paw" size={28} color={COLORS.white} />
                </View>
                <Text style={styles.logoText}>Vet<Text style={{ color: COLORS.textDark }}>Conect</Text></Text>
              </View>

              {/* INPUT CORREO */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Correo Electrónico</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color={COLORS.textLight} />
                  <TextInput
                    style={styles.input}
                    placeholder="nombre@ejemplo.com"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={false}
                  />
                </View>
              </View>

              {/* INPUT CONTRASEÑA */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Contraseña</Text>
                  <TouchableOpacity 
                    onPress={() => router.push('/auth/recuperarContrasena')}
                    disabled={isLoading}
                  >
                    <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color={COLORS.textLight} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    editable={!isLoading}
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} disabled={isLoading}>
                    <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.textLight} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* BOTÓN INICIAR SESIÓN */}
              <TouchableOpacity 
                style={[styles.loginBtn, isLoading && { opacity: 0.7 }]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.loginBtnText}>Iniciar Sesión</Text>
                )}
              </TouchableOpacity>
              
              {/* FOOTER */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>¿No tienes una cuenta? </Text>
                <Pressable onPress={() => router.push('/auth/register')} disabled={isLoading}>
                  <Text style={styles.linkText}>Regístrate aquí</Text>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: {
    backgroundColor: COLORS.white,
    width: '100%',
    maxWidth: 450,
    borderRadius: 20,
    padding: 40,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  placeholderView: {
    width: 34,
  },
  logoRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 30,
    marginTop: 10,
  },
  logoIcon: { backgroundColor: COLORS.primary, padding: 8, borderRadius: 12, marginRight: 10 },
  logoText: { fontSize: 28, fontWeight: '800', color: COLORS.secondary },
  inputGroup: { width: '100%', marginBottom: 25 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label: { fontWeight: '700', color: COLORS.textDark },
  forgotText: { color: '#3b82f6', fontSize: 13, fontWeight: '500' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 55,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 16 },
  loginBtn: {
    backgroundColor: '#074e6c',
    width: '100%',
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#074e6c',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  loginBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', marginTop: 25 },
  footerText: { color: COLORS.textLight },
  linkText: { color: '#3b82f6', fontWeight: '700' },
});