export const formatAvatarUrl = (url: string | null | undefined): string => {
  if (!url) return '';

  // Tomamos la IP del .env (192.168.1.102) y le pegamos el puerto manualmente
  const baseHost = process.env.EXPO_PUBLIC_API_HOST || '192.168.1.102';
  const apiHostWithPort = `${baseHost}:9000`; // Resultado: "192.168.1.102:9000"

  // Reemplazamos "localhost:9000" por tu IP con el puerto
  if (url.includes('localhost:9000')) {
    return url.replace('localhost:9000', apiHostWithPort);
  }
  
  // Por si acaso el backend omitiera el puerto en algún string
  if (url.includes('localhost')) {
    return url.replace('localhost', baseHost);
  }

  return url;
};