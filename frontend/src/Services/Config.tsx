/**
 * Clase para configurar a donde se debe conectar.
 */
class Config {
  static DOMAIN_API = process.env.NEXT_PUBLIC_URL_API_BACKEND || 'http://localhost:3030';
  static API_URL = `${this.DOMAIN_API}/api`;
}

export default Config;
