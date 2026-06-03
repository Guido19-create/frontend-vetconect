import AsyncStorage from '@react-native-async-storage/async-storage';

const apiHost = process.env.EXPO_PUBLIC_API_HOST || "192.168.1.102";
const BASE_URL = `http://${apiHost}:3000/api`;

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

/**
 * Cliente HTTP personalizado que envuelve a fetch e implementa un interceptor para auto-refresh
 */
export const apiClient = async (endpoint: string, options: FetchOptions = {}): Promise<Response> => {
  let accessToken = await AsyncStorage.getItem('access_token');
  
  // Inicializar cabeceras por defecto
  options.headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  // Inyectar el token de acceso si existe
  if (accessToken) {
    options.headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
  let response = await fetch(url, options);

  // 🔄 INTERCEPTOR: Si devuelve 401, el token probablemente ha expirado
  if (response.status === 401) {
    const refreshToken = await AsyncStorage.getItem('refresh_token');

    // Si no hay refresh_token guardado, no podemos renovar; lanzamos el error original
    if (!refreshToken) {
      return response;
    }

    if (!isRefreshing) {
      isRefreshing = true;

      try {
        console.log('🔄 Access token expirado. Intentando renovar con Refresh Token...');
        
        const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          
          // Guardar los nuevos tokens devueltos por el backend
          await AsyncStorage.setItem('access_token', refreshData.access_token);
          if (refreshData.refresh_token) {
            await AsyncStorage.setItem('refresh_token', refreshData.refresh_token);
          }

          console.log('✅ Tokens renovados con éxito.');
          isRefreshing = false;
          
          // 1. Notificar a las peticiones que quedaron esperando en la cola
          onRefreshed(refreshData.access_token);

          // 2. CORRECCIÓN CLAVE: Volver a lanzar la petición ORIGINAL con el nuevo token
          options.headers['Authorization'] = `Bearer ${refreshData.access_token}`;
          return await fetch(url, options); 

        } else {
          isRefreshing = false;
          await clearAuthAndRedirect();
          return response;
        }
      } catch (error) {
        isRefreshing = false;
        return response;
      }
    }

    // Si ya se está refrescando el token, ponemos en espera esta petición hasta que termine
    return new Promise((resolve) => {
      subscribeTokenRefresh(async (newToken) => {
        options.headers!['Authorization'] = `Bearer ${newToken}`;
        resolve(fetch(url, options));
      });
    });
  }

  return response;
};

// Limpia el almacenamiento y fuerza el re-enrutamiento al login si todo falla
async function clearAuthAndRedirect() {
  await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
  console.warn('Sesión completamente expirada. Redirigiendo al login...');
}