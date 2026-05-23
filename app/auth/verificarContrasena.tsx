// app/auth/verificarContrasena.tsx
import React, { useState, useRef, useEffect } from 'react';
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
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importamos el servicio de autenticación conectado con NestJS
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

export default function VerificationScreen() {
  const router = useRouter();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60); 
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [hasError, setHasError] = useState(false); 
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState('');
  const [mode, setMode] = useState<'register' | 'login'>('register');

  // Cargar los datos contextuales guardados en el paso anterior
  useEffect(() => {
    const getContextData = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('tempEmail');
        const savedUserId = await AsyncStorage.getItem('tempUserId');
        const savedMode = await AsyncStorage.getItem('authMode');

        if (savedEmail) setEmail(savedEmail);
        if (savedUserId) {
          console.log('📌 ID de usuario recuperado del Storage:', savedUserId);
          setUserId(savedUserId);
        }
        if (savedMode === 'login' || savedMode === 'register') {
          setMode(savedMode);
        }
      } catch (error) {
        console.log('Error cargando el contexto de autenticación:', error);
      }
    };
    getContextData();
  }, []);

  // Manejo del contador regresivo para el reenvío de OTP
  useEffect(() => {
    let interval: any;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer, canResend]);

  const handleCodeChange = (text: string, index: number) => {
    if (text && !/^\d*$/.test(text)) return;

    setHasError(false); 
    const newCode = [...code];
    newCode[index] = text.slice(0, 1); 
    setCode(newCode);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (text && index === 5) {
      Keyboard.dismiss();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      const errorMsg = 'Por favor ingresa el código de 6 dígitos';
      if (Platform.OS === 'web') alert(errorMsg);
      else Alert.alert('Error', errorMsg);
      return;
    }

    setIsVerifying(true);
    setHasError(false);
    Keyboard.dismiss(); 

    try {
      if (mode === 'register') {
        // --- FLUJO REGISTRO ---
        const payload = {
          email: email.trim().toLowerCase(),
          otp: verificationCode,
        };
        console.log('Enviando verificación de registro a NestJS:', payload);
        
        const response = await AuthService.registerVerify(payload);
        const successMsg = response.message || 'Usuario verificado correctamente';

        if (Platform.OS === 'web') {
          alert(successMsg);
          router.push('/auth/login');
        } else {
          Alert.alert('¡Éxito!', successMsg, [
            { text: 'Ir al Login', onPress: () => router.push('/auth/login') }
          ]);
        }

      } else {
        // --- FLUJO LOGIN (2FA / SECOND FACTOR) ---
        // 🛡️ BLINDAJE EXTRA: Si por problemas de asincronía el estado local está vacío, lo extraemos en caliente
        let finalUserId = userId;
        if (!finalUserId) {
          const directUserId = await AsyncStorage.getItem('tempUserId');
          console.log(directUserId)
          console.log(finalUserId)
          if (directUserId) {
            finalUserId = directUserId;
          } else {
            throw new Error('No se encontró el ID de usuario. Por favor regresa e inicia sesión nuevamente.');
          }
        }

        const payload = {
          code: verificationCode,
          userId: finalUserId,
          type: 'EMAIL' as const,
        };
        console.log('Enviando verificación de 2FA a NestJS:', payload);

        const response = await AuthService.verifySecondFactor(payload); 
        
        // Guardar tokens de la sesión exitosa devueltos por NestJS
        await AsyncStorage.setItem('access_token', response.access_token);
        if (response.refresh_token) {
          await AsyncStorage.setItem('refresh_token', response.refresh_token);
        }
        if (response.user) {
          await AsyncStorage.setItem('user_data', JSON.stringify(response.user));
        }

        // Limpiar los estados temporales de Auth de manera limpia
        await AsyncStorage.multiRemove(['tempEmail', 'tempUserId', 'authMode']);

        const successMsg = 'Sesión iniciada correctamente';
        
        if (Platform.OS === 'web') {
          alert(successMsg);
          router.push('/'); 
        } else {
          Alert.alert('¡Bienvenido!', successMsg, [
            { text: 'Continuar', onPress: () => router.push('/') }
          ]);
        }
      }

    } catch (error: any) {
      console.log(`ℹ️ Falló verificación de OTP (${mode}):`, error.message);
      setHasError(true);
      const errMsg = error.message || '';

      if (errMsg.includes('userId should not be empty') || errMsg.includes('must be a UUID')) {
        const textUuid = 'Ocurrió un problema de sincronización con las credenciales. Regresa al paso anterior e inténtalo de nuevo.';
        if (Platform.OS === 'web') alert(textUuid);
        else Alert.alert('Error de Sesión', textUuid);
      } else if (errMsg.includes('400') || errMsg.includes('401') || errMsg.includes('incorrecto') || errMsg.includes('expirado')) {
        const textInvalid = 'Código OTP incorrecto, ya utilizado o expirado.';
        if (Platform.OS === 'web') alert(textInvalid);
        else Alert.alert('Código Inválido', textInvalid);
      } else if (errMsg.includes('404')) {
        const text404 = 'No se encontró la información del usuario en el sistema.';
        if (Platform.OS === 'web') alert(text404);
        else Alert.alert('No Encontrado', text404);
      } else {
        const generalText = error.message || 'Error de validación o fallo de red interno. Inténtalo de nuevo.';
        if (Platform.OS === 'web') alert(generalText);
        else Alert.alert('Error', generalText);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend || isResending) return;
    
    setIsResending(true);
    try {
      const payload = {
        email: email.trim().toLowerCase(),
        method: 'email' as const
      };

      const response = await AuthService.generateOtp(payload);
      const msg = response.message || 'Código OTP enviado a su correo.';

      if (Platform.OS === 'web') alert(msg);
      else Alert.alert('Código Reenviado', msg);

      setTimer(60);
      setCanResend(false);
      setCode(['', '', '', '', '', '']);
      setHasError(false);
      inputRefs.current[0]?.focus();

    } catch (error: any) {
      console.log('Error reenviando OTP:', error.message);
      if (Platform.OS === 'web') alert('No se pudo reenviar el código. Inténtalo más tarde.');
      else Alert.alert('Error', 'No se pudo reenviar el código. Inténtalo más tarde.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.centerContent}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              {/* Botón volver */}
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
                disabled={isVerifying}
              >
                <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
              </TouchableOpacity>

              {/* Icono/Logo */}
              <View style={styles.iconContainer}>
                <View style={styles.iconCircle}>
                  <Ionicons name="mail-outline" size={40} color={COLORS.primary} />
                </View>
              </View>

              {/* Título adaptativo */}
              <Text style={styles.title}>
                {mode === 'login' ? 'Verificación de Seguridad' : 'Verificar Correo Electrónico'}
              </Text>
              
              {/* Descripción */}
              <Text style={styles.description}>
                Por favor ingresa el código de 6 dígitos enviado a tu correo para {mode === 'login' ? 'iniciar sesión' : 'completar tu registro'}.
              </Text>
              
              {/* Correo receptor */}
              <Text style={styles.email}>{email || 'cargando correo...'}</Text>

              {/* Inputs de código */}
              <View style={styles.codeContainer}>
                {code.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => { if (ref) inputRefs.current[index] = ref; }}
                    style={[
                      styles.codeInput, 
                      hasError && styles.codeInputError
                    ]}
                    value={digit}
                    onChangeText={(text) => handleCodeChange(text, index)}
                    onKeyPress={(e) => handleKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    textAlign="center"
                    selectTextOnFocus
                    editable={!isVerifying}
                  />
                ))}
              </View>

              {/* Botón Verificar */}
              <TouchableOpacity 
                style={[styles.verifyBtn, isVerifying && styles.verifyBtnDisabled]}
                onPress={handleVerify}
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.verifyBtnText}>Verificar</Text>
                )}
              </TouchableOpacity>

              {/* Reenviar código */}
              <View style={styles.resendContainer}>
                <Text style={styles.resendText}>¿No recibiste el código? </Text>
                {isResending ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : canResend ? (
                  <Pressable onPress={handleResendCode}>
                    <Text style={styles.resendLink}>Reenviar</Text>
                  </Pressable>
                ) : (
                  <Text style={styles.resendTimer}>
                    Reenviar en {timer}s
                  </Text>
                )}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centerContent: { flex: 1 },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
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
  backButton: { position: 'absolute', top: 20, left: 20, padding: 8 },
  iconContainer: { marginBottom: 24, marginTop: 20 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.textDark, textAlign: 'center', marginBottom: 12 },
  description: { fontSize: 14, color: COLORS.textLight, textAlign: 'center', marginBottom: 8 },
  email: { fontSize: 16, fontWeight: '600', color: COLORS.primary, textAlign: 'center', marginBottom: 32 },
  codeContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 32, gap: 8 },
  codeInput: { flex: 1, height: 55, borderWidth: 2, borderColor: COLORS.border, borderRadius: 12, fontSize: 22, fontWeight: '600', color: COLORS.textDark, backgroundColor: COLORS.white, textAlign: 'center' },
  codeInputError: { borderColor: COLORS.error, backgroundColor: '#FFF5F5' },
  verifyBtn: { backgroundColor: COLORS.primary, width: '100%', height: 55, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 24, elevation: 5 },
  verifyBtnDisabled: { opacity: 0.7 },
  verifyBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  resendContainer: { flexDirection: 'row', alignItems: 'center', height: 24 },
  resendText: { fontSize: 14, color: COLORS.textLight },
  resendLink: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  resendTimer: { fontSize: 14, color: COLORS.textLight, fontWeight: '500' },
});