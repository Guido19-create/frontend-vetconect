import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
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


export default function RegisterScreen() {
  const router = useRouter();
  const [nombreApellidos, setNombreApellidos] = useState('');
  const [email, setEmail] = useState('');
  const [pais, setPais] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validación de requisitos de contraseña
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber;
  const doPasswordsMatch = password === confirmPassword && password !== '';

  const handleRegister = () => {
    if (!nombreApellidos.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu nombre y apellidos');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu correo electrónico');
      return;
    }
    if (!telefono.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu número de teléfono');
      return;
    }
    if (!isPasswordValid) {
      Alert.alert('Error', 'La contraseña no cumple con los requisitos');
      return;
    }
    if (!doPasswordsMatch) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    Alert.alert('Éxito', 'Cuenta creada correctamente');
    // Aquí iría la lógica de registro con tu backend
  };

  const handleGoogleSignUp = () => {
    Alert.alert('Google', 'Registro con Google (próximamente)');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* LOGO */}
          <View style={styles.logoRow}>
            <View style={styles.logoIcon}>
              <Ionicons name="paw" size={28} color={COLORS.white} />
            </View>
            <Text style={styles.logoText}>Vet<Text style={{ color: COLORS.textDark }}>Conect</Text></Text>
          </View>

          {/* Botón Continuar con Google */}
          <TouchableOpacity style={styles.googleButton} onPress={handleGoogleSignUp}>
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.googleButtonText}>Continuar con Google</Text>
          </TouchableOpacity>

          {/* Separador O CONTINUAR CON CORREO */}
          <View style={styles.separatorContainer}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>O CONTINUAR CON CORREO</Text>
            <View style={styles.separatorLine} />
          </View>

          {/* Formulario de registro */}
          <View style={styles.form}>
            {/* Nombre y Apellidos */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre y Apellidos</Text>
              <TextInput
                style={styles.input}
                placeholder="Guido"
                placeholderTextColor="#9CA3AF"
                value={nombreApellidos}
                onChangeText={setNombreApellidos}
              />
            </View>

            {/* Correo Electrónico */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <TextInput
                style={styles.input}
                placeholder="tu@email.com"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Teléfono (NUEVO CAMPO) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                style={styles.input}
                placeholder="+34 612 345 678"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={telefono}
                onChangeText={setTelefono}
              />
            </View>

            {/* País (opcional) */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>País (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Selecciona tu país"
                placeholderTextColor="#9CA3AF"
                value={pais}
                onChangeText={setPais}
              />
            </View>

            {/* Contraseña */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="●●●●●●●●"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Text style={styles.eyeIconText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirmar Contraseña */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar Contraseña</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Confirma tu contraseña"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <Text style={styles.eyeIconText}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Requisitos de contraseña */}
            <View style={styles.passwordRequirements}>
              <Text style={styles.requirementsTitle}>Requisitos de contraseña:</Text>
              <Text style={[styles.requirement, hasMinLength && styles.requirementMet]}>
                • La contraseña debe tener al menos 8 caracteres
              </Text>
              <Text style={[styles.requirement, hasUpperCase && styles.requirementMet]}>
                • La contraseña debe contener al menos una letra mayúscula
              </Text>
              <Text style={[styles.requirement, hasLowerCase && styles.requirementMet]}>
                • La contraseña debe contener al menos una letra minúscula
              </Text>
              <Text style={[styles.requirement, hasNumber && styles.requirementMet]}>
                • La contraseña debe contener al menos un número
              </Text>
            </View>

            {/* Botón de Registro */}
            <TouchableOpacity
              style={[
                styles.registerButton,
                (!isPasswordValid || !doPasswordsMatch || !nombreApellidos || !email || !telefono) &&
                  styles.registerButtonDisabled,
              ]}
              onPress={handleRegister}
              disabled={!isPasswordValid || !doPasswordsMatch || !nombreApellidos || !email || !telefono}
            >
              <Text style={styles.registerButtonText}>Registrarse</Text>
            </TouchableOpacity>

            {/* Link a login si ya tiene cuenta */}
            <View style={styles.loginRedirect}>
              <Text style={styles.loginText}>¿Ya tienes una cuenta? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/login')}>
                <Text style={styles.loginLink}>Inicia sesión aquí</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fdfdfd',
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 40,
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  logoIcon: { backgroundColor: COLORS.primary, padding: 8, borderRadius: 12, marginRight: 10 },
  logoText: { fontSize: 28, fontWeight: '800', color: COLORS.secondary },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4285F4',
    marginRight: 12,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D1D5DB',
  },
  separatorText: {
    marginHorizontal: 12,
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  passwordInput: {
    flex: 1,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    padding: 4,
  },
  eyeIconText: {
    fontSize: 20,
  },
  passwordRequirements: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    marginBottom: 24,
    borderLeftWidth: 3,
    borderLeftColor: '#2C6E49',
  },
  requirementsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  requirement: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    lineHeight: 18,
  },
  requirementMet: {
    color: '#2C6E49',
    fontWeight: '500',
  },
  registerButton: {
    backgroundColor: '#2b6777',
    paddingVertical: 16,
    borderRadius: 27,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#2b6777',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  registerButtonDisabled: {
    backgroundColor: '#2b6777',
    shadowOpacity: 0,
    elevation: 0,
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  loginRedirect: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  loginText: {
    fontSize: 14,
    color: '#4B5563',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C6E49',
  },
});

