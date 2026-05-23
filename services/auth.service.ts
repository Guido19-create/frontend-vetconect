// src/services/auth.service.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./api";

export interface LoginResponse {
  type: "TOTP" | "EMAIL";
  userId: string;
  message: string;
}

export const AuthService = {
  /**
   * Primer paso del login: Envía el email a @Post('login') de NestJS
   */
  async login(email: string): Promise<LoginResponse> {
    const cleanEmail = email.trim().toLowerCase();

    // Petición al endpoint real de tu backend NestJS
    const data = await api.post("/auth/login", { email: cleanEmail });

    // Guardamos el email y la configuración devuelta en el almacenamiento local
    await AsyncStorage.setItem("tempEmail", cleanEmail);
    await AsyncStorage.setItem("mfaType", data.type);
    await AsyncStorage.setItem("userId", data.userId);

    return data;
  },

  /**
   * Procesa la información del usuario obtenida a través de Google Sign-In
   */
  async saveGoogleUser(
    accessToken: string,
    userInfo: { name: string; email: string; picture: string },
  ) {
    await AsyncStorage.setItem(
      "userData",
      JSON.stringify({
        name: userInfo.name,
        email: userInfo.email,
        photo: userInfo.picture,
        accessToken: accessToken,
      }),
    );
  },

  async loginInit(email: string, password: string) {
    // Apunta exactamente a tu ruta @Post('login/init')
    return await api.post("/auth/login/init", {
      email: email.trim().toLowerCase(),
      password: password,
    });
  },

  async registerInit(payload: {
    email: string;
    password?: string;
    name: string;
    phone: string;
    location?: string;
  }) {
    return await api.post("/auth/register/init", payload);
  },

  async registerVerify(payload: { email: string; otp: string }) {
    return await api.post("/auth/register/verify", payload);
  },

  async generateOtp(payload: { email: string; method: "email" | "phone" }) {
    return await api.post("/auth/generate-otp", payload);
  },

  async verifySecondFactor(payload: {
    code: string;
    userId: string;
    type: "EMAIL" | "TOTP";
  }) {
    return await api.post("/auth/login/verify-second-factor", payload);
  },

  async recoverPasswordRequest(email: string): Promise<{ message: string }> {
    return await api.post("/auth/recover-request", {
      email: email.trim().toLowerCase(),
    });
  },
  async confirmPasswordReset(payload: { token: string; newPassword: string }) {
    return await api.post("/auth/recover-confirm", payload);
  },

  async loginWithSocialProvider(idToken: string, provider: 'google' | 'apple') {
  // Petición directa a tu endpoint @Post('social-login')
  const response = await api.post('/auth/social-login', {
    idToken,
    provider,
  });
  
  // Guardamos la sesión real devuelta por TU backend (user, accessToken, refreshToken)
  if (response.data && response.data.accessToken) {
    await AsyncStorage.setItem('user_session', JSON.stringify(response.data));
  }
  
  return response.data;
}
};
