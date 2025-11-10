/**
 * Interfaz que representa al usuario autenticado
 * Extraído del JWT de Supabase Auth
 */
export interface AuthUser {
  id: string; // UUID del usuario en Supabase Auth
  email?: string;
  role?: string;
  metadata?: Record<string, any>; // user_metadata de Supabase
}
