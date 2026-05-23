// src/services/api.ts

const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.101:3000/api';

export const api = {
  async post(endpoint: string, body: any) {
    try {
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const fullUrl = `${BACKEND_URL}${cleanEndpoint}`;

      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify(body),
      });

      // Si el servidor responde con un error controlado (ej. 400 - Usuario no encontrado)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // Creamos el error con el mensaje de NestJS
        throw new Error(errorData.message || `Error del servidor (Status ${response.status})`);
      }

      const data = await response.json();
      return data;

    } catch (error: any) {
      // 🤐 CAMBIO CLAVE: Cambiamos console.error por console.log para que NO pinte la consola de rojo
      // Esto evita que aparezca el molesto "Call Stack" en tu terminal.
      console.log(`ℹ️ API Respuesta Controlada [POST ${endpoint}]:`, error.message);
      
      // Volvemos a lanzar el error para que el componente login.tsx pueda mostrar la alerta
      throw error;
    }
  }
};