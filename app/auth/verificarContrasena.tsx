// VerificationScreen.tsx
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

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
  const [timer, setTimer] = useState(60); // 60 segundos para reenviar
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const email = "guidogarcia1512@gmail.com";

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
    // Solo permitir números
    if (text && !/^\d*$/.test(text)) return;

    const newCode = [...code];
    newCode[index] = text.slice(0, 1); // Solo un caracter
    setCode(newCode);

    // Auto-enfocar siguiente input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Si presiona backspace y el campo está vacío, ir al anterior
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

    // Simular verificación - Aquí iría tu lógica de API
    setTimeout(() => {
      setIsVerifying(false);
      
      // Verificar si el código es correcto (ejemplo: 54564? pero necesita 6 dígitos)
      // De la imagen muestra "5 4 5 6 4" pero faltaría un dígito
      if (verificationCode === '545645') {
        Alert.alert('Éxito', 'Código verificado correctamente');
        router.push('/tabs'); // Redirigir a la pantalla principal
      } else {
        Alert.alert('Error', 'Código incorrecto. Por favor intenta nuevamente');
      }
    }, 1500);
  };

  const handleResendCode = () => {
    if (!canResend) return;
    
    // Aquí iría la llamada a API para reenviar el código
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
          {/* Botón volver */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
          </TouchableOpacity>

          {/* Icono/Logo */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons name="mail-outline" size={40} color={COLORS.primary} />
            </View>
          </View>

          {/* Título */}
          <Text style={styles.title}>Verificar Correo Electrónico</Text>
          
          {/* Descripción */}
          <Text style={styles.description}>
            Por favor ingresa el código de 6 dígitos enviado a tu correo
          </Text>
          
         {/*revisar despues*/}
          <Text style={styles.email}>{email}</Text>

          {/* Inputs de código */}
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

          {/* Botón Verificar */}
          <TouchableOpacity 
            style={[styles.verifyBtn, isVerifying && styles.verifyBtnDisabled]}
            onPress={handleVerify}
            disabled={isVerifying}
          >
            <Text style={styles.verifyBtnText}>
              {isVerifying ? 'Verificando...' : 'Verificar'}
            </Text>
          </TouchableOpacity>

          {/* Reenviar código */}
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
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 32,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 32,
    gap: 12,
  },
  codeInput: {
    flex: 1,
    height: 60,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 12,
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.textDark,
    backgroundColor: COLORS.white,
    textAlign: 'center',
  },
  verifyBtn: {
    backgroundColor: COLORS.primary,
    width: '100%',
    height: 55,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  verifyBtnDisabled: {
    opacity: 0.7,
  },
  verifyBtnText: { 
    color: COLORS.white, 
    fontSize: 16, 
    fontWeight: '700' 
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  resendLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  resendTimer: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: '500',
  },
});