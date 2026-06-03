import { apiClient } from './api.client';

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
  async getProfile() {
    const response = await apiClient('/users/me', { method: 'GET' });

    if (!response.ok) {
      throw new Error("Error al obtener el perfil del servidor");
    }
    return await response.json();
  },

  /**
   * Obtiene las clínicas asociadas al usuario autenticado junto con su rol @Get('my-clinics')
   */
  async getUserClinics() {
    const response = await apiClient('/users/my-clinics', { method: 'GET' });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `Error al obtener las clínicas (${response.status})`);
    }
    return data;
  },

  /**
   * Actualiza los datos de texto del perfil del usuario @Patch('update')
   */
  async updateProfile(payload: UpdateProfilePayload) {
    const response = await apiClient('/users/update', {
      method: 'PATCH',
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
  async uploadAvatar(fileUri: string): Promise<{ url: string; message: string }> {
    const filename = fileUri.split("/").pop() || "avatar.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    const formData = new FormData();
    formData.append("avatar", {
      uri: fileUri,
      name: filename,
      type: type,
    } as any);

    // Nota: Eliminamos Content-Type aquí para que fetch ponga automáticamente el boundary de FormData
    const response = await apiClient('/users/uploadAvatar', {
      method: 'POST',
      headers: { 'Content-Type': '' }, 
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error al subir la imagen al servidor (${response.status})`);
    }

    return response.json();
  },

};