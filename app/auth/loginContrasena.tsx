import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
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
} from 'react-native';

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

  const handleLogin = () => {
    if (!email) {
      Alert.alert('Error', 'Correo electrónico no encontrado');
      router.push('/auth/login');
      return;
    }
    
    if (!password) {
      Alert.alert('Error', 'Por favor ingresa tu contraseña');
      return;
    }

    // Aquí va tu lógica de autenticación con email y contraseña
    console.log('Iniciando sesión con:', { email, password });
    
    // Por ahora solo navegamos
    router.push('/tabs');
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
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>
          </View>

{/* BOTÓN INICIAR SESIÓN */}
<TouchableOpacity 
  style={styles.loginBtn}
  onPress={() => router.push('/auth/verificarContrasena')}
>
  <Text style={styles.loginBtnText}>Iniciar Sesión</Text>
</TouchableOpacity>
         
          {/* FOOTER */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿No tienes una cuenta? </Text>
            <Pressable onPress={() => router.push('/')}>
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


