// app/auth/login.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Pressable,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthService } from '@/services/auth.service';

WebBrowser.maybeCompleteAuthSession();

const COLORS = {
  primary: '#2b6777',
  secondary: '#52ab98',
  background: '#f8fafc',
  white: '#ffffff',
  textDark: '#1e293b',
  textLight: '#64748b',
  border: '#e2e8f0',
};

// ⚠️ RECUERDA: Este Client ID debe ser de tipo "Web" en tu consola de Google Cloud Developer para que funcione con Expo Go
const GOOGLE_CLIENT_ID = 'TU_CLIENT_ID_AQUI.apps.googleusercontent.com';

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // 🛠️ Configuración ajustada para solicitar el id_token (JWT)
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      scopes: ['profile', 'email'],
      redirectUri: makeRedirectUri({ scheme: 'vetconect' }),
      responseType: 'id_token', // 🔑 SOLICITAMOS EL ID_TOKEN DIRECTAMENTE
    },
    discovery
  );

  // Escucha los cambios del flujo de autenticación de Google
  useEffect(() => {
    if (response?.type === 'success') {
      // 🎯 Capturamos el id_token que viene en los parámetros de respuesta
      const { id_token } = response.params;
      
      if (id_token) {
        handleBackendSocialLogin(id_token);
      } else {
        showAuthError('No se pudo extraer la firma de identidad de Google.');
      }
    } else if (response?.type === 'error' || response?.type === 'cancel') {
      showAuthError('Autenticación cancelada o fallida con Google.');
    }
  }, [response]);

  // 🚀 CONEXIÓN CON TU BACKEND NESTJS
  const handleBackendSocialLogin = async (idToken: string) => {
    try {
      console.log('📦 Enviando idToken de Google a la API de NestJS...');
      
      // Llamamos a tu endpoint @Post('social-login')
      const data = await AuthService.loginWithSocialProvider(idToken, 'google');
      
      console.log('✅ Autenticación exitosa en el Backend. Datos de usuario:', data.user);

      if (Platform.OS === 'web') {
        alert(`¡Bienvenido! Hola ${data.user.firstName}`);
        router.push('/tabs');
      } else {
        Alert.alert('¡Bienvenido!', `Hola ${data.user.firstName}`, [
          { text: 'Continuar', onPress: () => router.push('/tabs') }
        ]);
      }
    } catch (error: any) {
      console.error('❌ Error en el social login:', error);
      const msg = error.response?.data?.message || 'El servidor rechazó la autenticación social.';
      showAuthError(msg);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await promptAsync();
    } catch (error) {
      showAuthError('No se pudo desplegar la ventana de Google.');
    }
  };

  const showAuthError = (message: string) => {
    setIsGoogleLoading(false);
    if (Platform.OS === 'web') {
      alert(message);
    } else {
      Alert.alert('Error de Autenticación', message);
    }
  };

  // Login tradicional por correo electrónico
  const handleNextStep = async () => {
    if (!email.trim()) {
      showAuthError('Por favor ingresa tu correo electrónico');
      return;
    }

    setIsLoading(true);
    try {
      const data = await AuthService.login(email);
      const finalUserId = data.userId || '';
      const emailFormatted = email.trim().toLowerCase();

      await AsyncStorage.setItem('tempEmail', emailFormatted);
      await AsyncStorage.setItem('tempUserId', finalUserId);
      await AsyncStorage.setItem('authMode', 'login');

      router.push('/auth/loginContrasena');
    } catch (error: any) {
      showAuthError(error.message || 'El correo electrónico no está registrado');
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
                <Text style={styles.headerTitle}>Inicio de Sesión</Text>
                <View style={styles.placeholderView} />
              </View>

              {/* LOGO */}
              <View style={styles.logoRow}>
                <View style={styles.logoIcon}>
                  <Ionicons name="paw" size={28} color={COLORS.white} />
                </View>
                <Text style={styles.logoText}>Vet<Text style={{ color: COLORS.textDark }}>Conect</Text></Text>
              </View>

              {/* BOTÓN GOOGLE */}
              <TouchableOpacity 
                style={styles.googleBtn}
                onPress={handleGoogleSignIn}
                disabled={isGoogleLoading || isLoading}
              >
                {isGoogleLoading ? (
                  <ActivityIndicator color="#ea4335" style={{ marginRight: 10 }} />
                ) : (
                  <Ionicons name="logo-google" size={20} color="#ea4335" />
                )}
                <Text style={styles.googleBtnText}>
                  {isGoogleLoading ? 'Cargando...' : 'Continuar con Google'}
                </Text>
              </TouchableOpacity>

              {/* SEPARADOR */}
              <View style={styles.separatorContainer}>
                <View style={styles.line} />
                <Text style={styles.separatorText}>O CONTINUAR CON CORREO</Text>
                <View style={styles.line} />
              </View>

              {/* INPUT EMAIL */}
              <View style={styles.inputGroup}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Correo Electrónico</Text>
                </View>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color={COLORS.textLight} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ingresa tu correo"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isLoading}
                  />
                </View>
              </View>

              {/* BOTÓN SIGUIENTE */}
              <TouchableOpacity 
                style={[styles.loginBtn, isLoading && { opacity: 0.7 }]}
                onPress={handleNextStep}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.loginBtnText}>Siguiente</Text>
                )}
              </TouchableOpacity>

              {/* FOOTER */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>¿No tienes una cuenta? </Text>
                <Pressable onPress={() => router.push('/auth/register')}>
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
    width: 34, // Mismo ancho que el botón de retroceso para centrar el título
  },
  logoRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 30,
    marginTop: 10,
  },
  logoIcon: { backgroundColor: COLORS.primary, padding: 8, borderRadius: 12, marginRight: 10 },
  logoText: { fontSize: 28, fontWeight: '800', color: COLORS.secondary },
  googleBtn: {
    flexDirection: 'row',
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  googleBtnText: { marginLeft: 10, fontWeight: '500', color: COLORS.textDark },
  separatorContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 25, width: '100%' },
  line: { flex: 1, height: 1, backgroundColor: COLORS.border },
  separatorText: { marginHorizontal: 10, fontSize: 11, color: COLORS.textLight, fontWeight: '600' },
  inputGroup: { width: '100%', marginBottom: 25 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  label: { fontWeight: '700', color: COLORS.textDark },
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