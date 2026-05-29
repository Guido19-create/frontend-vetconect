import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  useWindowDimensions,
  Pressable,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const galeriaImagenes = [
  require('@/assets/images/galeria-1.jpg'),
  require('@/assets/images/galeria-2.jpg'),
  require('@/assets/images/galeria-3.jpg'),
  require('@/assets/images/galeria-4.jpg'),
];

const COLORS = {
  primary: '#2b6777',
  secondary: '#52ab98',
  background: '#f8fafc',
  white: '#ffffff',
  textDark: '#1e293b', 
  textLight: '#475569', 
  accent: '#c8d8e4',
};

interface AnimatedPressableProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

const AnimatedPressable = ({ children, style, onPress }: AnimatedPressableProps) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      { transform: [{ scale: pressed ? 0.98 : 1 }], opacity: pressed ? 0.9 : 1 },
      style as any,
    ]}
  >
    {children}
  </Pressable>
);

const SectionTitle = ({ title, subtitle, light = false }: { title: string; subtitle?: string; light?: boolean }) => (
  <View style={styles.sectionHeader}>
    <Text style={[styles.sectionTitle, light && { color: COLORS.white }]}>{title}</Text>
    {subtitle && <Text style={[styles.sectionSubtitle, light && { color: '#e2e8f0' }]}>{subtitle}</Text>}
  </View>
);

const FeatureCard = ({ icon, title, desc }: { icon: IoniconsName; title: string; desc: string }) => (
  <AnimatedPressable style={styles.featureCard}>
    <View style={styles.iconContainer}>
      <Ionicons name={icon} size={32} color={COLORS.primary} />
    </View>
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardDesc}>{desc}</Text>
  </AnimatedPressable>
);

export default function VetConectLanding() {
  const router = useRouter(); 
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;
  
  const scrollViewRef = useRef<ScrollView>(null);
  const formularioY = useRef<number>(0);

  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    clinic: '', 
    direccion: '',
    descripcion: '',
    horario: 'Lun-Vie 9am-7pm',
    horarioPersonalizado: '',
    mostrarHorarioPersonalizado: false,
    requiereAprobacion: false,
  });
  const [menuVisible, setMenuVisible] = useState(false);

  const scrollAlFormulario = () => {
    scrollViewRef.current?.scrollTo({
      y: formularioY.current,
      animated: true,
    });
    setMenuVisible(false);
  };

  const cerrarMenu = () => setMenuVisible(false);

  // 🎯 Lógica de navegación del menú flotante y Navbar
  const handleMenuOption = (opcion: string) => {
    setMenuVisible(false);
    if (opcion === 'Clínicas') {
      router.push('/clinicas'); 
    }
  };

  const actualizarForm = (campo: string, valor: any) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
  };

  const seleccionarHorario = (horario: string) => {
    if (horario === 'personalizado') {
      actualizarForm('mostrarHorarioPersonalizado', true);
      actualizarForm('horario', 'personalizado');
    } else {
      actualizarForm('mostrarHorarioPersonalizado', false);
      actualizarForm('horario', horario);
      actualizarForm('horarioPersonalizado', '');
    }
  };

  const actualizarHorarioPersonalizado = (texto: string) => {
    actualizarForm('horarioPersonalizado', texto);
    actualizarForm('horario', texto);
  };

  const toggleAprobacion = () => {
    actualizarForm('requiereAprobacion', !form.requiereAprobacion);
  };

  const handleLogin = () => {
    router.push('/auth/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER / NAVBAR */}
      <View style={styles.navbar}>
        <Text style={styles.logo}>Vet<Text style={{ color: COLORS.secondary }}>Conect</Text></Text>
        {isDesktop ? (
          <View style={styles.navLinks}>
            {['Funcionalidades', 'Servicios', 'Cómo funciona'].map((item) => (
              <Text key={item} style={styles.navLinkItem}>{item}</Text>
            ))}
            {/* ✨ Agregado acceso directo en Desktop */}
            <TouchableOpacity onPress={() => handleMenuOption('Clínicas')}>
              <Text style={[styles.navLinkItem, { color: COLORS.secondary, fontWeight: '700' }]}>Clínicas</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnPrimarySmall} onPress={scrollAlFormulario}>
              <Text style={styles.btnTextWhite}>Crear mi Clínica</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
            <Ionicons name="menu" size={30} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* MENÚ FLOTANTE MÓVIL */}
      {!isDesktop && menuVisible && (
        <>
          <Pressable style={styles.menuOverlay} onPress={cerrarMenu} />
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuHeaderText}>Menú</Text>
              <TouchableOpacity onPress={cerrarMenu}>
                <Ionicons name="close" size={24} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>
            
            {(
              [
                { icon: 'person-outline', label: 'Mi Cuenta' },
                { icon: 'business-outline', label: 'Clínicas' },
                { icon: 'medkit-outline', label: 'Mi Clínica' },
                { icon: 'paw-outline', label: 'Mis Mascotas' },
                { icon: 'settings-outline', label: 'Ajustes' },
                { icon: 'help-circle-outline', label: 'Ayuda' },
              ] as { icon: IoniconsName; label: string }[]
            ).map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.menuItem}
                onPress={() => handleMenuOption(item.label)}
              >
                <Ionicons name={item.icon} size={22} color={COLORS.primary} />
                <Text style={styles.menuItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
        {/* HERO SECTION */}
        <View style={[styles.hero, isDesktop && styles.heroDesktop]}>
          <View style={isDesktop ? { flex: 1 } : { width: '100%' }}>
            <View style={styles.badge}><Text style={styles.badgeText}>PLATAFORMA PARA CLÍNICAS VETERINARIAS</Text></View>
            <Text style={styles.heroTitleText}>Tu clínica veterinaria, 100% digital "SIEMPRE LISTA".</Text>
            <Text style={styles.heroDescText}>¿Cansado de usar WhatsApp para gestionar citas y olvidar conversaciones? VetConect crea un canal de comunicación limpio entre veterinarios y clientes...</Text>
            
            <View style={styles.heroBtnGroup}>
              <TouchableOpacity style={styles.btnPrimary} onPress={scrollAlFormulario}>
                <Text style={styles.btnTextWhite}>Crear tu clínica gratis</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimary} onPress={handleLogin}>
                <Text style={styles.btnTextWhite}>Iniciar Sesión</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.indicators}>
              <Text style={styles.indicatorText}>✓ Sin tarjeta de crédito  |  ✓ 5 minutos  |  ✓ Soporte en español</Text>
            </View>
          </View>

          <View style={styles.floatingCardContainer}>
            <View style={styles.floatingCard}>
              <Ionicons name="calendar" size={24} color={COLORS.secondary} />
              <View style={{ marginLeft: 10 }}>
                <Text style={{ fontWeight: 'bold' }}>Próxima cita - Luna</Text>
                <Text style={{ color: COLORS.textLight }}>Hoy · 10:30 AM</Text>
              </View>
            </View>
            <View style={[styles.floatingCard, { marginTop: 15, alignSelf: 'flex-end' }]}>
              <Ionicons name="trending-up" size={24} color="#10b981" />
              <Text style={{ marginLeft: 10, fontWeight: 'bold' }}>Citas semana +38%</Text>
            </View>
          </View>
        </View>

        {/* QUÉ ES VETCONECT */}
        <View style={styles.sectionPadding}>
          <SectionTitle title="¿QUÉ ES VETCONECT?" subtitle="El sistema operativo de tu clínica, hecho por y para veterinarios." />
          <View style={isDesktop ? styles.row : styles.column}>
            <FeatureCard icon="time-outline" title="Recupera 8+ horas" desc="Automatiza recordatorios y deja que la agenda trabaje por ti." />
            <FeatureCard icon="document-text-outline" title="Historia Clínica Única" desc="Todo el pasado médico de la mascota a un solo click." />
            <FeatureCard icon="calendar-outline" title="Reservas 24/7" desc="Tus clientes agendan incluso cuando la clínica está cerrada." />
          </View>
        </View>

        {/* FUNCIONALIDADES CLAVE */}
        <View style={[styles.sectionPadding, { backgroundColor: '#edf2f4' }]}>
          <SectionTitle title="FUNCIONALIDADES CLAVE" subtitle="Todo lo que tu clínica necesita, sin instalar nada." />
          <View style={styles.grid}>
            {(
              [
                { t: 'Crea tu clínica', d: 'Configura perfil, equipo y horarios.', i: 'business-outline' },
                { t: 'Gestión de citas', d: 'Agenda inteligente y confirmaciones.', i: 'notifications-outline' },
                { t: 'Historial mascotas', d: 'Ficha completa y carnet digital.', i: 'paw-outline' },
                { t: 'Chats con clientes ', d: 'Mensajes en tiempo real con tu veterinario', i: 'chatbubble-ellipses-outline' },
              ] as { t: string; d: string; i: IoniconsName }[]
            ).map((f, idx) => (
              <View key={idx} style={[styles.gridItem, isDesktop && { width: '23%' }]}>
                <FeatureCard icon={f.i} title={f.t} desc={f.d} />
              </View>
            ))}
          </View>
        </View>

        {/* CÓMO FUNCIONA */}
        <View style={[styles.sectionPadding, { backgroundColor: COLORS.primary }]}>
          <SectionTitle title="De cero a clínica digital en tres pasos" light />
          <View style={isDesktop ? styles.row : styles.column}>
            {[
              { n: '1', t: 'Regístrate gratis', d: 'Crea tu cuenta en segundos.' },
              { n: '2', t: 'Crea tu clínica', d: 'Personaliza tu perfil y servicios.' },
              { n: '3', t: 'Gestiona pacientes', d: 'Empieza a recibir citas online.' },
            ].map((s, idx) => (
              <View key={idx} style={styles.stepCard}>
                <Text style={styles.stepNumber}>{s.n}</Text>
                <Text style={[styles.cardTitle, { color: COLORS.white }]}>{s.t}</Text>
                <Text style={{ color: '#cbd5e1', textAlign: 'center' }}>{s.d}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* GALERÍA */}
        <View style={styles.sectionPadding}>
          <SectionTitle title="GALERÍA" subtitle="Veterinarios reales, momentos reales." />
          <View style={styles.galleryGrid}>
            {galeriaImagenes.map((imagen, index) => (
              <AnimatedPressable key={index} style={styles.galleryImagePlaceholder}>
                <Image source={imagen} style={styles.galleryImage} resizeMode="cover" />
              </AnimatedPressable>
            ))}
          </View>
        </View>

        {/* TESTIMONIOS */}
        <View style={[styles.sectionPadding, { backgroundColor: '#f1f5f9' }]}>
          <SectionTitle title="LO QUE DICEN LOS VETERINARIOS" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            {[
              { n: 'Camila Rojas', c: 'Patitas Felices', t: 'VetConect cambió la forma en que organizamos las cirugías.' },
              { n: 'Andrés Molina', c: 'VetCenter', t: 'La agenda online redujo las llamadas en un 50%.' },
              { n: 'Lucía Fernández', c: 'Animalia', t: 'Tener todo el historial en el móvil es increíble.' }
            ].map((test, idx) => (
              <View key={idx} style={styles.testimonialCard}>
                <View style={styles.row}>{Array(5).fill(0).map((_, i) => <Ionicons key={i} name="star" size={16} color="#fbbf24" />)}</View>
                <Text style={styles.testimonialText}>"{test.t}"</Text>
                <Text style={styles.testimonialAuthor}>{test.n}</Text>
                <Text style={styles.testimonialClinic}>{test.c}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* FORMULARIO FINAL */}
        <View 
          style={[styles.sectionPadding, isDesktop && styles.row]}
          onLayout={(event) => {
            formularioY.current = event.nativeEvent.layout.y;
          }}
        >
          <View style={isDesktop ? { flex: 1, marginRight: 40 } : { marginBottom: 40 }}>
            <Text style={styles.heroTitleText}>Crea tu clínica gratis</Text>
            <Text style={styles.heroDescText}>Completa estos datos y empieza en menos de 5 minutos.</Text>
            
            <View style={styles.formCard}>
              <TextInput 
                placeholder="Nombre de tu clínica *" 
                placeholderTextColor="#64748b" 
                style={styles.input}
                value={form.clinic}
                onChangeText={(text) => actualizarForm('clinic', text)}
              />
              <TextInput 
                placeholder="Dirección de la clínica *" 
                placeholderTextColor="#64748b"
                style={styles.input}
                value={form.direccion}
                onChangeText={(text) => actualizarForm('direccion', text)}
              />
              <TextInput 
                placeholder="Descripción (opcional)" 
                placeholderTextColor="#64748b"
                style={styles.input}
                value={form.descripcion}
                onChangeText={(text) => actualizarForm('descripcion', text)}
                multiline
                numberOfLines={3}
              />
              
              <Text style={styles.labelText}>Horario de atención *</Text>
              <View style={styles.horarioContainer}>
                {[
                  'Lun-Vie 9am-7pm',
                  'Lun-Vie 9am-9pm',
                  'Lun-Sáb 9am-8pm',
                  'Lun-Dom 10am-6pm',
                  '24 horas (Urgencias)',
                ].map((horario) => (
                  <TouchableOpacity
                    key={horario}
                    style={[
                      styles.horarioOption,
                      form.horario === horario && styles.horarioOptionSelected
                    ]}
                    onPress={() => seleccionarHorario(horario)}
                  >
                    <Text style={[
                      styles.horarioOptionText,
                      form.horario === horario && styles.horarioOptionTextSelected
                    ]}>
                      {horario}
                    </Text>
                  </TouchableOpacity>
                ))}
                
                <TouchableOpacity
                  style={[
                    styles.horarioOption,
                    form.mostrarHorarioPersonalizado && styles.horarioOptionSelected
                  ]}
                  onPress={() => seleccionarHorario('personalizado')}
                >
                  <Text style={[
                    styles.horarioOptionText,
                    form.mostrarHorarioPersonalizado && styles.horarioOptionTextSelected
                  ]}>
                    ✏️ Personalizado
                  </Text>
                </TouchableOpacity>
              </View>

              {form.mostrarHorarioPersonalizado && (
                <View style={styles.personalizadoContainer}>
                  <TextInput
                    style={styles.inputPersonalizado}
                    placeholder="Ej: Lun-Vie 8am-6pm, Sáb 9am-2pm, Dom cerrado"
                    placeholderTextColor="#64748b"
                    value={form.horarioPersonalizado}
                    onChangeText={actualizarHorarioPersonalizado}
                    multiline
                    numberOfLines={2}
                  />
                </View>
              )}

              <TouchableOpacity style={styles.checkboxRow} onPress={toggleAprobacion} activeOpacity={0.7}>
                <Ionicons 
                  name={form.requiereAprobacion ? "checkbox" : "square-outline"} 
                  size={24} 
                  color={form.requiereAprobacion ? COLORS.secondary : COLORS.textLight} 
                />
                <Text style={styles.checkboxText}>
                  Mi clínica requiere aprobación del veterinario para agendar citas
                </Text>
              </TouchableOpacity>
              
              <Text style={styles.ayudaTexto}>
                * Si activas esta opción, los clientes podrán solicitar citas, pero un veterinario deberá confirmarlas manualmente.
              </Text>

              <View style={writeStyles().divider} />
              
              <TouchableOpacity style={styles.btnPrimary}>
                <Text style={styles.btnTextWhite}>Crear mi clínica gratis</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.benefitsCard, isDesktop && { width: 350 }]}>
            <Text style={styles.cardTitle}>Beneficios Premium</Text>
            {[
              'Tú Clinica desde tu sillón',
              'No te preocupes por la organización',
              'Sin necesidad de aplicaciones externas ',
              'Cancela cuando quieras y te comunicas'
            ].map((b, i) => (
              <View key={i} style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={20} color={COLORS.secondary} />
                <Text style={{ marginLeft: 10, color: COLORS.white }}>{b}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <View style={isDesktop ? styles.row : styles.column}>
            <View style={{ flex: 1 }}>
              <Text style={styles.logoWhite}>VetConect</Text>
              <Text style={{ color: '#94a3b8', marginTop: 10 }}>El futuro de la gestión veterinaria.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Los estilos se mantienen idénticos para no alterar tu diseño visual original.
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  navbar: { height: 70, backgroundColor: COLORS.white, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 25, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', zIndex: 100 },
  logo: { fontSize: 24, fontWeight: '800', color: COLORS.primary },
  logoWhite: { fontSize: 24, fontWeight: '800', color: COLORS.white },
  navLinks: { flexDirection: 'row', alignItems: 'center' },
  navLinkItem: { marginHorizontal: 15, fontWeight: '500', color: COLORS.textDark },
  sectionPadding: { paddingVertical: 60, paddingHorizontal: 25 },
  sectionHeader: { marginBottom: 40, alignItems: 'center' },
  sectionTitle: { fontSize: 28, fontWeight: '800', color: COLORS.textDark, textAlign: 'center' },
  sectionSubtitle: { fontSize: 16, color: COLORS.textLight, marginTop: 10, textAlign: 'center' },
  hero: { paddingVertical: 40, paddingHorizontal: 25, backgroundColor: COLORS.white },
  heroDesktop: { flexDirection: 'row', alignItems: 'center', minHeight: 500 },
  badge: { backgroundColor: '#e0f2f1', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 20 },
  badgeText: { color: COLORS.secondary, fontWeight: 'bold', fontSize: 12 },
  heroTitleText: { fontSize: 36, fontWeight: '900', color: COLORS.primary, lineHeight: 44 },
  heroDescText: { fontSize: 18, color: COLORS.textLight, marginTop: 20, lineHeight: 28 },
  heroBtnGroup: { flexDirection: 'row', marginTop: 30, flexWrap: 'wrap' },
  indicators: { marginTop: 30, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 20 },
  indicatorText: { color: COLORS.textLight, fontSize: 13 },
  featureCard: { backgroundColor: COLORS.white, padding: 30, borderRadius: 20, marginBottom: 20, flex: 1, marginHorizontal: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  iconContainer: { width: 60, height: 60, borderRadius: 15, backgroundColor: '#f0fdfa', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: COLORS.textDark, marginBottom: 10 },
  cardDesc: { color: COLORS.textLight, lineHeight: 22 },
  btnPrimary: { backgroundColor: COLORS.primary, paddingHorizontal: 25, paddingVertical: 15, borderRadius: 12, marginRight: 15, marginBottom: 10 },
  btnPrimarySmall: { backgroundColor: COLORS.primary, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8 },
  btnTextWhite: { color: COLORS.white, fontWeight: 'bold', textAlign: 'center' },
  floatingCardContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  floatingCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, padding: 15, borderRadius: 15, elevation: 10, shadowOpacity: 0.1 },
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  column: { flexDirection: 'column' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { width: '100%', marginBottom: 10 },
  stepCard: { alignItems: 'center', flex: 1, padding: 20, margin: 10 },
  stepNumber: { fontSize: 40, fontWeight: '900', color: COLORS.secondary, marginBottom: 10 },
  galleryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  galleryImagePlaceholder: { width: 150, height: 150, backgroundColor: '#e2e8f0', margin: 10, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  galleryImage: { width: '100%', height: '100%', borderRadius: 15 },
  testimonialCard: { backgroundColor: COLORS.white, width: 280, padding: 25, borderRadius: 20, marginRight: 20, elevation: 2 },
  testimonialText: { fontSize: 15, fontStyle: 'italic', color: COLORS.textDark, marginVertical: 15 },
  testimonialAuthor: { fontWeight: 'bold', color: COLORS.primary },
  testimonialClinic: { fontSize: 12, color: COLORS.secondary },
  formCard: { backgroundColor: COLORS.white, padding: 30, borderRadius: 25, marginTop: 30, elevation: 5 },
  input: { backgroundColor: '#f1f5f9', padding: 15, borderRadius: 10, marginBottom: 15, color: COLORS.textDark, fontSize: 15 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  benefitsCard: { backgroundColor: '#1e293b', padding: 30, borderRadius: 25, justifyContent: 'center' },
  benefitItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  footer: { backgroundColor: '#0f172a', padding: 50 },
  menuOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 999 },
  menuContainer: { position: 'absolute', top: 80, right: 25, width: 260, backgroundColor: COLORS.white, borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 10, zIndex: 1000, overflow: 'hidden' },
  menuHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#e2e8f0', backgroundColor: '#f8fafc' },
  menuHeaderText: { fontSize: 16, fontWeight: '700', color: COLORS.primary },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  menuItemText: { marginLeft: 12, fontSize: 15, color: COLORS.textDark, fontWeight: '500' },
  labelText: { fontSize: 14, fontWeight: '600', color: COLORS.textDark, marginBottom: 8, marginTop: 5 },
  horarioContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  horarioOption: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9', borderWidth: 1, borderColor: '#e2e8f0', marginRight: 8, marginBottom: 8 },
  horarioOptionSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  horarioOptionText: { fontSize: 12, color: COLORS.textDark },
  horarioOptionTextSelected: { color: COLORS.white, fontWeight: '500' },
  checkboxText: { marginLeft: 10, fontSize: 14, color: COLORS.textDark, flex: 1, flexWrap: 'wrap' },
  ayudaTexto: { fontSize: 11, color: COLORS.textLight, marginTop: -10, marginBottom: 15, marginLeft: 34, fontStyle: 'italic' },
  divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 20 },
  personalizadoContainer: { marginTop: 10, marginBottom: 15 },
  inputPersonalizado: { backgroundColor: '#f1f5f9', padding: 15, borderRadius: 10, fontSize: 14, color: COLORS.textDark, minHeight: 60, textAlignVertical: 'top' },
});

function writeStyles() { return styles; }