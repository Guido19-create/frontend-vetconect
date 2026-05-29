import { api } from "./api";

export interface ClinicItem {
  id: string;
  name: string;
  logoURL?: string;
  description?: string;
  address?: string;
  privacy: "PUBLIC" | "PRIVATE";
  workingHours?: string;
  isActive: boolean;
  createdAt: string;
  owner?: {
    name: string;
    avatarURl?: string;
  };
}

export interface PaginatedClinicsResponse {
  data: ClinicItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  };
}

export interface ReviewUser {
  name: string;
  avatarURl?: string;
}

export interface ClinicReview {
  id: string;
  punctuation: number;
  comment: string;
  createAt: string;
  user: ReviewUser;
}

export interface ClinicRatingsResponse {
  averagePunctuation: string; 
  totalRatings: number;
  reviews: ClinicReview[];
}

// 🩺 NUEVA INTERFAZ PARA LOS SERVICIOS DE LA CLÍNICA
export interface ClinicServiceItem {
  id: string;
  name: string;
  description?: string;
  price?: number | string;
  duration?: number; // En minutos
  isActive?: boolean;
}

export class ClinicsIntegrationService {
  static async getClinics(filters: {
    name?: string;
    address?: string;
    page: number;
    limit: number;
  }): Promise<PaginatedClinicsResponse> {
    const queryParams: Record<string, any> = {
      page: filters.page,
      limit: filters.limit,
    };

    if (filters.name && filters.name.trim() !== "") {
      queryParams.name = filters.name.trim();
    }

    if (filters.address && filters.address.trim() !== "") {
      queryParams.address = filters.address.trim();
    }

    const result = await api.get("/clinics", queryParams);

    if (result && result.data) {
      return result as PaginatedClinicsResponse;
    } else if (Array.isArray(result)) {
      return {
        data: result,
        meta: {
          total: result.length,
          page: filters.page,
          limit: filters.limit,
          lastPage: 1,
        },
      };
    }

    return result;
  }

  static async getClinicById(id: string): Promise<any> {
    const hostIp = process.env.EXPO_PUBLIC_API_HOST || "10.0.2.2";
    const response = await fetch(`http://${hostIp}:3000/api/clinics/${id}`);
    if (!response.ok) {
      throw new Error(
        "No se pudo obtener la información detallada de la clínica.",
      );
    }
    return await response.json();
  }

  static async getClinicRatings(clinicId: string): Promise<ClinicRatingsResponse> {
    const hostIp = process.env.EXPO_PUBLIC_API_HOST || "10.0.2.2";
    const response = await fetch(
      `http://${hostIp}:3000/api/ratings/clinic/${clinicId}`,
    );

    if (!response.ok) {
      throw new Error("No se pudieron obtener las valoraciones de la clínica.");
    }
    return await response.json();
  }

  // 🚀 NUEVO MÉTODO: CONSUMIR EL ENDPOINT DE SERVICIOS OFRECIDOS
  static async getClinicServices(clinicId: string): Promise<ClinicServiceItem[]> {
    const hostIp = process.env.EXPO_PUBLIC_API_HOST || "10.0.2.2";
    const response = await fetch(
      `http://${hostIp}:3000/api/clinics/${clinicId}/services`,
    );

    if (!response.ok) {
      throw new Error("No se pudo obtener el catálogo de servicios médicos.");
    }
    return await response.json();
  }
}