import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import React from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Usando tu paleta de colores definida previamente
const COLORS = {
  primary: '#2b6777',
  secondary: '#52ab98',
  background: '#f8fafc',
  white: '#ffffff',
  textDark: '#1e293b',
  textLight: '#64748b',
};

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  
  const handleAbrirEnlace = () => {
    router.push({
      pathname: '/auth/establecer-nueva-contrasena',
      params: { email }
    });
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: false 
        }} 
      />
      <SafeAreaView style={styles.container}>
        <View style={styles.card}>
          {/* Flecha de volver y título */}
          <View style={styles.headerRow}>
            <TouchableOpacity 
              onPress={() => router.push('/auth/loginContrasena')} 
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Revisa tu Correo</Text>
            <View style={styles.placeholderView} />
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>Revisa tu bandeja de entrada</Text>
            <Text style={styles.description}>
              Hemos enviado un enlace de recuperación a{' '}
              <Text style={styles.emailText}>{email || 'tu correo'}</Text>. 
              Haz clic en el enlace del correo para restablecer tu contraseña.
            </Text>
          </View>

          <View style={styles.iconWrapper}>
            <View style={styles.iconCircle}>
              <Ionicons name="mail-outline" size={45} color={COLORS.primary} />
            </View>
          </View>

          <TouchableOpacity 
            style={styles.backToLoginButton} 
            onPress={() => router.push('/auth/loginContrasena')}
          >
            <Ionicons name="log-in-outline" size={20} color={COLORS.primary} />
            <Text style={styles.backToLoginText}>Volver al inicio de sesión</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    width: '100%',
    maxWidth: 450,
    borderRadius: 16,
    padding: 30,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
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
  textContainer: {
    alignItems: 'flex-start',
    marginBottom: 40,
    marginTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 10,
  },
  description: {
    fontSize: 15,
    color: COLORS.textLight,
    lineHeight: 22,
  },
  emailText: {
    fontWeight: '600',
    color: COLORS.textDark,
  },
  iconWrapper: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backToLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  backToLoginText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
});