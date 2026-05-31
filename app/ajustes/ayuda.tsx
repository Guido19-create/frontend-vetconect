import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Platform,
  Modal,
  TextInput,
  Share,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';

export default function HelpScreen() {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<FaqItem | null>(null);
  const [soporteMensaje, setSoporteMensaje] = useState('');
  const [soporteEmail, setSoporteEmail] = useState('');
  const [soporteAsunto, setSoporteAsunto] = useState('');

  interface FaqItem {
    id: string;
    pregunta: string;
    respuesta: string;
    categoria: string;
  }

  const faqs: FaqItem[] = [
    {
      id: '1',
      categoria: 'Cuenta',
      pregunta: '¿Cómo creo una cuenta?',
      respuesta: 'Para crear una cuenta, ve a la pantalla de inicio y haz clic en "Registrarse". Completa tus datos personales (nombre, email, teléfono) y confirma tu correo electrónico. ¡En menos de 2 minutos tendrás tu cuenta lista!',
    },
    {
      id: '2',
      categoria: 'Cuenta',
      pregunta: '¿Cómo recupero mi contraseña?',
      respuesta: 'En la pantalla de inicio de sesión, haz clic en "¿Olvidaste tu contraseña?". Ingresa tu correo electrónico y te enviaremos un enlace para restablecerla. Revisa también tu carpeta de spam si no lo encuentras.',
    },
    {
      id: '3',
      categoria: 'Clínicas',
      pregunta: '¿Cómo creo una clínica?',
      respuesta: 'Desde el menú principal, selecciona "Mis Clínicas" y luego el botón "+ Crear Clínica". Completa la información básica (nombre, dirección, horarios) y podrás comenzar a gestionar tu clínica inmediatamente.',
    },
    {
      id: '4',
      categoria: 'Clínicas',
      pregunta: '¿Puedo unirme a varias clínicas?',
      respuesta: '¡Sí! Puedes unirte a todas las clínicas que desees. Solo necesitas recibir una invitación o solicitar unirte desde la sección "Explorar Clínicas". Cada clínica tendrá su propio espacio.',
    },
    {
      id: '5',
      categoria: 'Mascotas',
      pregunta: '¿Cuántas mascotas puedo registrar?',
      respuesta: 'No hay límite de mascotas. Puedes registrar todas las que tengas y llevar un control completo de su historial clínico, vacunas, consultas y más.',
    },
    {
      id: '6',
      categoria: 'Mascotas',
      pregunta: '¿Puedo compartir el historial de mi mascota?',
      respuesta: 'Sí, desde la ficha de tu mascota puedes generar un reporte PDF o compartir el acceso con tu veterinario para que tenga toda la información necesaria.',
    },
    {
      id: '7',
      categoria: 'Notificaciones',
      pregunta: '¿Por qué no recibo notificaciones?',
      respuesta: 'Verifica que hayas activado las notificaciones en Ajustes > Notificaciones. También revisa los permisos de la app en la configuración de tu dispositivo.',
    },
    {
      id: '8',
      categoria: 'Pagos',
      pregunta: '¿Es gratis la plataforma?',
      respuesta: 'Sí, nuestra plataforma es completamente gratuita para clínicas y usuarios. No cobramos comisiones ni tarifas ocultas. Si en futuro implementamos planes premium, te avisaremos con anticipación.',
    },
    {
      id: '9',
      categoria: 'Seguridad',
      pregunta: '¿Mis datos están seguros?',
      respuesta: 'Absolutamente. Utilizamos encriptación de extremo a extremo, servidores seguros y cumplimos con las normativas de protección de datos. Nunca compartimos tu información con terceros sin tu consentimiento.',
    },
    {
      id: '10',
      categoria: 'Soporte',
      pregunta: '¿Cómo contacto con soporte?',
      respuesta: 'Puedes contactarnos a través del formulario en esta misma página, enviando un email a soporte@vetclinic.com o llamando al +1 (555) 123-4567. Estamos disponibles 24/7.',
    },
  ];

  const categorias = ['Todos', ...new Set(faqs.map(faq => faq.categoria))];
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');

  const faqsFiltrados = categoriaSeleccionada === 'Todos' 
    ? faqs 
    : faqs.filter(faq => faq.categoria === categoriaSeleccionada);

  const goBack = () => {
    navigation.goBack();
  };

  const handleEmailSupport = () => {
    Linking.openURL('mailto:guidogarciafernandez2@gmail.com?subject=Soporte%20VetClinic');
  };

  const handleCallSupport = () => {
    Linking.openURL('tel:+5358324187');
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/+5358324187?text=Hola,%20necesito%20ayuda%20con%20la%20aplicación');
  };

  const handleOpenURL = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'No se pudo abrir el enlace');
    });
  };

  const handleShareApp = async () => {
    try {
      await Share.share({
        message: '¡Descubre VetClinic! La mejor plataforma para gestionar clínicas veterinarias y cuidar de tus mascotas. https://vetclinic.com/download',
        title: 'Compartir VetClinic',
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo compartir la aplicación');
    }
  };

  const enviarSoporte = () => {
    if (!soporteMensaje.trim()) {
      Alert.alert('Error', 'Por favor escribe tu mensaje');
      return;
    }

    Alert.alert(
      'Mensaje enviado',
      `Gracias por contactarnos. Te responderemos a ${soporteEmail || 'tu correo'} en menos de 24 horas.`,
      [
        {
          text: 'OK',
          onPress: () => {
            setModalVisible(false);
            setSoporteMensaje('');
            setSoporteEmail('');
            setSoporteAsunto('');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.mainContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ayuda y Soporte</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView style={styles.container}>
        <StatusBar style="dark" />

        {/* Banner de bienvenida */}
        <View style={styles.welcomeBanner}>
          <Text style={styles.welcomeEmoji}>🐾</Text>
          <Text style={styles.welcomeTitle}>¿Necesitas ayuda?</Text>
          <Text style={styles.welcomeText}>
            Estamos aquí para ayudarte. Encuentra respuestas rápidas o contacta con nuestro equipo.
          </Text>
        </View>

        {/* Contacto rápido */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contacto Rápido</Text>
          <View style={styles.contactGrid}>
            <TouchableOpacity style={styles.contactCard} onPress={handleCallSupport}>
              <Text style={styles.contactIcon}>📞</Text>
              <Text style={styles.contactLabel}>Llamar</Text>
              <Text style={styles.contactValue}>24/7</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactCard} onPress={handleWhatsApp}>
              <Text style={styles.contactIcon}>💬</Text>
              <Text style={styles.contactLabel}>WhatsApp</Text>
              <Text style={styles.contactValue}>Respuesta rápida</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactCard} onPress={handleEmailSupport}>
              <Text style={styles.contactIcon}>✉️</Text>
              <Text style={styles.contactLabel}>Email</Text>
              <Text style={styles.contactValue}>guidogarciafernandez2@gmail.com</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactCard} onPress={() => setModalVisible(true)}>
              <Text style={styles.contactIcon}>📝</Text>
              <Text style={styles.contactLabel}>Formulario</Text>
              <Text style={styles.contactValue}>Envíanos tu consulta</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preguntas Frecuentes</Text>
          
          {/* Categorías */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
            {categorias.map((categoria) => (
              <TouchableOpacity
                key={categoria}
                style={[
                  styles.categoryChip,
                  categoriaSeleccionada === categoria && styles.categoryChipActive,
                ]}
                onPress={() => setCategoriaSeleccionada(categoria)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    categoriaSeleccionada === categoria && styles.categoryChipTextActive,
                  ]}
                >
                  {categoria}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Lista de FAQs */}
          {faqsFiltrados.map((faq) => (
            <TouchableOpacity
              key={faq.id}
              style={styles.faqCard}
              onPress={() => setSelectedFaq(faq)}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqCategoria}>{faq.categoria}</Text>
                <Text style={styles.faqIcon}>❓</Text>
              </View>
              <Text style={styles.faqPregunta}>{faq.pregunta}</Text>
              <Text style={styles.faqRespuestaPreview} numberOfLines={2}>
                {faq.respuesta}
              </Text>
              <Text style={styles.faqLeerMas}>Leer más →</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Compartir app */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShareApp}>
            <Text style={styles.shareIcon}>📱</Text>
            <Text style={styles.shareText}>Compartir esta aplicación</Text>
            <Text style={styles.shareArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Versión */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Versión 1.0.0</Text>
          <Text style={styles.copyrightText}>© 2026 VetConect. Todos los derechos reservados.</Text>
        </View>
      </ScrollView>

      {/* Modal de FAQ */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={selectedFaq !== null}
        onRequestClose={() => setSelectedFaq(null)}
      >
        <ScrollView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelectedFaq(null)} style={styles.modalBackButton}>
              <Text style={styles.modalBackArrow}>←</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Respuesta</Text>
            <View style={styles.modalPlaceholder} />
          </View>

          {selectedFaq && (
            <View style={styles.faqDetailContainer}>
              <View style={styles.faqDetailHeader}>
                <Text style={styles.faqDetailCategoria}>{selectedFaq.categoria}</Text>
                <Text style={styles.faqDetailIcon}>❓</Text>
              </View>
              <Text style={styles.faqDetailPregunta}>{selectedFaq.pregunta}</Text>
              <Text style={styles.faqDetailRespuesta}>{selectedFaq.respuesta}</Text>
              
              <TouchableOpacity 
                style={styles.faqContactButton}
                onPress={() => {
                  setSelectedFaq(null);
                  setModalVisible(true);
                }}
              >
                <Text style={styles.faqContactButtonText}>¿Necesitas más ayuda? Contáctanos</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </Modal>

      {/* Modal de formulario de soporte */}
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
            <Text style={styles.modalTitle}>Contactar Soporte</Text>
            <View style={styles.modalPlaceholder} />
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.formLabel}>Tu email *</Text>
            <TextInput
              style={styles.formInput}
              value={soporteEmail}
              onChangeText={setSoporteEmail}
              placeholder="tu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.formLabel}>Asunto *</Text>
            <TextInput
              style={styles.formInput}
              value={soporteAsunto}
              onChangeText={setSoporteAsunto}
              placeholder="¿Sobre qué necesitas ayuda?"
            />

            <Text style={styles.formLabel}>Mensaje *</Text>
            <TextInput
              style={[styles.formInput, styles.textArea]}
              value={soporteMensaje}
              onChangeText={setSoporteMensaje}
              placeholder="Describe tu problema o consulta detalladamente..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <TouchableOpacity style={styles.sendButton} onPress={enviarSoporte}>
              <Text style={styles.sendButtonText}>Enviar Mensaje</Text>
            </TouchableOpacity>

            <View style={styles.alternativeContact}>
              <Text style={styles.alternativeText}>O contacta directamente:</Text>
              <View style={styles.alternativeButtons}>
                <TouchableOpacity onPress={handleEmailSupport} style={styles.alternativeButton}>
                  <Text style={styles.alternativeButtonText}>✉️ Email</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleWhatsApp} style={styles.alternativeButton}>
                  <Text style={styles.alternativeButtonText}>💬 WhatsApp</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
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
  welcomeBanner: {
    backgroundColor: '#2b6777',
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  welcomeEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: '#e0e0e0',
    textAlign: 'center',
    lineHeight: 20,
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
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  contactCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
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
  contactIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  categoryChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  categoryChipActive: {
    backgroundColor: '#2b6777',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#666',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  faqCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  faqCategoria: {
    fontSize: 12,
    color: '#2b6777',
    fontWeight: '600',
  },
  faqIcon: {
    fontSize: 16,
  },
  faqPregunta: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  faqRespuestaPreview: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  faqLeerMas: {
    fontSize: 13,
    color: '#2b6777',
    fontWeight: '500',
  },
  guideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  guideIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  guideInfo: {
    flex: 1,
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  guideDescription: {
    fontSize: 13,
    color: '#666',
  },
  guideArrow: {
    fontSize: 20,
    color: '#2b6777',
  },
  resourcesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  resourceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
  },
  resourceIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  resourceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  resourceText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  systemStatus: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4caf50',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#2e7d32',
  },
  statusMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2b6777',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'space-between',
  },
  shareIcon: {
    fontSize: 24,
  },
  shareText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 12,
  },
  shareArrow: {
    fontSize: 20,
    color: '#2b6777',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  versionText: {
    fontSize: 14,
    color: '#999',
    marginBottom: 10,
  },
  linkText: {
    fontSize: 14,
    color: '#2b6777',
    marginBottom: 10,
    textDecorationLine: 'underline',
  },
  copyrightText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
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
  faqDetailContainer: {
    padding: 20,
  },
  faqDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  faqDetailCategoria: {
    fontSize: 14,
    color: '#2b6777',
    fontWeight: '600',
  },
  faqDetailIcon: {
    fontSize: 24,
  },
  faqDetailPregunta: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    lineHeight: 30,
  },
  faqDetailRespuesta: {
    fontSize: 16,
    color: '#555',
    lineHeight: 24,
    marginBottom: 30,
  },
  faqContactButton: {
    backgroundColor: '#2b6777',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  faqContactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    height: 120,
    textAlignVertical: 'top',
  },
  sendButton: {
    backgroundColor: '#2b6777',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  alternativeContact: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  alternativeText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  alternativeButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  alternativeButton: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  alternativeButtonText: {
    fontSize: 14,
    color: '#333',
  },
});