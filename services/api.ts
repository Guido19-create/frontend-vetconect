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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error del servidor (Status ${response.status})`);
      }

      return await response.json();

    } catch (error: any) {
      console.log(`ℹ️ API Respuesta Controlada [POST ${endpoint}]:`, error.message);
      throw error;
    }
  },

  async get(endpoint: string, params?: Record<string, any>) {
    try {
      const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      let fullUrl = `${BACKEND_URL}${cleanEndpoint}`;

      if (params) {
        const queryParams = Object.entries(params)
          .filter(([_, value]) => value !== undefined && value !== null && value !== '')
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
          .join('&');
        
        if (queryParams) {
          // Evita romper la URL si por error ya se arrastraba un signo de interrogación previo
          fullUrl += fullUrl.includes('?') ? `&${queryParams}` : `?${queryParams}`;
        }
      }

      const response = await fetch(fullUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error del servidor (Status ${response.status})`);
      }

      return await response.json();
    } catch (error: any) {
      console.log(`ℹ️ API Respuesta Controlada [GET ${endpoint}]:`, error.message);
      throw error;
    }
  },
};