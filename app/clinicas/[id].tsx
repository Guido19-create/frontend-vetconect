import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ClinicsIntegrationService, ClinicServiceItem } from "../../services/clinics.service";

const COLORS = {
  primary: "#2b6777",
  secondary: "#52ab98",
  background: "#f8fafc",
  white: "#ffffff",
  textDark: "#1e293b",
  textLight: "#64748b",
  border: "#e2e8f0",
  star: "#fbbf24",
};

const DAYS_TRANSLATION: Record<string, string> = {
  monday: "Lunes",
  tuesday: "Martes",
  wednesday: "Miércoles",
  thursday: "Jueves",
  friday: "Viernes",
  saturday: "Sábado",
  sunday: "Domingo",
};

export default function DetalleClinicaScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); 
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const [clinic, setClinic] = useState<any>(null);
  const [ratingsData, setRatingsData] = useState<{
    averagePunctuation: string;
    totalRatings: number;
    reviews: any[];
  }>({ averagePunctuation: "0.0", totalRatings: 0, reviews: [] });
  
  // 💼 ESTADO PARA GUARDAR LOS SERVICIOS DE LA CLÍNICA
  const [services, setServices] = useState<ClinicServiceItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const formatURL = (url?: string) => {
    if (!url) return null;
    const hostIp = process.env.EXPO_PUBLIC_API_HOST || "10.0.2.2";
    if (url.includes("localhost")) {
      return url.replace("localhost", hostIp);
    }
    return url;
  };

  useEffect(() => {
    if (id) {
      loadAllData();
    }
  }, [id]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      
      // ⚡ Agregamos la llamada de servicios al Promise.all en paralelo
      const [clinicData, ratingsResponse, servicesResponse] = await Promise.all([
        ClinicsIntegrationService.getClinicById(id as string),
        ClinicsIntegrationService.getClinicRatings(id as string).catch(() => ({
          averagePunctuation: "0.0",
          totalRatings: 0,
          reviews: []
        })),
        ClinicsIntegrationService.getClinicServices(id as string).catch((err) => {
          console.log("Error controlado cargando servicios:", err.message);
          return []; // Fallback por si la clínica no tiene servicios asignados
        })
      ]);

      setClinic(clinicData);
      if (ratingsResponse) setRatingsData(ratingsResponse);
      if (servicesResponse) setServices(servicesResponse);

    } catch (error: any) {
      console.log("Error cargando datos de la clínica:", error.message);
      Alert.alert("Error", "No pudimos obtener la información completa de la clínica.");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando perfil de la clínica...</Text>
      </SafeAreaView>
    );
  }

  if (!clinic) return null;

  const finalImgUrl = formatURL(clinic.logoURL);
  const ownerAvatar = formatURL(clinic.owner?.avatarURl);

  const renderWorkingHours = () => {
    let hoursObj = clinic.workingHours;

    if (typeof hoursObj === "string") {
      try {
        let cleanedString = hoursObj.replace(/""/g, '"');
        if (cleanedString.startsWith('"') && cleanedString.endsWith('"')) {
          cleanedString = cleanedString.slice(1, -1);
        }
        hoursObj = JSON.parse(cleanedString);
      } catch (e) {
        return <Text style={styles.detailText}>{hoursObj}</Text>;
      }
    }

    if (typeof hoursObj === "object" && hoursObj !== null) {
      return Object.entries(hoursObj).map(([day, value]: [string, any]) => {
        let textToShow = "No especificado";
        const dayLabel = DAYS_TRANSLATION[day.toLowerCase()] || day;

        if (value && typeof value === "object") {
          if (value.open && value.close) {
            textToShow = `${value.open} - ${value.close} hs`;
          } else if (value.isClosed === true || value.isClosed === "true") {
            textToShow = "Cerrado";
          }
        } else if (value) {
          textToShow = String(value);
        }

        return (
          <Text key={day} style={[styles.detailText, { marginBottom: 5 }]}>
            <Text style={{ fontWeight: "700" }}>{dayLabel}:</Text> {textToShow}
          </Text>
        );
      });
    }

    return <Text style={styles.detailText}>No hay horarios disponibles</Text>;
  };

  const renderStars = (rating: number, size: number = 20) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Ionicons key={i} name="star" size={size} color={COLORS.star} />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<Ionicons key={i} name="star-half" size={size} color={COLORS.star} />);
      } else {
        stars.push(<Ionicons key={i} name="star-outline" size={size} color={COLORS.border} />);
      }
    }
    return <View style={styles.starsRow}>{stars}</View>;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerNav}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
          <Text style={styles.backBtnText}>Volver</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.mainLayout, isDesktop && styles.mainLayoutDesktop]}>
          
          {/* SECCIÓN COLUMNA IZQUIERDA */}
          <View style={[styles.leftColumn, isDesktop && styles.leftColumnDesktop]}>
            <View style={styles.imageContainer}>
              {finalImgUrl ? (
                <Image
                  source={{ uri: finalImgUrl }}
                  style={styles.mainImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.placeholderContainer}>
                  <Ionicons name="business" size={80} color={COLORS.primary} />
                </View>
              )}
              {clinic.isActive && (
                <View style={styles.badgeVerificado}>
                  <Ionicons name="checkmark-sharp" size={14} color={COLORS.white} />
                  <Text style={styles.badgeVerificadoText}>Verificada</Text>
                </View>
              )}
            </View>

            <View style={styles.cardHeaderInfo}>
              <Text style={styles.clinicName}>{clinic.name}</Text>
              
              <View style={styles.ratingSummaryRow}>
                {renderStars(parseFloat(ratingsData.averagePunctuation), 18)}
                <Text style={styles.ratingSummaryText}>
                  {ratingsData.averagePunctuation} ({ratingsData.totalRatings} opiniones)
                </Text>
              </View>

              <View style={styles.privacyRow}>
                <Ionicons
                  name={clinic.privacy === "PUBLIC" ? "earth-outline" : "lock-closed-outline"}
                  size={16}
                  color={COLORS.secondary}
                />
                <Text style={styles.privacyText}>
                  {clinic.privacy === "PUBLIC" ? "Acceso Público" : "Clínica Privada"}
                </Text>
              </View>
            </View>
          </View>

          {/* SECCIÓN COLUMNA DERECHA */}
          <View style={[styles.rightColumn, isDesktop && styles.rightColumnDesktop]}>
            
            {/* 🩺 SECCIÓN INYECTADA: NUESTRO CATÁLOGO DE SERVICIOS */}
            <View style={styles.infoSectionCard}>
              <Text style={styles.sectionTitle}>Servicios Disponibles</Text>
              {services.length === 0 ? (
                <View style={styles.emptyServicesContainer}>
                  <Ionicons name="medical-outline" size={32} color={COLORS.textLight} />
                  <Text style={styles.noServicesText}>
                    Esta clínica no posee servicios médicos registrados actualmente.
                  </Text>
                </View>
              ) : (
                <View style={[styles.servicesGrid, isDesktop && styles.servicesGridDesktop]}>
                  {services.map((item) => (
                    <View 
                      key={item.id} 
                      style={[styles.serviceCard, isDesktop && styles.serviceCardDesktop]}
                    >
                      <View style={styles.serviceHeader}>
                        <View style={styles.serviceIconContainer}>
                          <Ionicons name="git-pull-request-outline" size={18} color={COLORS.primary} />
                        </View>
                        {item.price !== undefined && (
                          <Text style={styles.servicePrice}>
                            {typeof item.price === "number" ? `$${item.price}` : item.price}
                          </Text>
                        )}
                      </View>
                      
                      <Text style={styles.serviceName} numberOfLines={1}>{item.name}</Text>
                      
                      <Text style={styles.serviceDescription} numberOfLines={2}>
                        {item.description || "Sin descripción detallada disponible."}
                      </Text>

                      {item.duration && (
                        <View style={styles.durationRow}>
                          <Ionicons name="stopwatch-outline" size={14} color={COLORS.textLight} />
                          <Text style={styles.durationText}>{item.duration} min aprox.</Text>
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* SOBRE NOSOTROS */}
            <View style={styles.infoSectionCard}>
              <Text style={styles.sectionTitle}>Sobre Nosotros</Text>
              <Text style={styles.descriptionText}>
                {clinic.description || "Esta clínica aún no ha proporcionado una descripción detallada."}
              </Text>
            </View>

            {/* UBICACIÓN */}
            {clinic.address && (
              <View style={styles.infoSectionCard}>
                <Text style={styles.sectionTitle}>Ubicación y Dirección</Text>
                <View style={styles.detailRow}>
                  <Ionicons name="location" size={22} color={COLORS.secondary} style={styles.rowIcon} />
                  <Text style={styles.detailText}>{clinic.address}</Text>
                </View>
              </View>
            )}

            {/* HORARIO DE ATENCIÓN */}
            {clinic.workingHours && (
              <View style={styles.infoSectionCard}>
                <Text style={styles.sectionTitle}>Horarios de Apertura</Text>
                <View style={styles.detailRow}>
                  <Ionicons name="time-outline" size={22} color={COLORS.primary} style={styles.rowIcon} />
                  <View style={{ flex: 1 }}>
                    {renderWorkingHours()}
                  </View>
                </View>
              </View>
            )}

            {/* INFORMACIÓN DEL PROPIETARIO */}
            {clinic.owner && (
              <View style={styles.infoSectionCard}>
                <Text style={styles.sectionTitle}>Director / Administrador Médico</Text>
                <View style={styles.ownerRow}>
                  <View style={styles.ownerAvatarContainer}>
                    {ownerAvatar ? (
                      <Image source={{ uri: ownerAvatar }} style={styles.ownerAvatar} />
                    ) : (
                      <Ionicons name="person-circle" size={44} color={COLORS.textLight} />
                    )}
                  </View>
                  <View style={styles.ownerInfo}>
                    <Text style={styles.ownerName}>{clinic.owner.name}</Text>
                    <Text style={styles.ownerRole}>Propietario de la Red</Text>
                  </View>
                </View>
              </View>
            )}

            {/* VALORACIONES Y OPINIONES DE LOS USUARIOS */}
            <View style={styles.infoSectionCard}>
              <Text style={styles.sectionTitle}>Valoraciones y Reseñas</Text>
              
              <View style={styles.globalRatingBox}>
                <View style={styles.globalRatingLeft}>
                  <Text style={styles.bigRatingNumber}>{ratingsData.averagePunctuation}</Text>
                  <Text style={styles.outOfFive}>de 5 estrellas</Text>
                </View>
                <View style={styles.globalRatingRight}>
                  {renderStars(parseFloat(ratingsData.averagePunctuation), 24)}
                  <Text style={styles.totalRatingsText}>
                    {ratingsData.totalRatings} valoraciones en total
                  </Text>
                </View>
              </View>

              <View style={styles.commentDivider} />

              {ratingsData.reviews.length === 0 ? (
                <Text style={styles.noReviewsText}>
                  Esta clínica aún no cuenta con comentarios o reseñas escritas.
                </Text>
              ) : (
                ratingsData.reviews.map((review: any) => {
                  const userAvatar = formatURL(review.user?.avatarURl);
                  const reviewDate = review.createAt 
                    ? new Date(review.createAt).toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })
                    : "";

                  return (
                    <View key={review.id} style={styles.reviewCard}>
                      <View style={styles.reviewHeader}>
                        <View style={styles.reviewUserInfo}>
                          <View style={styles.reviewAvatarContainer}>
                            {userAvatar ? (
                              <Image source={{ uri: userAvatar }} style={styles.reviewAvatar} />
                            ) : (
                              <Ionicons name="person-circle" size={36} color={COLORS.textLight} />
                            )}
                          </View>
                          <View style={styles.reviewNameBox}>
                            <Text style={styles.reviewUserName}>
                              {review.user?.name || "Usuario Anónimo"}
                            </Text>
                            <Text style={styles.reviewDate}>{reviewDate}</Text>
                          </View>
                        </View>
                        <View>
                          {renderStars(review.punctuation, 14)}
                        </View>
                      </View>
                      <Text style={styles.reviewCommentText}>
                        {review.comment || "El usuario no dejó una opinión escrita, solo puntuación."}
                      </Text>
                    </View>
                  );
                })
              )}
            </View>

          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: COLORS.textLight,
    fontWeight: "600",
  },
  headerNav: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
  backBtnText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textDark,
  },
  scrollContent: { paddingBottom: 40 },
  mainLayout: { flexDirection: "column" },
  mainLayoutDesktop: { flexDirection: "row", padding: 25, gap: 25 },
  leftColumn: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  leftColumnDesktop: {
    width: "40%",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
    alignSelf: "flex-start",
  },
  rightColumn: { padding: 20 },
  rightColumnDesktop: { width: "58%", padding: 0 },
  imageContainer: {
    width: "100%",
    height: 260,
    backgroundColor: "#f1f5f9",
    position: "relative",
  },
  mainImage: { width: "100%", height: "100%" },
  placeholderContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#edf2f4",
  },
  badgeVerificado: {
    position: "absolute",
    top: 15,
    right: 15,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeVerificadoText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 4,
  },
  cardHeaderInfo: { padding: 20 },
  clinicName: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 4,
  },
  ratingSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 6,
  },
  ratingSummaryText: {
    fontSize: 13,
    color: COLORS.textLight,
    fontWeight: "600",
  },
  privacyRow: { flexDirection: "row", alignItems: "center" },
  privacyText: {
    marginLeft: 6,
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: "600",
  },
  infoSectionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOpacity: 0.02,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.primary,
    marginBottom: 12,
  },
  descriptionText: { fontSize: 14, color: COLORS.textDark, lineHeight: 22 },
  detailRow: { flexDirection: "row", alignItems: "flex-start", marginTop: 4 },
  rowIcon: { marginRight: 12, marginTop: 1 },
  detailText: { fontSize: 14, color: COLORS.textDark, flex: 1, lineHeight: 20 },
  ownerRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  ownerAvatarContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    overflow: "hidden",
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  ownerAvatar: { width: "100%", height: "100%" },
  ownerInfo: { marginLeft: 12 },
  ownerName: { fontSize: 15, fontWeight: "700", color: COLORS.textDark },
  ownerRole: { fontSize: 12, color: COLORS.textLight, marginTop: 1 },

  // Estilos del grid de servicios inyectados
  servicesGrid: {
    flexDirection: "column",
    marginTop: 5,
  },
  servicesGridDesktop: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  serviceCard: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  serviceCardDesktop: {
    width: "48%",
    marginBottom: 0,
  },
  serviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  serviceIconContainer: {
    backgroundColor: "#edf7f6",
    padding: 6,
    borderRadius: 8,
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.secondary,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textDark,
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 12,
    color: COLORS.textLight,
    lineHeight: 16,
    marginBottom: 8,
  },
  durationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  durationText: {
    fontSize: 11,
    color: COLORS.textLight,
    marginLeft: 4,
    fontWeight: "500",
  },
  emptyServicesContainer: {
    alignItems: "center",
    paddingVertical: 15,
  },
  noServicesText: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: "center",
    fontStyle: "italic",
    marginTop: 8,
  },

  globalRatingBox: {
    flexDirection: "row",
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 4,
  },
  globalRatingLeft: {
    alignItems: "center",
    justifyContent: "center",
    paddingRight: 20,
    borderRightWidth: 1,
    borderRightColor: COLORS.border,
  },
  bigRatingNumber: {
    fontSize: 32,
    fontWeight: "900",
    color: COLORS.textDark,
  },
  outOfFive: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: "600",
    marginTop: 2,
  },
  globalRatingRight: {
    paddingLeft: 20,
    flex: 1,
    justifyContent: "center",
  },
  totalRatingsText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: "600",
    marginTop: 4,
  },
  commentDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 18,
  },
  noReviewsText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: "center",
    fontStyle: "italic",
    marginVertical: 10,
  },
  reviewCard: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 14,
    marginBottom: 14,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  reviewUserInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  reviewAvatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
  },
  reviewAvatar: {
    width: "100%",
    height: "100%",
  },
  reviewNameBox: {
    marginLeft: 10,
  },
  reviewUserName: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textDark,
  },
  reviewDate: {
    fontSize: 11,
    color: COLORS.textLight,
    marginTop: 1,
  },
  reviewCommentText: {
    fontSize: 13,
    color: COLORS.textDark,
    lineHeight: 18,
    paddingLeft: 2,
  },
});