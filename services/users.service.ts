import { Platform } from "react-native";

const apiHost = process.env.EXPO_PUBLIC_API_HOST || "192.168.1.102";
const BASE_URL = `http://${apiHost}:3000/api`;

export interface UpdateProfilePayload {
  username?: string;
  location?: string;
  phone?: string;
  otpCode?: string;
}

export const UsersIntegrationService = {
  /**
   * Obtiene la información del perfil del usuario conectado @Get('me')
   */
  async getProfile(token: string) {
    const response = await fetch(`${BASE_URL}/users/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener el perfil del servidor");
    }

    return await response.json();
  },

  /**
   * Obtiene las clínicas asociadas al usuario autenticado junto con su rol @Get('my-clinics')
   */
  async getUserClinics(token: string) {
    const response = await fetch(`${BASE_URL}/users/my-clinics`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    console.log(response)

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        data.message || `Error al obtener las clínicas (${response.status})`
      );
    }

    return data;
  },

  /**
   * Actualiza los datos de texto del perfil del usuario @Patch('update')
   */
  async updateProfile(token: string, payload: UpdateProfilePayload) {
    const response = await fetch(`${BASE_URL}/users/update`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `Error al actualizar perfil (${response.status})`);
    }

    return data;
  },

  /**
   * Sube el archivo binario del avatar a NestJS @Post('uploadAvatar')
   */
  async uploadAvatar(
    token: string,
    fileUri: string,
  ): Promise<{ url: string; message: string }> {
    const filename = fileUri.split("/").pop() || "avatar.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    const formData = new FormData();
    formData.append("avatar", {
      uri: fileUri,
      name: filename,
      type: type,
    } as any);

    const response = await fetch(`${BASE_URL}/users/uploadAvatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Error al subir la imagen al servidor (${response.status})`,
      );
    }

    return response.json();
  },
};