// VerificationResetScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
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
  error: '#ef4444',
  success: '#22c55e',
};

export default function VerificationResetScreen() {
  const router = useRouter();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const email = "nombre@ejemplo.com"; // Aquí vendría el email desde la pantalla anterior

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
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

    const newCode = [...code];
    newCode[index] = text.slice(0, 1);
    setCode(newCode);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      Alert.alert('Error', 'Por favor ingresa el código de 6 dígitos');
      return;
    }

    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);
      
      // Verificar código (ejemplo)
      if (verificationCode === '123456') {
        Alert.alert('Éxito', 'Código verificado correctamente');
        router.push('/auth/loginContrasena'); // Ir a pantalla para nueva contraseña
      } else {
        Alert.alert('Error', 'Código incorrecto. Por favor intenta nuevamente');
      }
    }, 1500);
  };

  const handleResendCode = () => {
    if (!canResend) return;
    
    Alert.alert('Código reenviado', `Se ha enviado un nuevo código a ${email}`);
    setTimer(60);
    setCanResend(false);
    setCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.centerContent}
      >
        <View style={styles.card}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
          </TouchableOpacity>

          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="mail-outline" size={40} color={COLORS.primary} />
            </View>
          </View>

          <Text style={styles.title}>Verificar Código</Text>
          
          <Text style={styles.description}>
            Ingresa el código de 6 dígitos que enviamos a tu correo
          </Text>
          
          <Text style={styles.email}>{email}</Text>

          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { if (ref) inputRefs.current[index] = ref; }}
                style={styles.codeInput}
                value={digit}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                textAlign="center"
                selectTextOnFocus
              />
            ))}
          </View>

          <TouchableOpacity 
            style={[styles.verifyBtn, isVerifying && styles.verifyBtnDisabled]}
            onPress={handleVerify}
            disabled={isVerifying}
          >
            {isVerifying ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.verifyBtnText}>Verificar Código</Text>
            )}
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>¿No recibiste el código? </Text>
            {canResend ? (
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
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
  backButton: { position: 'absolute', top: 20, left: 20, padding: 8, zIndex: 1 },
  iconContainer: { marginBottom: 24, marginTop: 20 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', color: COLORS.textDark, textAlign: 'center', marginBottom: 12 },
  description: { fontSize: 14, color: COLORS.textLight, textAlign: 'center', marginBottom: 8 },
  email: { fontSize: 16, fontWeight: '600', color: COLORS.primary, textAlign: 'center', marginBottom: 32 },
  codeContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 32, gap: 12 },
  codeInput: { flex: 1, height: 60, borderWidth: 2, borderColor: COLORS.border, borderRadius: 12, fontSize: 24, fontWeight: '600', color: COLORS.textDark, backgroundColor: COLORS.white, textAlign: 'center' },
  verifyBtn: { backgroundColor: COLORS.primary, width: '100%', height: 55, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  verifyBtnDisabled: { opacity: 0.7 },
  verifyBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  resendContainer: { flexDirection: 'row', alignItems: 'center' },
  resendText: { fontSize: 14, color: COLORS.textLight },
  resendLink: { fontSize: 14, color: COLORS.primary, fontWeight: '600' },
  resendTimer: { fontSize: 14, color: COLORS.textLight, fontWeight: '500' },
});