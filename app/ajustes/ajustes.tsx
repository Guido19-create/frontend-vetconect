import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  Appearance,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const navigation = useNavigation();
  
  // Estados para los ajustes
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  // Cargar preferencias guardadas
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      const savedNotifications = await AsyncStorage.getItem('notifications');
      const savedPush = await AsyncStorage.getItem('pushNotifications');
      const savedEmail = await AsyncStorage.getItem('emailNotifications');
      const savedSound = await AsyncStorage.getItem('soundEnabled');
      const savedVibration = await AsyncStorage.getItem('vibrationEnabled');

      if (savedTheme !== null) {
        const isDark = savedTheme === 'dark';
        setIsDarkMode(isDark);
        Appearance.setColorScheme(isDark ? 'dark' : 'light');
      }
      if (savedNotifications !== null) setNotificationsEnabled(JSON.parse(savedNotifications));
      if (savedPush !== null) setPushNotifications(JSON.parse(savedPush));
      if (savedEmail !== null) setEmailNotifications(JSON.parse(savedEmail));
      if (savedSound !== null) setSoundEnabled(JSON.parse(savedSound));
      if (savedVibration !== null) setVibrationEnabled(JSON.parse(savedVibration));
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  // Función para cambiar tema
  const toggleDarkMode = async (value: boolean) => {
    setIsDarkMode(value);
    Appearance.setColorScheme(value ? 'dark' : 'light');
    await AsyncStorage.setItem('theme', value ? 'dark' : 'light');
    
    // Feedback visual
    Alert.alert(
      'Tema cambiado',
      value ? 'Modo oscuro activado' : 'Modo claro activado',
      [{ text: 'OK' }]
    );
  };

  // Función para cambiar notificaciones principales
  const toggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    await AsyncStorage.setItem('notifications', JSON.stringify(value));
    
    if (!value) {
      // Si desactiva notificaciones principales, desactivar las específicas
      setPushNotifications(false);
      setEmailNotifications(false);
      await AsyncStorage.setItem('pushNotifications', JSON.stringify(false));
      await AsyncStorage.setItem('emailNotifications', JSON.stringify(false));
    }
  };

  // Función para cambiar notificaciones push
  const togglePushNotifications = async (value: boolean) => {
    if (!notificationsEnabled && value) {
      Alert.alert(
        'Habilitar notificaciones',
        'Primero debe activar las notificaciones principales',
        [{ text: 'OK' }]
      );
      return;
    }
    setPushNotifications(value);
    await AsyncStorage.setItem('pushNotifications', JSON.stringify(value));
  };

  // Función para cambiar notificaciones por email
  const toggleEmailNotifications = async (value: boolean) => {
    if (!notificationsEnabled && value) {
      Alert.alert(
        'Habilitar notificaciones',
        'Primero debe activar las notificaciones principales',
        [{ text: 'OK' }]
      );
      return;
    }
    setEmailNotifications(value);
    await AsyncStorage.setItem('emailNotifications', JSON.stringify(value));
  };

  // Función para cambiar sonido
  const toggleSound = async (value: boolean) => {
    setSoundEnabled(value);
    await AsyncStorage.setItem('soundEnabled', JSON.stringify(value));
  };

  // Función para cambiar vibración
  const toggleVibration = async (value: boolean) => {
    setVibrationEnabled(value);
    await AsyncStorage.setItem('vibrationEnabled', JSON.stringify(value));
  };

  // Función para volver atrás
  const goBack = () => {
    navigation.goBack();
  };

  // Función para resetear ajustes
  const resetSettings = () => {
    Alert.alert(
      'Resetear ajustes',
      '¿Estás seguro de que quieres restaurar todos los ajustes a sus valores predeterminados?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Resetear', 
          style: 'destructive',
          onPress: async () => {
            setIsDarkMode(false);
            setNotificationsEnabled(true);
            setPushNotifications(true);
            setEmailNotifications(false);
            setSoundEnabled(true);
            setVibrationEnabled(true);
            
            Appearance.setColorScheme('light');
            
            await AsyncStorage.setItem('theme', 'light');
            await AsyncStorage.setItem('notifications', JSON.stringify(true));
            await AsyncStorage.setItem('pushNotifications', JSON.stringify(true));
            await AsyncStorage.setItem('emailNotifications', JSON.stringify(false));
            await AsyncStorage.setItem('soundEnabled', JSON.stringify(true));
            await AsyncStorage.setItem('vibrationEnabled', JSON.stringify(true));
            
            Alert.alert('Éxito', 'Ajustes restaurados correctamente');
          }
        },
      ]
    );
  };

  return (
    <View style={[styles.mainContainer, isDarkMode && styles.darkMainContainer]}>
      {/* Header con flecha */}
      <View style={[styles.header, isDarkMode && styles.darkHeader]}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={[styles.backArrow, isDarkMode && styles.darkText]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>Ajustes</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.container}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        
        {/* Sección de Apariencia */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkSectionTitle]}>Apariencia</Text>
          <View style={[styles.card, isDarkMode && styles.darkCard]}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>Modo Oscuro</Text>
                <Text style={[styles.settingDescription, isDarkMode && styles.darkDescription]}>
                  Cambiar entre tema claro y oscuro
                </Text>
              </View>
              <Switch
                value={isDarkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: '#767577', true: '#52ab98' }}
                thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        {/* Sección de Notificaciones */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkSectionTitle]}>Notificaciones</Text>
          <View style={[styles.card, isDarkMode && styles.darkCard]}>
            
            {/* Notificaciones principales */}
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>Notificaciones</Text>
                <Text style={[styles.settingDescription, isDarkMode && styles.darkDescription]}>
                  Activar o desactivar todas las notificaciones
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: '#767577', true: '#52ab98' }}
                thumbColor={notificationsEnabled ? '#fff' : '#f4f3f4'}
              />
            </View>

            <View style={[styles.divider, isDarkMode && styles.darkDivider]} />

            {/* Notificaciones Push */}
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>Notificaciones Push</Text>
                <Text style={[styles.settingDescription, isDarkMode && styles.darkDescription]}>
                  Recibir alertas en tiempo real
                </Text>
              </View>
              <Switch
                value={pushNotifications}
                onValueChange={togglePushNotifications}
                trackColor={{ false: '#767577', true: '#52ab98' }}
                thumbColor={pushNotifications ? '#fff' : '#f4f3f4'}
                disabled={!notificationsEnabled}
              />
            </View>

            <View style={[styles.divider, isDarkMode && styles.darkDivider]} />

            {/* Notificaciones por Email */}
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>Notificaciones por Email</Text>
                <Text style={[styles.settingDescription, isDarkMode && styles.darkDescription]}>
                  Recibir actualizaciones por correo electrónico
                </Text>
              </View>
              <Switch
                value={emailNotifications}
                onValueChange={toggleEmailNotifications}
                trackColor={{ false: '#767577', true: '#52ab98' }}
                thumbColor={emailNotifications ? '#fff' : '#f4f3f4'}
                disabled={!notificationsEnabled}
              />
            </View>
          </View>
        </View>

        {/* Sección de Preferencias */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkSectionTitle]}>Preferencias</Text>
          <View style={[styles.card, isDarkMode && styles.darkCard]}>
            
            {/* Sonido */}
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>Sonido</Text>
                <Text style={[styles.settingDescription, isDarkMode && styles.darkDescription]}>
                  Reproducir sonido al recibir notificaciones
                </Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={toggleSound}
                trackColor={{ false: '#767577', true: '#52ab98' }}
                thumbColor={soundEnabled ? '#fff' : '#f4f3f4'}
                disabled={!notificationsEnabled}
              />
            </View>

            <View style={[styles.divider, isDarkMode && styles.darkDivider]} />

            {/* Vibración */}
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, isDarkMode && styles.darkText]}>Vibración</Text>
                <Text style={[styles.settingDescription, isDarkMode && styles.darkDescription]}>
                  Vibrar al recibir notificaciones
                </Text>
              </View>
              <Switch
                value={vibrationEnabled}
                onValueChange={toggleVibration}
                trackColor={{ false: '#767577', true: '#52ab98' }}
                thumbColor={vibrationEnabled ? '#fff' : '#f4f3f4'}
                disabled={!notificationsEnabled}
              />
            </View>
          </View>
        </View>

        {/* Sección de Información */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkSectionTitle]}>Información</Text>
          <View style={[styles.card, isDarkMode && styles.darkCard]}>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, isDarkMode && styles.darkText]}>Versión</Text>
              <Text style={[styles.infoValue, isDarkMode && styles.darkDescription]}>1.0.0</Text>
            </View>
            <View style={[styles.divider, isDarkMode && styles.darkDivider]} />
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, isDarkMode && styles.darkText]}>Idioma</Text>
              <Text style={[styles.infoValue, isDarkMode && styles.darkDescription]}>Español</Text>
            </View>
          </View>
        </View>

        {/* Botón de Reset */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.resetButton} onPress={resetSettings}>
            <Text style={styles.resetButtonText}>Restaurar Ajustes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  darkMainContainer: {
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2b6777',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  darkHeader: {
    backgroundColor: '#1a3a40',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backArrow: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerPlaceholder: {
    width: 40,
  },
  container: {
    flex: 1,
  },
  section: {
    marginTop: 20,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  darkSectionTitle: {
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  darkCard: {
    backgroundColor: '#2d2d2d',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
  },
  darkText: {
    color: '#fff',
  },
  darkDescription: {
    color: '#aaa',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
  },
  darkDivider: {
    backgroundColor: '#444',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: '#333',
  },
  infoValue: {
    fontSize: 16,
    color: '#666',
  },
  resetButton: {
    backgroundColor: '#ff6b6b',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});