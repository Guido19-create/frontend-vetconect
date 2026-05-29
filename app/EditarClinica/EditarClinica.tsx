import React, { useState } from 'react';
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
  Switch,
  Modal,
  FlatList,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';

interface FotoClinica {
  id: string;
  uri: string;
  tipo: 'logo' | 'instalacion' | 'equipo' | 'otro';
  descripcion: string;
}

interface Horario {
  dia: string;
  apertura: string;
  cierre: string;
  cerrado: boolean;
}

export default function EditarClinicaScreen() {
  const navigation = useNavigation();
  
  // Estados para la clínica
  const [logo, setLogo] = useState<string | null>(null);
  const [nombre, setNombre] = useState('VetClinic Centro');
  const [email, setEmail] = useState('contacto@vetclinic.com');
  const [telefono, setTelefono] = useState('+5354111685');
  const [direccion, setDireccion] = useState('Calle 123, La Habana, Cuba');
  const [descripcion, setDescripcion] = useState('Clínica veterinaria especializada en atención integral para tus mascotas.');
  const [sitioWeb, setSitioWeb] = useState('www.vetclinic.com');
  const [capacidad, setCapacidad] = useState('50');
  const [aniosExperiencia, setAniosExperiencia] = useState('5');
  const [isEditing, setIsEditing] = useState(false);
  
  // Fotos de la clínica
  const [fotosClinica, setFotosClinica] = useState<FotoClinica[]>([
    {
      id: '1',
      uri: 'https://via.placeholder.com/300x200?text=Recepción',
      tipo: 'instalacion',
      descripcion: 'Área de recepción'
    },
    {
      id: '2',
      uri: 'https://via.placeholder.com/300x200?text=Consultorio',
      tipo: 'instalacion',
      descripcion: 'Consultorio principal'
    }
  ]);
  
  // Horarios
  const [horarios, setHorarios] = useState<Horario[]>([
    { dia: 'Lunes', apertura: '09:00', cierre: '18:00', cerrado: false },
    { dia: 'Martes', apertura: '09:00', cierre: '18:00', cerrado: false },
    { dia: 'Miércoles', apertura: '09:00', cierre: '18:00', cerrado: false },
    { dia: 'Jueves', apertura: '09:00', cierre: '18:00', cerrado: false },
    { dia: 'Viernes', apertura: '09:00', cierre: '18:00', cerrado: false },
    { dia: 'Sábado', apertura: '10:00', cierre: '14:00', cerrado: false },
    { dia: 'Domingo', apertura: '00:00', cierre: '00:00', cerrado: true },
  ]);
  
  // Servicios ofrecidos
  const [servicios, setServicios] = useState<string[]>([
    'Consultas generales',
    'Vacunación',
    'Cirugías',
    'Hospitalización',
    'Laboratorio clínico',
    'Radiología',
    'Peluquería canina',
    'Urgencias 24h'
  ]);
  
  const [nuevoServicio, setNuevoServicio] = useState('');
  
  // Redes sociales
  const [redesSociales, setRedesSociales] = useState({
    facebook: 'https://facebook.com/vetclinic',
    instagram: 'https://instagram.com/vetclinic',
    twitter: 'https://twitter.com/vetclinic',
    whatsapp: '+5354111685'
  });
  
  // Modal para ver foto
  const [modalVisible, setModalVisible] = useState(false);
  const [fotoSeleccionada, setFotoSeleccionada] = useState<string | null>(null);
  
  // Modal para editar horario
  const [horarioModalVisible, setHorarioModalVisible] = useState(false);
  const [horarioEditando, setHorarioEditando] = useState<Horario | null>(null);

  const goBack = () => {
    navigation.goBack();
  };

  // Función para seleccionar logo
  const pickLogo = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos permisos para acceder a tus fotos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      if (result.assets[0].fileSize && result.assets[0].fileSize > 5 * 1024 * 1024) {
        Alert.alert('Error', 'La imagen debe ser menor a 5MB');
        return;
      }
      setLogo(result.assets[0].uri);
    }
  };

  // Función para agregar fotos de la clínica
  const agregarFotoClinica = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos permisos para acceder a tus fotos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const nuevaFoto: FotoClinica = {
        id: Date.now().toString(),
        uri: result.assets[0].uri,
        tipo: 'instalacion',
        descripcion: 'Nueva foto de la clínica'
      };
      setFotosClinica([...fotosClinica, nuevaFoto]);
    }
  };

  // Eliminar foto
  const eliminarFoto = (id: string) => {
    Alert.alert(
      'Eliminar foto',
      '¿Estás seguro de que quieres eliminar esta foto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => {
            setFotosClinica(fotosClinica.filter(foto => foto.id !== id));
          }
        }
      ]
    );
  };

  // Agregar servicio
  const agregarServicio = () => {
    if (nuevoServicio.trim()) {
      setServicios([...servicios, nuevoServicio.trim()]);
      setNuevoServicio('');
    }
  };

  // Eliminar servicio
  const eliminarServicio = (index: number) => {
    Alert.alert(
      'Eliminar servicio',
      '¿Estás seguro de que quieres eliminar este servicio?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: () => {
            const nuevosServicios = [...servicios];
            nuevosServicios.splice(index, 1);
            setServicios(nuevosServicios);
          }
        }
      ]
    );
  };

  // Actualizar horario
  const actualizarHorario = () => {
    if (horarioEditando) {
      const nuevosHorarios = horarios.map(h => 
        h.dia === horarioEditando.dia ? horarioEditando : h
      );
      setHorarios(nuevosHorarios);
      setHorarioModalVisible(false);
      setHorarioEditando(null);
    }
  };

  // Guardar cambios
  const guardarCambios = () => {
    Alert.alert(
      'Guardar Cambios',
      '¿Estás seguro de que deseas guardar los cambios de la clínica?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Guardar', 
          onPress: () => {
            setIsEditing(false);
            Alert.alert('Éxito', 'Clínica actualizada correctamente');
          }
        },
      ]
    );
  };

  const renderFotoItem = ({ item }: { item: FotoClinica }) => (
    <TouchableOpacity 
      style={styles.fotoItem}
      onPress={() => {
        setFotoSeleccionada(item.uri);
        setModalVisible(true);
      }}
      onLongPress={() => eliminarFoto(item.id)}
    >
      <Image source={{ uri: item.uri }} style={styles.fotoItemImage} />
      <Text style={styles.fotoItemDescripcion} numberOfLines={1}>
        {item.descripcion}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainContainer}>
      {/* Header con flecha */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Editar Clínica</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.container}>
        <StatusBar style="dark" />
        
        {/* Logo de la clínica */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Logo de la Clínica</Text>
          <View style={styles.photoContainer}>
            {logo ? (
              <Image source={{ uri: logo }} style={styles.logoImage} />
            ) : (
              <View style={styles.placeholderLogo}>
                <Text style={styles.placeholderText}>🏥</Text>
              </View>
            )}
            <TouchableOpacity style={styles.uploadButton} onPress={pickLogo}>
              <Text style={styles.uploadButtonText}>Subir Logo</Text>
            </TouchableOpacity>
            <Text style={styles.uploadHint}>JPEG, PNG (Máx 5MB)</Text>
          </View>
        </View>

        {/* Información básica */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Información Básica</Text>
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nombre de la Clínica *</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={nombre}
                  onChangeText={setNombre}
                  placeholder="Ej: VetClinic Centro"
                />
              ) : (
                <Text style={styles.textValue}>{nombre}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Correo Electrónico</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              ) : (
                <Text style={styles.textValue}>{email}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Teléfono</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={telefono}
                  onChangeText={setTelefono}
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.textValue}>{telefono}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Dirección</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={direccion}
                  onChangeText={setDireccion}
                  placeholder="Dirección completa"
                />
              ) : (
                <Text style={styles.textValue}>{direccion}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Descripción</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={descripcion}
                  onChangeText={setDescripcion}
                  placeholder="Describe tu clínica..."
                  multiline
                  numberOfLines={4}
                />
              ) : (
                <Text style={styles.textValue}>{descripcion}</Text>
              )}
            </View>

            <View style={styles.rowInput}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>Sitio Web</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={sitioWeb}
                    onChangeText={setSitioWeb}
                    placeholder="www.ejemplo.com"
                  />
                ) : (
                  <Text style={styles.textValue}>{sitioWeb}</Text>
                )}
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Años de Experiencia</Text>
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={aniosExperiencia}
                    onChangeText={setAniosExperiencia}
                    keyboardType="numeric"
                  />
                ) : (
                  <Text style={styles.textValue}>{aniosExperiencia}</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Fotos de la clínica */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fotos de la Clínica</Text>
          <View style={styles.card}>
            <FlatList
              data={fotosClinica}
              renderItem={renderFotoItem}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.fotosList}
            />
            {isEditing && (
              <TouchableOpacity style={styles.addPhotoButton} onPress={agregarFotoClinica}>
                <Text style={styles.addPhotoButtonText}>+ Agregar Foto</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.uploadHint}>Mantén presionada una foto para eliminarla</Text>
          </View>
        </View>

        {/* Horarios de atención */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Horarios de Atención</Text>
          <View style={styles.card}>
            {horarios.map((horario, index) => (
              <TouchableOpacity 
                key={index}
                style={styles.horarioItem}
                onPress={() => {
                  if (isEditing) {
                    setHorarioEditando(horario);
                    setHorarioModalVisible(true);
                  }
                }}
              >
                <Text style={styles.horarioDia}>{horario.dia}</Text>
                {horario.cerrado ? (
                  <Text style={styles.horarioCerrado}>Cerrado</Text>
                ) : (
                  <Text style={styles.horarioHoras}>
                    {horario.apertura} - {horario.cierre}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Servicios */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Servicios Ofrecidos</Text>
          <View style={styles.card}>
            <View style={styles.serviciosList}>
              {servicios.map((servicio, index) => (
                <View key={index} style={styles.servicioItem}>
                  <Text style={styles.servicioText}>✓ {servicio}</Text>
                  {isEditing && (
                    <TouchableOpacity onPress={() => eliminarServicio(index)}>
                      <Text style={styles.deleteServiceText}>🗑️</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
            {isEditing && (
              <View style={styles.addServiceContainer}>
                <TextInput
                  style={[styles.input, styles.addServiceInput]}
                  value={nuevoServicio}
                  onChangeText={setNuevoServicio}
                  placeholder="Nuevo servicio..."
                />
                <TouchableOpacity style={styles.addServiceButton} onPress={agregarServicio}>
                  <Text style={styles.addServiceButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Redes Sociales */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Redes Sociales</Text>
          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Facebook</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={redesSociales.facebook}
                  onChangeText={(text) => setRedesSociales({...redesSociales, facebook: text})}
                />
              ) : (
                <Text style={styles.textValue}>{redesSociales.facebook}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Instagram</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={redesSociales.instagram}
                  onChangeText={(text) => setRedesSociales({...redesSociales, instagram: text})}
                />
              ) : (
                <Text style={styles.textValue}>{redesSociales.instagram}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>WhatsApp</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={redesSociales.whatsapp}
                  onChangeText={(text) => setRedesSociales({...redesSociales, whatsapp: text})}
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.textValue}>{redesSociales.whatsapp}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Botones de acción */}
        <View style={styles.section}>
          <View style={styles.buttonContainer}>
            {!isEditing ? (
              <TouchableOpacity 
                style={styles.editButton} 
                onPress={() => setIsEditing(true)}
              >
                <Text style={styles.editButtonText}>Editar Clínica</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity 
                  style={styles.saveButton} 
                  onPress={guardarCambios}
                >
                  <Text style={styles.saveButtonText}>Guardar Cambios</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={() => setIsEditing(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Modal para ver foto */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            {fotoSeleccionada && (
              <Image source={{ uri: fotoSeleccionada }} style={styles.modalImage} />
            )}
          </View>
        </View>
      </Modal>

      {/* Modal para editar horario */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={horarioModalVisible}
        onRequestClose={() => setHorarioModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setHorarioModalVisible(false)}>
              <Text style={styles.modalBackArrow}>←</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Editar Horario</Text>
            <View style={{ width: 40 }} />
          </View>
          
          {horarioEditando && (
            <View style={styles.modalForm}>
              <Text style={styles.modalFormLabel}>Día</Text>
              <Text style={styles.modalFormValue}>{horarioEditando.dia}</Text>
              
              <View style={styles.switchContainer}>
                <Text style={styles.modalFormLabel}>Cerrado</Text>
                <Switch
                  value={horarioEditando.cerrado}
                  onValueChange={(value) => 
                    setHorarioEditando({...horarioEditando, cerrado: value})
                  }
                  trackColor={{ false: '#767577', true: '#52ab98' }}
                />
              </View>
              
              {!horarioEditando.cerrado && (
                <>
                  <Text style={styles.modalFormLabel}>Hora de Apertura</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={horarioEditando.apertura}
                    onChangeText={(text) => 
                      setHorarioEditando({...horarioEditando, apertura: text})
                    }
                    placeholder="09:00"
                  />
                  
                  <Text style={styles.modalFormLabel}>Hora de Cierre</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={horarioEditando.cierre}
                    onChangeText={(text) => 
                      setHorarioEditando({...horarioEditando, cierre: text})
                    }
                    placeholder="18:00"
                  />
                </>
              )}
              
              <TouchableOpacity style={styles.modalSaveButton} onPress={actualizarHorario}>
                <Text style={styles.modalSaveButtonText}>Guardar Horario</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  photoContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
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
  logoImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  placeholderLogo: {
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
    marginTop: 8,
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
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  textValue: {
    fontSize: 16,
    color: '#555',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  rowInput: {
    flexDirection: 'row',
  },
  fotosList: {
    paddingBottom: 10,
  },
  fotoItem: {
    marginRight: 12,
    alignItems: 'center',
  },
  fotoItemImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 5,
  },
  fotoItemDescripcion: {
    fontSize: 12,
    color: '#666',
    width: 150,
    textAlign: 'center',
  },
  addPhotoButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  addPhotoButtonText: {
    color: '#2b6777',
    fontSize: 14,
    fontWeight: '500',
  },
  horarioItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  horarioDia: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  horarioHoras: {
    fontSize: 14,
    color: '#666',
  },
  horarioCerrado: {
    fontSize: 14,
    color: '#f44336',
  },
  serviciosList: {
    marginBottom: 10,
  },
  servicioItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  servicioText: {
    fontSize: 14,
    color: '#333',
  },
  deleteServiceText: {
    fontSize: 18,
    padding: 5,
  },
  addServiceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  addServiceInput: {
    flex: 1,
    marginRight: 10,
  },
  addServiceButton: {
    backgroundColor: '#2b6777',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addServiceButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 30,
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
    backgroundColor: '#2b6777',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '70%',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2b6777',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  modalBackArrow: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalForm: {
    padding: 20,
  },
  modalFormLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  modalFormValue: {
    fontSize: 18,
    color: '#2b6777',
    marginBottom: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  modalSaveButton: {
    backgroundColor: '#2b6777',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  modalSaveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});