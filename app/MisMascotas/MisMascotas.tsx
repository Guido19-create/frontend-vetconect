import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Interface para las mascotas
interface Mascota {
  id: string;
  nombre: string;
  tipo: 'perro' | 'gato' | 'ave' | 'roedor' | 'reptil' | 'otro';
  raza: string;
  edad: number;
  peso: number;
  sexo: 'macho' | 'hembra';
  esterilizado: boolean;
  color: string;
  fechaNacimiento: string;
  foto?: string;
  historialClinico: HistorialEntry[];
  alergias: string[];
  enfermedadesCronicas: string[];
  veterinario: string;
  ultimaVisita: string;
}

interface HistorialEntry {
  id: string;
  fecha: string;
  tipo: 'consulta' | 'vacuna' | 'cirugia' | 'desparasitacion' | 'otro';
  descripcion: string;
  veterinario: string;
  diagnostico: string;
  tratamiento: string;
  notas: string;
}

export default function MascotasScreen() {
  const navigation = useNavigation();
  const [mascotas, setMascotas] = useState<Mascota[]>([]);
  const [selectedMascota, setSelectedMascota] = useState<Mascota | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalHistorialVisible, setModalHistorialVisible] = useState(false);
  const [nuevaMascota, setNuevaMascota] = useState<Partial<Mascota>>({
    nombre: '',
    tipo: 'perro',
    raza: '',
    edad: 0,
    peso: 0,
    sexo: 'macho',
    esterilizado: false,
    color: '',
    fechaNacimiento: '',
    alergias: [],
    enfermedadesCronicas: [],
    veterinario: '',
    ultimaVisita: '',
    historialClinico: [],
  });
  const [nuevoHistorial, setNuevoHistorial] = useState<Partial<HistorialEntry>>({
    tipo: 'consulta',
    descripcion: '',
    veterinario: '',
    diagnostico: '',
    tratamiento: '',
    notas: '',
  });

  // Cargar mascotas guardadas
  useEffect(() => {
    loadMascotas();
  }, []);

  const loadMascotas = async () => {
    try {
      const saved = await AsyncStorage.getItem('mascotas');
      if (saved) {
        setMascotas(JSON.parse(saved));
      } else {
        // Mascotas de ejemplo
        const exampleMascotas: Mascota[] = [
          {
            id: '1',
            nombre: 'Max',
            tipo: 'perro',
            raza: 'Labrador Retriever',
            edad: 3,
            peso: 28.5,
            sexo: 'macho',
            esterilizado: true,
            color: 'Dorado',
            fechaNacimiento: '2021-03-15',
            historialClinico: [
              {
                id: 'h1',
                fecha: '2024-01-15',
                tipo: 'vacuna',
                descripcion: 'Vacuna antirrábica',
                veterinario: 'Dra. María González',
                diagnostico: 'Paciente sano',
                tratamiento: 'Vacuna aplicada correctamente',
                notas: 'Próxima vacuna en 1 año',
              },
              {
                id: 'h2',
                fecha: '2024-02-10',
                tipo: 'consulta',
                descripcion: 'Revisión general',
                veterinario: 'Dr. Carlos Ruiz',
                diagnostico: 'Salud excelente',
                tratamiento: 'Continuar con dieta actual',
                notas: 'Peso ideal',
              },
            ],
            alergias: ['Ninguna conocida'],
            enfermedadesCronicas: [],
            veterinario: 'Dra. María González',
            ultimaVisita: '2024-02-10',
          },
          {
            id: '2',
            nombre: 'Luna',
            tipo: 'gato',
            raza: 'Siamés',
            edad: 2,
            peso: 4.2,
            sexo: 'hembra',
            esterilizado: true,
            color: 'Crema con puntas marrones',
            fechaNacimiento: '2022-07-22',
            historialClinico: [
              {
                id: 'h3',
                fecha: '2024-01-20',
                tipo: 'desparasitacion',
                descripcion: 'Desparasitación interna y externa',
                veterinario: 'Dra. Ana López',
                diagnostico: 'Sin parásitos visibles',
                tratamiento: 'Aplicación de antiparasitario',
                notas: 'Repetir en 3 meses',
              },
            ],
            alergias: ['Pollo'],
            enfermedadesCronicas: ['Sensibilidad estomacal'],
            veterinario: 'Dra. Ana López',
            ultimaVisita: '2024-01-20',
          },
        ];
        setMascotas(exampleMascotas);
        await AsyncStorage.setItem('mascotas', JSON.stringify(exampleMascotas));
      }
    } catch (error) {
      console.log('Error loading mascotas:', error);
    }
  };

  const saveMascotas = async (updatedMascotas: Mascota[]) => {
    try {
      await AsyncStorage.setItem('mascotas', JSON.stringify(updatedMascotas));
      setMascotas(updatedMascotas);
    } catch (error) {
      console.log('Error saving mascotas:', error);
    }
  };

  const agregarMascota = () => {
    if (!nuevaMascota.nombre || !nuevaMascota.raza || !nuevaMascota.edad) {
      Alert.alert('Error', 'Por favor completa los campos obligatorios');
      return;
    }

    const mascota: Mascota = {
      id: Date.now().toString(),
      nombre: nuevaMascota.nombre || '',
      tipo: nuevaMascota.tipo as any || 'perro',
      raza: nuevaMascota.raza || '',
      edad: nuevaMascota.edad || 0,
      peso: nuevaMascota.peso || 0,
      sexo: nuevaMascota.sexo as any || 'macho',
      esterilizado: nuevaMascota.esterilizado || false,
      color: nuevaMascota.color || '',
      fechaNacimiento: nuevaMascota.fechaNacimiento || new Date().toISOString().split('T')[0],
      historialClinico: [],
      alergias: [],
      enfermedadesCronicas: [],
      veterinario: nuevaMascota.veterinario || '',
      ultimaVisita: nuevaMascota.ultimaVisita || '',
    };

    const updatedMascotas = [...mascotas, mascota];
    saveMascotas(updatedMascotas);
    setModalVisible(false);
    setNuevaMascota({
      nombre: '',
      tipo: 'perro',
      raza: '',
      edad: 0,
      peso: 0,
      sexo: 'macho',
      esterilizado: false,
      color: '',
      fechaNacimiento: '',
      alergias: [],
      enfermedadesCronicas: [],
      veterinario: '',
      ultimaVisita: '',
      historialClinico: [],
    });
    Alert.alert('Éxito', 'Mascota agregada correctamente');
  };

  const agregarHistorial = () => {
    if (!selectedMascota) return;

    const entry: HistorialEntry = {
      id: Date.now().toString(),
      fecha: new Date().toISOString().split('T')[0],
      tipo: nuevoHistorial.tipo as any || 'consulta',
      descripcion: nuevoHistorial.descripcion || '',
      veterinario: nuevoHistorial.veterinario || '',
      diagnostico: nuevoHistorial.diagnostico || '',
      tratamiento: nuevoHistorial.tratamiento || '',
      notas: nuevoHistorial.notas || '',
    };

    const updatedMascotas = mascotas.map(m => 
      m.id === selectedMascota.id 
        ? { ...m, historialClinico: [...m.historialClinico, entry] }
        : m
    );
    
    saveMascotas(updatedMascotas);
    setSelectedMascota({ ...selectedMascota, historialClinico: [...selectedMascota.historialClinico, entry] });
    setModalHistorialVisible(false);
    setNuevoHistorial({
      tipo: 'consulta',
      descripcion: '',
      veterinario: '',
      diagnostico: '',
      tratamiento: '',
      notas: '',
    });
    Alert.alert('Éxito', 'Historial agregado correctamente');
  };

  const eliminarMascota = (id: string) => {
    Alert.alert(
      'Eliminar mascota',
      '¿Estás seguro de que quieres eliminar esta mascota? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            const updatedMascotas = mascotas.filter(m => m.id !== id);
            saveMascotas(updatedMascotas);
            if (selectedMascota?.id === id) setSelectedMascota(null);
            Alert.alert('Éxito', 'Mascota eliminada correctamente');
          },
        },
      ]
    );
  };

  const getTipoIcono = (tipo: string) => {
    const iconos = {
      perro: '🐕',
      gato: '🐈',
      ave: '🐦',
      roedor: '🐭',
      reptil: '🐍',
      otro: '🐾',
    };
    return iconos[tipo as keyof typeof iconos] || '🐾';
  };

  const getTipoTexto = (tipo: string) => {
    const textos = {
      perro: 'Perro',
      gato: 'Gato',
      ave: 'Ave',
      roedor: 'Roedor',
      reptil: 'Reptil',
      otro: 'Otro',
    };
    return textos[tipo as keyof typeof textos] || 'Otro';
  };

  const goBack = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.mainContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mis Mascotas</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        <StatusBar style="dark" />

        {mascotas.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🐾</Text>
            <Text style={styles.emptyText}>No tienes mascotas registradas</Text>
            <TouchableOpacity style={styles.addPetButton} onPress={() => setModalVisible(true)}>
              <Text style={styles.addPetButtonText}>+ Agregar Mascota</Text>
            </TouchableOpacity>
          </View>
        ) : (
          mascotas.map((mascota) => (
            <TouchableOpacity
              key={mascota.id}
              style={styles.mascotaCard}
              onPress={() => setSelectedMascota(mascota)}
            >
              <View style={styles.mascotaHeader}>
                <View style={styles.mascotaIconContainer}>
                  <Text style={styles.mascotaIcon}>{getTipoIcono(mascota.tipo)}</Text>
                </View>
                <View style={styles.mascotaInfo}>
                  <Text style={styles.mascotaNombre}>{mascota.nombre}</Text>
                  <Text style={styles.mascotaDetalle}>
                    {getTipoTexto(mascota.tipo)} • {mascota.raza} • {mascota.edad} años
                  </Text>
                </View>
                <TouchableOpacity onPress={() => eliminarMascota(mascota.id)}>
                  <Text style={styles.deleteIcon}>🗑️</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* Modal de detalles de mascota */}
        <Modal
          animationType="slide"
          transparent={false}
          visible={selectedMascota !== null}
          onRequestClose={() => setSelectedMascota(null)}
        >
          {selectedMascota && (
            <ScrollView style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setSelectedMascota(null)} style={styles.modalBackButton}>
                  <Text style={styles.modalBackArrow}>←</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>{selectedMascota.nombre}</Text>
                <View style={styles.modalPlaceholder} />
              </View>

              {/* Información general */}
              <View style={styles.infoSection}>
                <Text style={styles.infoSectionTitle}>Información General</Text>
                <View style={styles.infoGrid}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>🐕 Tipo</Text>
                    <Text style={styles.infoValue}>{getTipoTexto(selectedMascota.tipo)}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>🐾 Raza</Text>
                    <Text style={styles.infoValue}>{selectedMascota.raza}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>🎂 Edad</Text>
                    <Text style={styles.infoValue}>{selectedMascota.edad} años</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>⚖️ Peso</Text>
                    <Text style={styles.infoValue}>{selectedMascota.peso} kg</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>🚻 Sexo</Text>
                    <Text style={styles.infoValue}>
                      {selectedMascota.sexo === 'macho' ? 'Macho' : 'Hembra'}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>✂️ Esterilizado</Text>
                    <Text style={styles.infoValue}>
                      {selectedMascota.esterilizado ? 'Sí' : 'No'}
                    </Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>🎨 Color</Text>
                    <Text style={styles.infoValue}>{selectedMascota.color}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>📅 Nacimiento</Text>
                    <Text style={styles.infoValue}>{selectedMascota.fechaNacimiento}</Text>
                  </View>
                </View>
              </View>

              {/* Salud */}
              <View style={styles.infoSection}>
                <Text style={styles.infoSectionTitle}>Salud</Text>
                <View style={styles.healthItem}>
                  <Text style={styles.healthLabel}>🏥 Veterinario</Text>
                  <Text style={styles.healthValue}>{selectedMascota.veterinario || 'No registrado'}</Text>
                </View>
                <View style={styles.healthItem}>
                  <Text style={styles.healthLabel}>📅 Última visita</Text>
                  <Text style={styles.healthValue}>{selectedMascota.ultimaVisita || 'No registrada'}</Text>
                </View>
                <View style={styles.healthItem}>
                  <Text style={styles.healthLabel}>⚠️ Alergias</Text>
                  <Text style={styles.healthValue}>
                    {selectedMascota.alergias.length > 0 ? selectedMascota.alergias.join(', ') : 'Ninguna conocida'}
                  </Text>
                </View>
                <View style={styles.healthItem}>
                  <Text style={styles.healthLabel}>💊 Enfermedades crónicas</Text>
                  <Text style={styles.healthValue}>
                    {selectedMascota.enfermedadesCronicas.length > 0 
                      ? selectedMascota.enfermedadesCronicas.join(', ') 
                      : 'Ninguna'}
                  </Text>
                </View>
              </View>

              {/* Historial clínico */}
              <View style={styles.infoSection}>
                <View style={styles.historialHeader}>
                  <Text style={styles.infoSectionTitle}>Historial Clínico</Text>
                  <TouchableOpacity 
                    style={styles.addHistorialButton}
                    onPress={() => setModalHistorialVisible(true)}
                  >
                    <Text style={styles.addHistorialText}>+ Agregar</Text>
                  </TouchableOpacity>
                </View>
                {selectedMascota.historialClinico.length === 0 ? (
                  <Text style={styles.emptyHistorial}>No hay registros en el historial</Text>
                ) : (
                  selectedMascota.historialClinico.map((entry) => (
                    <View key={entry.id} style={styles.historialEntry}>
                      <View style={styles.historialEntryHeader}>
                        <Text style={styles.historialDate}>{entry.fecha}</Text>
                        <Text style={styles.historialType}>{entry.tipo}</Text>
                      </View>
                      <Text style={styles.historialDescription}>{entry.descripcion}</Text>
                      <Text style={styles.historialVet}>👨‍⚕️ {entry.veterinario}</Text>
                      {entry.diagnostico && (
                        <Text style={styles.historialDetail}>📋 Diagnóstico: {entry.diagnostico}</Text>
                      )}
                      {entry.tratamiento && (
                        <Text style={styles.historialDetail}>💊 Tratamiento: {entry.tratamiento}</Text>
                      )}
                      {entry.notas && (
                        <Text style={styles.historialNotes}>📝 Notas: {entry.notas}</Text>
                      )}
                    </View>
                  ))
                )}
              </View>
            </ScrollView>
          )}
        </Modal>

        {/* Modal de agregar mascota */}
        <Modal
          animationType="slide"
          transparent={false}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <ScrollView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalBackButton}>
                <Text style={styles.modalBackArrow}>←</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Agregar Mascota</Text>
              <View style={styles.modalPlaceholder} />
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.formLabel}>Nombre *</Text>
              <TextInput
                style={styles.formInput}
                value={nuevaMascota.nombre}
                onChangeText={(text) => setNuevaMascota({ ...nuevaMascota, nombre: text })}
                placeholder="Ej: Max, Luna, Simba"
              />

              <Text style={styles.formLabel}>Tipo *</Text>
              <View style={styles.tipoContainer}>
                {(['perro', 'gato', 'ave', 'roedor', 'reptil', 'otro'] as const).map((tipo) => (
                  <TouchableOpacity
                    key={tipo}
                    style={[
                      styles.tipoButton,
                      nuevaMascota.tipo === tipo && styles.tipoButtonActive,
                    ]}
                    onPress={() => setNuevaMascota({ ...nuevaMascota, tipo })}
                  >
                    <Text style={styles.tipoButtonText}>{getTipoIcono(tipo)}</Text>
                    <Text style={styles.tipoButtonLabel}>{getTipoTexto(tipo)}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>Raza *</Text>
              <TextInput
                style={styles.formInput}
                value={nuevaMascota.raza}
                onChangeText={(text) => setNuevaMascota({ ...nuevaMascota, raza: text })}
                placeholder="Ej: Labrador, Siamés, Canario"
              />

              <Text style={styles.formLabel}>Edad (años) *</Text>
              <TextInput
                style={styles.formInput}
                value={nuevaMascota.edad?.toString()}
                onChangeText={(text) => setNuevaMascota({ ...nuevaMascota, edad: parseInt(text) || 0 })}
                keyboardType="numeric"
                placeholder="0"
              />

              <Text style={styles.formLabel}>Peso (kg)</Text>
              <TextInput
                style={styles.formInput}
                value={nuevaMascota.peso?.toString()}
                onChangeText={(text) => setNuevaMascota({ ...nuevaMascota, peso: parseFloat(text) || 0 })}
                keyboardType="numeric"
                placeholder="0"
              />

              <Text style={styles.formLabel}>Sexo</Text>
              <View style={styles.sexoContainer}>
                <TouchableOpacity
                  style={[
                    styles.sexoButton,
                    nuevaMascota.sexo === 'macho' && styles.sexoButtonActive,
                  ]}
                  onPress={() => setNuevaMascota({ ...nuevaMascota, sexo: 'macho' })}
                >
                  <Text style={styles.sexoButtonText}>♂ Macho</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.sexoButton,
                    nuevaMascota.sexo === 'hembra' && styles.sexoButtonActive,
                  ]}
                  onPress={() => setNuevaMascota({ ...nuevaMascota, sexo: 'hembra' })}
                >
                  <Text style={styles.sexoButtonText}>♀ Hembra</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.formLabel}>Color</Text>
              <TextInput
                style={styles.formInput}
                value={nuevaMascota.color}
                onChangeText={(text) => setNuevaMascota({ ...nuevaMascota, color: text })}
                placeholder="Ej: Dorado, Negro, Blanco"
              />

              <Text style={styles.formLabel}>Fecha de nacimiento</Text>
              <TextInput
                style={styles.formInput}
                value={nuevaMascota.fechaNacimiento}
                onChangeText={(text) => setNuevaMascota({ ...nuevaMascota, fechaNacimiento: text })}
                placeholder="YYYY-MM-DD"
              />

              <Text style={styles.formLabel}>Veterinario</Text>
              <TextInput
                style={styles.formInput}
                value={nuevaMascota.veterinario}
                onChangeText={(text) => setNuevaMascota({ ...nuevaMascota, veterinario: text })}
                placeholder="Nombre del veterinario"
              />

              <TouchableOpacity style={styles.saveButton} onPress={agregarMascota}>
                <Text style={styles.saveButtonText}>Guardar Mascota</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Modal>

        {/* Modal de agregar historial */}
        <Modal
          animationType="slide"
          transparent={false}
          visible={modalHistorialVisible}
          onRequestClose={() => setModalHistorialVisible(false)}
        >
          <ScrollView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalHistorialVisible(false)} style={styles.modalBackButton}>
                <Text style={styles.modalBackArrow}>←</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Agregar Historial</Text>
              <View style={styles.modalPlaceholder} />
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.formLabel}>Tipo</Text>
              <View style={styles.tipoHistorialContainer}>
                {(['consulta', 'vacuna', 'cirugia', 'desparasitacion', 'otro'] as const).map((tipo) => (
                  <TouchableOpacity
                    key={tipo}
                    style={[
                      styles.tipoHistorialButton,
                      nuevoHistorial.tipo === tipo && styles.tipoHistorialButtonActive,
                    ]}
                    onPress={() => setNuevoHistorial({ ...nuevoHistorial, tipo })}
                  >
                    <Text style={styles.tipoHistorialText}>{tipo}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>Descripción</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={nuevoHistorial.descripcion}
                onChangeText={(text) => setNuevoHistorial({ ...nuevoHistorial, descripcion: text })}
                placeholder="Descripción del procedimiento"
                multiline
                numberOfLines={3}
              />

              <Text style={styles.formLabel}>Veterinario</Text>
              <TextInput
                style={styles.formInput}
                value={nuevoHistorial.veterinario}
                onChangeText={(text) => setNuevoHistorial({ ...nuevoHistorial, veterinario: text })}
                placeholder="Nombre del veterinario"
              />

              <Text style={styles.formLabel}>Diagnóstico</Text>
              <TextInput
                style={styles.formInput}
                value={nuevoHistorial.diagnostico}
                onChangeText={(text) => setNuevoHistorial({ ...nuevoHistorial, diagnostico: text })}
                placeholder="Diagnóstico"
              />

              <Text style={styles.formLabel}>Tratamiento</Text>
              <TextInput
                style={styles.formInput}
                value={nuevoHistorial.tratamiento}
                onChangeText={(text) => setNuevoHistorial({ ...nuevoHistorial, tratamiento: text })}
                placeholder="Tratamiento recetado"
              />

              <Text style={styles.formLabel}>Notas</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={nuevoHistorial.notas}
                onChangeText={(text) => setNuevoHistorial({ ...nuevoHistorial, notas: text })}
                placeholder="Notas adicionales"
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity style={styles.saveButton} onPress={agregarHistorial}>
                <Text style={styles.saveButtonText}>Agregar al Historial</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Modal>
      </ScrollView>
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
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2b6777',
  },
  container: {
    flex: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    marginHorizontal: 20,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  addPetButton: {
    backgroundColor: '#2b6777',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  addPetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mascotaCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 15,
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
  mascotaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mascotaIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  mascotaIcon: {
    fontSize: 32,
  },
  mascotaInfo: {
    flex: 1,
  },
  mascotaNombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  mascotaDetalle: {
    fontSize: 14,
    color: '#666',
  },
  deleteIcon: {
    fontSize: 22,
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  modalBackButton: {
    padding: 8,
    marginLeft: -8,
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
  modalPlaceholder: {
    width: 40,
  },
  infoSection: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 12,
    padding: 16,
  },
  infoSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2b6777',
    marginBottom: 15,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoItem: {
    width: '50%',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  healthItem: {
    marginBottom: 12,
  },
  healthLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  healthValue: {
    fontSize: 16,
    color: '#333',
  },
  historialHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addHistorialButton: {
    backgroundColor: '#2b6777',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addHistorialText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyHistorial: {
    textAlign: 'center',
    color: '#666',
    paddingVertical: 20,
  },
  historialEntry: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  historialEntryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  historialDate: {
    fontSize: 12,
    color: '#666',
  },
  historialType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2b6777',
    textTransform: 'capitalize',
  },
  historialDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  historialVet: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  historialDetail: {
    fontSize: 12,
    color: '#555',
    marginBottom: 2,
  },
  historialNotes: {
    fontSize: 12,
    color: '#777',
    fontStyle: 'italic',
    marginTop: 4,
  },
  formContainer: {
    padding: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  tipoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tipoButton: {
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
    marginRight: 10,
    marginBottom: 10,
    minWidth: 70,
  },
  tipoButtonActive: {
    backgroundColor: '#2b6777',
  },
  tipoButtonText: {
    fontSize: 24,
    marginBottom: 4,
  },
  tipoButtonLabel: {
    fontSize: 12,
    color: '#666',
  },
  sexoContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  sexoButton: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginRight: 10,
    alignItems: 'center',
  },
  sexoButtonActive: {
    backgroundColor: '#2b6777',
  },
  sexoButtonText: {
    fontSize: 16,
    color: '#333',
  },
  tipoHistorialContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tipoHistorialButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  tipoHistorialButtonActive: {
    backgroundColor: '#2b6777',
  },
  tipoHistorialText: {
    fontSize: 14,
    color: '#333',
    textTransform: 'capitalize',
  },
  saveButton: {
    backgroundColor: '#2b6777',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 50,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
