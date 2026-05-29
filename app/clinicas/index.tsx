import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ClinicsIntegrationService,
  ClinicItem,
} from "../../services/clinics.service";

const COLORS = {
  primary: "#2b6777",
  secondary: "#52ab98",
  background: "#f8fafc",
  white: "#ffffff",
  textDark: "#1e293b",
  textLight: "#64748b",
  border: "#e2e8f0",
};

export default function ClinicasScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;

  const [clinics, setClinics] = useState<ClinicItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [lastPage, setLastPage] = useState<number>(1);

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(true);

  const [searchName, setSearchName] = useState<string>("");
  const [searchAddress, setSearchAddress] = useState<string>("");

  const fetchClinics = async (
    pageNumber: number,
    shouldAppend: boolean = false,
  ) => {
    if (pageNumber === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await ClinicsIntegrationService.getClinics({
        name: searchName,
        address: searchAddress,
        page: pageNumber,
        limit: 10,
      } as any);

      if (response && response.data) {
        if (shouldAppend) {
          setClinics((prev) => {
            const actualPrevious = prev || [];
            const combined = [...actualPrevious, ...response.data];
            return combined.filter(
              (clinic, index, self) =>
                self.findIndex((c) => c.id === clinic.id) === index,
            );
          });
        } else {
          setClinics(response.data);
        }

        setPage(response.meta.page ?? 1);
        setLastPage(response.meta.lastPage ?? 1);
      } else {
        if (!shouldAppend) setClinics([]);
      }
    } catch (error: any) {
      console.log("Error cargando clínicas:", error.message);
      if (!shouldAppend) setClinics([]);
      Alert.alert(
        "Error de Búsqueda",
        error.response?.data?.message || "Hubo un problema.",
      );
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchClinics(1, false);
  }, []);

  const handleApplyFilters = () => {
    fetchClinics(1, false);
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;

    if (isCloseToBottom && !loadingMore && page < lastPage) {
      fetchClinics(page + 1, true);
    }
  };

  const formatLogoURL = (url?: string) => {
    if (!url) return null;

    const hostIp = process.env.EXPO_PUBLIC_API_HOST || "10.0.2.2";

    if (url.includes("localhost")) {
      return url.replace("localhost", hostIp);
    }

    return url;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* CABECERA */}
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
          </TouchableOpacity>
          <View>
            <Text style={styles.screenTitle}>Clínicas Disponibles</Text>
            <Text style={styles.screenSubtitle}>
              Explora y filtra los centros médicos
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.toggleFiltersBtn}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons
            name={showFilters ? "eye-off-outline" : "eye-outline"}
            size={20}
            color={COLORS.primary}
          />
          <Text style={styles.toggleFiltersText}>
            {showFilters ? "Ocultar Filtros" : "Filtros"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* CONTENEDOR PRINCIPAL */}
      <View style={[styles.mainLayout, isDesktop && styles.mainLayoutDesktop]}>
        {showFilters && (
          <View
            style={[
              styles.filterCard,
              isDesktop ? styles.filterCardDesktop : null,
            ]}
          >
            <Text style={styles.filterSectionTitle}>
              <Ionicons
                name="options-outline"
                size={18}
                color={COLORS.primary}
              />{" "}
              Filtros de Búsqueda
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Buscar por Nombre</Text>
              <View style={styles.searchWrapper}>
                <Ionicons
                  name="search-outline"
                  size={20}
                  color={COLORS.textLight}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Patitas Felices..."
                  placeholderTextColor={COLORS.textLight}
                  value={searchName}
                  onChangeText={setSearchName}
                  onSubmitEditing={handleApplyFilters}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Buscar por Dirección</Text>
              <View style={styles.searchWrapper}>
                <Ionicons
                  name="location-outline"
                  size={20}
                  color={COLORS.textLight}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Calle 10, La Habana..."
                  placeholderTextColor={COLORS.textLight}
                  value={searchAddress}
                  onChangeText={setSearchAddress}
                  onSubmitEditing={handleApplyFilters}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.applyFiltersBtn}
              onPress={handleApplyFilters}
            >
              <Text style={styles.applyFiltersBtnText}>Buscar</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* LISTADO */}
        {loading ? (
          <View style={styles.centerLoader}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loaderText}>Consultando clínicas...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.listContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            <Text style={styles.resultsCount}>
              Mostrando {clinics.length} clínicas en la red
            </Text>

            <View style={isDesktop ? styles.gridDesktop : styles.gridMobile}>
              {clinics.map((clinica) => {
                const finalImgUrl = formatLogoURL((clinica as any).logoURL);

                return (
                  <View
                    key={clinica.id}
                    style={[
                      styles.clinicCard,
                      isDesktop && styles.clinicCardDesktop,
                    ]}
                  >
                    {/* SECCIÓN DE LOGO GRANDE */}
                    <View style={styles.imageContainer}>
                      {finalImgUrl ? (
                        <Image
                          source={{ uri: finalImgUrl }}
                          style={styles.logoImagen}
                          resizeMode="cover"
                          onError={(e) =>
                            console.log(
                              `Error cargando la URL (${finalImgUrl}):`,
                              e.nativeEvent.error,
                            )
                          }
                        />
                      ) : (
                        <View style={styles.placeholderContainer}>
                          <Ionicons
                            name="business"
                            size={54}
                            color={COLORS.primary}
                          />
                        </View>
                      )}

                      {/* Badge flotante de Verificación */}
                      {clinica.isActive && (
                        <View style={styles.badgeVerificado}>
                          <Ionicons
                            name="checkmark-sharp"
                            size={12}
                            color={COLORS.white}
                          />
                          <Text style={styles.badgeVerificadoText}>
                            Verificada
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* CUERPO DE LA TARJETA */}
                    <View style={styles.cardBody}>
                      <Text style={styles.clinicName} numberOfLines={1}>
                        {clinica.name}
                      </Text>
                      <Text style={styles.clinicSpecialty}>
                        {clinica.privacy === "PUBLIC"
                          ? "Clínica de Acceso Público"
                          : "Clínica Privada"}
                      </Text>

                      <View style={styles.divider} />

                      {(clinica as any).address && (
                        <View style={styles.infoRow}>
                          <Ionicons
                            name="location-outline"
                            size={16}
                            color={COLORS.secondary}
                          />
                          <Text style={styles.infoText} numberOfLines={1}>
                            {(clinica as any).address}
                          </Text>
                        </View>
                      )}

                      {clinica.description && (
                        <View style={styles.infoRow}>
                          <Ionicons
                            name="document-text-outline"
                            size={16}
                            color={COLORS.textLight}
                          />
                          <Text style={styles.infoText} numberOfLines={2}>
                            {clinica.description}
                          </Text>
                        </View>
                      )}

                      {/* BOTÓN CON REDIRECCIÓN AL DETALLE */}
                      <TouchableOpacity
                        style={styles.actionBtn}
                        activeOpacity={0.8}
                        onPress={() => {
                          router.push(`/clinicas/${clinica.id}`);
                        }}
                      >
                        <Text style={styles.actionBtnText}>Ver Detalles</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>

            {loadingMore && (
              <View style={styles.footerLoader}>
                <ActivityIndicator size="small" color={COLORS.secondary} />
                <Text style={styles.footerLoaderText}>
                  Cargando más clínicas...
                </Text>
              </View>
            )}

            {!loading && clinics.length === 0 && (
              <View style={styles.centerLoader}>
                <Ionicons
                  name="folder-open-outline"
                  size={40}
                  color={COLORS.textLight}
                />
                <Text style={styles.loaderText}>
                  No se encontraron clínicas.
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  backBtn: {
    marginRight: 12,
    padding: 5,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  screenTitle: { fontSize: 18, fontWeight: "800", color: COLORS.primary },
  screenSubtitle: { fontSize: 12, color: COLORS.textLight, marginTop: 2 },
  toggleFiltersBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#edf7f6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1e7e4",
  },
  toggleFiltersText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
  },
  mainLayout: { flex: 1, flexDirection: "column" },
  mainLayoutDesktop: { flexDirection: "row", padding: 20 },
  filterCard: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    shadowColor: "#000",
    shadowOpacity: 0.02,
    elevation: 1,
  },
  filterCardDesktop: {
    width: 300,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 20,
    alignSelf: "flex-start",
    maxHeight: 320,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textDark,
    marginBottom: 15,
  },
  label: {
    fontWeight: "700",
    fontSize: 13,
    color: COLORS.textDark,
    marginBottom: 8,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: COLORS.background,
  },
  input: { flex: 1, marginLeft: 8, fontSize: 15, color: COLORS.textDark },
  inputGroup: { marginBottom: 15 },
  applyFiltersBtn: {
    backgroundColor: COLORS.secondary,
    borderRadius: 10,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
  },
  applyFiltersBtnText: { color: COLORS.white, fontWeight: "700", fontSize: 14 },
  listContainer: { flex: 1, paddingHorizontal: 20 },
  scrollContent: { paddingVertical: 15 },
  resultsCount: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: "600",
    marginBottom: 15,
  },
  gridMobile: { flexDirection: "column" },
  gridDesktop: { flexDirection: "row", flexWrap: "wrap", gap: 20 },
  clinicCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 25,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  clinicCardDesktop: { width: "31%", marginBottom: 0 },
  imageContainer: {
    width: "100%",
    height: 200,
    backgroundColor: "#f1f5f9",
    position: "relative",
  },
  logoImagen: {
    width: "100%",
    height: "100%",
  },
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    elevation: 2,
  },
  badgeVerificadoText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 4,
  },
  cardBody: { padding: 18 },
  clinicName: { fontSize: 18, fontWeight: "800", color: COLORS.primary },
  clinicSpecialty: {
    fontSize: 13,
    color: COLORS.textLight,
    marginTop: 3,
    fontWeight: "500",
  },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: 14 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  infoText: { marginLeft: 8, fontSize: 13, color: COLORS.textDark, flex: 1 },
  actionBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    height: 46,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
  },
  actionBtnText: { color: COLORS.white, fontSize: 14, fontWeight: "700" },
  centerLoader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  loaderText: {
    marginTop: 12,
    color: COLORS.textLight,
    fontSize: 14,
    textAlign: "center",
  },
  footerLoader: {
    paddingVertical: 15,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerLoaderText: { marginLeft: 8, color: COLORS.textLight, fontSize: 13 },
});