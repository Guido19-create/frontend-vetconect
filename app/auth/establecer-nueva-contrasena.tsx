import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

export default function EstablecerNuevaContraseña() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const email = params.email || '';
  const [nuevaContraseña, setNuevaContraseña] = useState('');
  const [confirmarContraseña, setConfirmarContraseña] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Usando tu paleta de colores definida previamente
  const COLORS = {
  primary: '#2b6777',
  secondary: '#52ab98',
  background: '#f8fafc',
  white: '#ffffff',
  textDark: '#1e293b',
  textLight: '#64748b',
};

  const handleRestablecer = async () => {
    // Validaciones
    if (!nuevaContraseña || !confirmarContraseña) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (nuevaContraseña.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (nuevaContraseña !== confirmarContraseña) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Conectar con tu API para restablecer la contraseña
      // Ejemplo: await api.restablecerContraseña(email, nuevaContraseña);
      
      setTimeout(() => {
        setIsLoading(false);
        Alert.alert(
          'Éxito',
          'Tu contraseña ha sido restablecida correctamente',
          [
            {
              text: 'Iniciar Sesión',
              onPress: () => router.replace('/auth/loginContrasena')
            }
          ]
        );
      }, 1500);
      
    } catch (error) {
      setIsLoading(false);
      Alert.alert('Error', 'No se pudo restablecer la contraseña. Intenta de nuevo.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Título */}
      <Text style={styles.title}>Establecer nueva contraseña</Text>

      {/* Subtítulo */}
      <Text style={styles.subtitle}>
        Ingresa tu nueva contraseña a continuación.
      </Text>

      {/* Campo Nueva Contraseña */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nueva Contraseña</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ingresa tu nueva contraseña"
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            value={nuevaContraseña}
            onChangeText={setNuevaContraseña}
          />
          <TouchableOpacity 
            style={styles.eyeButton}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Text style={styles.eyeText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Campo Confirmar Contraseña */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirmar Contraseña</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.input}
            placeholder="Confirma tu nueva contraseña"
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            value={confirmarContraseña}
            onChangeText={setConfirmarContraseña}
          />
        </View>
      </View>

      {/* Botón Restablecer */}
      <TouchableOpacity 
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleRestablecer}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Restableciendo...' : 'Restablecer Contraseña'}
        </Text>
      </TouchableOpacity>

      {/* Enlace Volver */}
      <TouchableOpacity 
        style={styles.backLink}
        onPress={() => router.back()}
      >
        <Text style={styles.backLinkText}>Volver al inicio de sesión</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#F9F9F9',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  eyeText: {
    fontSize: 20,
  },
  button: {
    backgroundColor: '#2b6777',
    borderRadius: 27,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  buttonDisabled: {
    backgroundColor: '#99C4FF',
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backLink: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backLinkText: {
    color: '#007AFF',
    fontSize: 14,
    
  },
});