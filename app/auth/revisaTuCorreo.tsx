import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Revisa tu correo</Text>
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
  style={styles.backButton} 
  onPress={() => router.push('/auth/loginContrasena')}  // Cambiado de router.back() a router.push
>
  <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
  <Text style={styles.backButtonText}>Volver</Text>
</TouchableOpacity>
      </View>
    </SafeAreaView>
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
    padding: 40,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 5,
  },
  textContainer: {
    alignItems: 'flex-start',
    marginBottom: 40,
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
  },
});