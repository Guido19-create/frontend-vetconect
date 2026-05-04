import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri, useAuthRequest } from 'expo-auth-session';
import React, { useEffect, useState } from 'react';
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
} from 'react-native';

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

// Configuración de Google OAuth - REEMPLAZA CON TU CLIENT ID REAL
const GOOGLE_CLIENT_ID = 'TU_CLIENT_ID_AQUI.apps.googleusercontent.com';
const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: GOOGLE_CLIENT_ID,
      scopes: ['profile', 'email'],
      redirectUri: makeRedirectUri({
        scheme: 'vetconect',
      }),
    },
    discovery
  );

  useEffect(() => {
    if (response?.type === 'success') {
      const { access_token } = response.params;
      handleGoogleUserInfo(access_token);
    } else if (response?.type === 'error') {
      Alert.alert('Error', 'No se pudo autenticar con Google');
      setIsGoogleLoading(false);
    }
  }, [response]);

  const handleGoogleUserInfo = async (accessToken: string) => {
    try {
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const userInfo = await userInfoResponse.json();
      
      await AsyncStorage.setItem('userData', JSON.stringify({
        name: userInfo.name,
        email: userInfo.email,
        photo: userInfo.picture,
        accessToken: accessToken,
      }));
      
      console.log('✅ Usuario autenticado:', userInfo.email);
      Alert.alert('¡Bienvenido!', `Hola ${userInfo.name}`, [
        {
          text: 'Continuar',
          onPress: () => router.push('/tabs'),
        }
      ]);
    } catch (error) {
      console.error('Error obteniendo info del usuario:', error);
      Alert.alert('Error', 'No se pudo obtener la información del usuario');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await promptAsync();
    } catch (error) {
      console.error('Error Google Sign-In:', error);
      Alert.alert('Error', 'No se pudo iniciar sesión con Google');
      setIsGoogleLoading(false);
    }
  };

  const handleNextStep = () => {
    if (!email) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
      return;
    }
    AsyncStorage.setItem('tempEmail', email);
    router.push('/auth/loginContrasena');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.centerContent}
      >
        <View style={styles.card}>
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
            disabled={isGoogleLoading}
          >
            <Ionicons name="logo-google" size={20} color="#ea4335" />
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
              />
            </View>
          </View>

          {/* BOTÓN SIGUIENTE */}
<TouchableOpacity 
  style={styles.loginBtn}
  onPress={() => router.push('/auth/loginContrasena')}
>
  <Text style={styles.loginBtnText}>Siguiente</Text>
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
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
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