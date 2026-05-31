import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

// Importamos el servicio de integración y utilidades
import { UsersIntegrationService } from '@/services/users.service';
import { formatAvatarUrl } from '@/utils/funtionsUtils';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75; // Las tarjetas ocuparán el 75% del ancho de la pantalla

export default function MiCuentaApp() {
  const router = useRouter();

  // Estados de control de la UI
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false); 
  const [savingData, setSavingData] = useState(false);

  // Estados mapeados con las propiedades exactas de tu DTO de NestJS
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');

  // Estados para las clínicas del backend
  const [totalClinics, setTotalClinics] = useState(0);
  const [clinicsList, setClinicsList] = useState<any[]>([]);

  // Estado de respaldo para comparar si los valores cambiaron realmente antes de enviar
  const [originalPhone, setOriginalPhone] = useState('');

  // 🔄 Cargar datos desde NestJS al iniciar la pantalla
  useEffect(() => {
    const cargarPerfilUsuario = async () => {
      try {
        setLoading(true);
        const tokenJWT = await AsyncStorage.getItem('access_token');

        if (!tokenJWT) {
          const alertMsg = 'Sesión expirada o no válida. Inicia sesión nuevamente.';
          if (Platform.OS === 'web') alert(alertMsg);
          else Alert.alert('Acceso Denegado', alertMsg);
          
          router.push('/auth/login');
          return;
        }

        // Petición en paralelo del Perfil y de sus Clínicas asociadas
        const [dataProfile, dataClinics] = await Promise.all([
          UsersIntegrationService.getProfile(tokenJWT),
          UsersIntegrationService.getUserClinics(tokenJWT)
        ]);

        console.log('Datos del perfil:', dataProfile);
        console.log('Datos de clínicas:', dataClinics);

        // Mapeo del Perfil
        setName(dataProfile.name || dataProfile.username || '');
        setEmail(dataProfile.email || '');
        
        const backendPhone = dataProfile.phone || '';
        setPhone(backendPhone);
        setOriginalPhone(backendPhone);
        
        setCountry(dataProfile.location || dataProfile.country || '');
        
        const safeAvatarUrl = formatAvatarUrl(dataProfile.avatarURl || dataProfile.avatarUrl);
        setProfileImage(safeAvatarUrl);

        // Mapeo de Clínicas reales para el carrusel horizontal
        setTotalClinics(dataClinics.totalClinics || 0);
        setClinicsList(dataClinics.clinics || []);

      } catch (error: any) {
        const errorMsg = error.message || 'No se pudo sincronizar el perfil con NestJS.';
        if (Platform.OS === 'web') alert(errorMsg);
        else Alert.alert('Error de Servidor', errorMsg);
      } finally {
        setLoading(false);
      }
    };

    cargarPerfilUsuario();
  }, []);

  // 📸 Selección y subida inmediata del Avatar
  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos permisos para acceder a tus fotos');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        base64: false,
      });

      if (result.canceled) return;

      const selectedImageUri = result.assets[0].uri;
      
      if (result.assets[0].fileSize && result.assets[0].fileSize > 5 * 1024 * 1024) {
        Alert.alert('Error', 'La imagen debe ser menor a 5MB');
        return;
      }

      setUploadingPhoto(true);

      const tokenJWT = await AsyncStorage.getItem('access_token');
      if (!tokenJWT) {
        Alert.alert('Error', 'Tu sesión ha expirado.');
        router.push('/auth/login');
        return;
      }

      const response = await UsersIntegrationService.uploadAvatar(tokenJWT, selectedImageUri);
      const safeAvatarUrl = formatAvatarUrl(response.url);
      setProfileImage(safeAvatarUrl);

      if (Platform.OS === 'web') alert(response.message || 'Foto actualizada con éxito');
      else Alert.alert('Éxito', response.message || 'Foto actualizada con éxito');

    } catch (error: any) {
      console.error(error);
      const errorMsg = error.message || 'Ocurrió un problema al subir tu foto.';
      if (Platform.OS === 'web') alert(errorMsg);
      else Alert.alert('Error al subir', errorMsg);
    } finally {
      setUploadingPhoto(false);
    }
  };

  // 💾 Enviar cambios de campos de texto al endpoint de NestJS
  const saveChanges = async () => {
    try {
      setSavingData(true);
      const tokenJWT = await AsyncStorage.getItem('access_token');
      
      if (!tokenJWT) {
        Alert.alert('Sesión no válida', 'Debe iniciar sesión.');
        router.push('/auth/login');
        return;
      }

      const payload: any = {
        username: name,
        location: country,
      };

      if (phone.trim() !== originalPhone.trim()) {
        payload.phone = phone;
      }

      const response = await UsersIntegrationService.updateProfile(tokenJWT, payload);
      setIsEditing(false);

      if (response.status === 'pending_verification') {
        if (Platform.OS === 'web') alert(`Verificación Pendiente: ${response.message}`);
        else Alert.alert('Verificación Requerida', response.message);
      } else {
        setOriginalPhone(phone);
        if (Platform.OS === 'web') alert('Perfil actualizado correctamente en el servidor');
        else Alert.alert('Éxito', 'Perfil actualizado correctamente');
      }

    } catch (error: any) {
      console.error(error);
      const errorMsg = error.message || 'No se pudieron guardar los cambios en el servidor.';
      if (Platform.OS === 'web') alert(errorMsg);
      else Alert.alert('Error al guardar', errorMsg);
    } finally {
      setSavingData(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2b6777" />
        <Text style={styles.loadingText}>Sincronizando perfil con VetConect...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar style="dark" />
      
      {/* Sección - Foto */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Inicio</Text>
        <View style={styles.photoContainer}>
          {uploadingPhoto ? (
            <View style={styles.placeholderImage}>
              <ActivityIndicator size="large" color="#52ab98" />
            </View>
          ) : profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>📷</Text>
            </View>
          )}

          <TouchableOpacity 
            style={[styles.uploadButton, uploadingPhoto && { backgroundColor: '#a3b8bc' }]} 
            onPress={pickImage}
            disabled={uploadingPhoto}
          >
            <Text style={styles.uploadButtonText}>
              {uploadingPhoto ? 'Subiendo...' : 'Subir Foto'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.uploadHint}>JPEG, PNG (Máx 5MB)</Text>
        </View>
      </View>

      {/* 🔹 Sección - Mis Clínicas en Formato Horizontal deslizable 🔹 */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Mis Clínicas</Text>
          <Text style={styles.badgeTotal}>{totalClinics} activas</Text>
        </View>

        {clinicsList.length === 0 ? (
          <View style={[styles.card, { alignItems: 'center', padding: 20 }]}>
            <Text style={{ color: '#666', fontStyle: 'italic' }}>No estás asociado a ninguna clínica todavía.</Text>
          </View>
        ) : (
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContainer}
            decelerationRate="fast"
            snapToInterval={CARD_WIDTH + 16} // Ajuste para el frenado magnético por tarjeta
            snapToAlignment="start"
          >
            {clinicsList.map((item, index) => (
              <View key={item.clinicId || index} style={styles.clinicCard}>
                <View style={styles.clinicHeader}>
                  {item.logoURL ? (
                    <Image source={{ uri: formatAvatarUrl(item.logoURL) }} style={styles.clinicLogo} />
                  ) : (
                    <View style={styles.clinicLogoPlaceholder}>
                      <Text style={{ fontSize: 16 }}>🏥</Text>
                    </View>
                  )}
                  <View style={styles.clinicTitleContainer}>
                    <Text style={styles.clinicName} numberOfLines={1}>{item.name}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: item.isActiveInClinic ? '#e6f4ea' : '#fce8e6' }]}>
                      <Text style={[styles.statusBadgeText, { color: item.isActiveInClinic ? '#137333' : '#c5221f' }]}>
                        {item.isActiveInClinic ? 'Activa' : 'Inactiva'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.clinicDivider} />

                <View style={styles.clinicBody}>
                  <Text style={styles.roleLabel}>Tu Rol asignado:</Text>
                  <Text style={styles.roleValue}>{item.role}</Text>
                </View>

                <TouchableOpacity 
                  style={styles.clinicActionButton}
                  onPress={() => router.push(`/clinicas/${item.clinicId}`)}
                >
                  <Text style={styles.clinicActionText}>Ver Clínica</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Información Personal */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contacto</Text>
        <View style={styles.card}>
          <Text style={styles.subsectionTitle}>Información Personal</Text>
          <Text style={styles.infoText}>Gestiona tu información personal y configuración de seguridad</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Correo Electrónico (No editable)</Text>
            <Text style={[styles.textValue, { backgroundColor: '#e2e8f0', color: '#64748b' }]}>{email}</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nombre y Apellidos</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                editable={!savingData}
              />
            ) : (
              <Text style={styles.textValue}>{name || 'No especificado'}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Teléfono</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                editable={!savingData}
              />
            ) : (
              <Text style={styles.textValue}>{phone || 'No especificado'}</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>País / Ubicación</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={country}
                onChangeText={setCountry}
                editable={!savingData}
              />
            ) : (
              <Text style={styles.textValue}>{country || 'No especificado'}</Text>
            )}
          </View>
        </View>
      </View>

      {/* Botonera de Acción */}
      <View style={styles.section}>
        <View style={styles.buttonContainer}>
          {savingData ? (
            <View style={styles.saveButton}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          ) : !isEditing ? (
            <TouchableOpacity 
              style={styles.editButton} 
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.editButtonText}>Editar Información</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity 
                style={[styles.editButton, { flex: 1, backgroundColor: '#64748b' }]} 
                onPress={() => setIsEditing(false)}
              >
                <Text style={styles.editButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.saveButton, { flex: 2 }]} 
                onPress={saveChanges}
              >
                <Text style={styles.saveButtonText}>Guardar Cambios</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: '#2b6777',
    fontWeight: '500',
  },
  section: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 16,
    marginBottom: 15,
  },
  badgeTotal: {
    backgroundColor: '#e6f4ea',
    color: '#137333',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  photoContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  placeholderImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  placeholderText: {
    fontSize: 40,
  },
  uploadButton: {
    backgroundColor: '#2b6777',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadHint: {
    color: '#666',
    fontSize: 12,
  },
  
  // Estilos de las Cartas Horizontales de Clínicas
  horizontalScrollContainer: {
    paddingLeft: 16,
    paddingRight: 8,
    paddingBottom: 12,
  },
  clinicCard: {
    backgroundColor: '#fff',
    width: CARD_WIDTH,
    borderRadius: 14,
    padding: 16,
    marginRight: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 4 },
    }),
  },
  clinicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  clinicLogo: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  clinicLogoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clinicTitleContainer: {
    flex: 1,
  },
  clinicName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  clinicDivider: {
    height: 1,
    backgroundColor: '#eee',
    verticalAlign: 'middle',
    marginVertical: 12,
  },
  clinicBody: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  roleLabel: {
    fontSize: 13,
    color: '#666',
  },
  roleValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2b6777',
    backgroundColor: '#f0f7f4',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  clinicActionButton: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  clinicActionText: {
    color: '#52ab98',
    fontSize: 13,
    fontWeight: '600',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
      android: { elevation: 3 },
    }),
  },
  subsectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fafafa',
    color: '#333',
  },
  textValue: {
    fontSize: 16,
    color: '#555',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 30,
    marginHorizontal: 16,
  },
  editButton: {
    backgroundColor: '#2b6777',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#52ab98',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});