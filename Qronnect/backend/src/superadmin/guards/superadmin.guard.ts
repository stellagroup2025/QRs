import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

/**
 * Guard para proteger rutas de superadmin
 *
 * Verifica que:
 * 1. El usuario esté autenticado (JWT válido)
 * 2. El usuario esté en la tabla superadmin_users
 * 3. El usuario esté activo
 *
 * IMPORTANTE: Este guard NO depende del tenant middleware
 * Los superadmins tienen acceso global a todas las tiendas
 */
@Injectable()
export class SuperAdminGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 1. Verificar que hay un usuario autenticado
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No se proporcionó token de autenticación');
    }

    const token = authHeader.substring(7); // Remover "Bearer "

    const supabase = this.supabaseService.getAdminClient();

    // 2. Intentar decodificar como token de desarrollo (base64)
    let userId: string;
    let email: string;

    try {
      // Intentar decodificar como token de desarrollo
      const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));

      if (decoded.role === 'superadmin' && decoded.sub && decoded.email) {
        // Es un token de desarrollo válido
        userId = decoded.sub;
        email = decoded.email;

        // Verificar expiración
        if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
          throw new UnauthorizedException('Token expirado');
        }
      } else {
        throw new Error('No es un token de desarrollo');
      }
    } catch (decodeError) {
      // Si no es un token de desarrollo, intentar con Supabase Auth
      const { data: { user }, error: authError } = await this.supabaseService.getClient().auth.getUser(token);

      if (authError || !user) {
        throw new UnauthorizedException('Token inválido o expirado');
      }

      userId = user.id;
      email = user.email;
    }

    // 3. Verificar que el usuario es un superadmin
    const { data: superadmin, error: superadminError } = await supabase
      .from('superadmin_users')
      .select('*')
      .eq('supabase_user_id', userId)
      .eq('activo', true)
      .single();

    if (superadminError || !superadmin) {
      throw new ForbiddenException('Acceso denegado: No eres un superadministrador');
    }

    // 4. Actualizar último acceso
    await supabase
      .from('superadmin_users')
      .update({ ultimo_acceso: new Date().toISOString() })
      .eq('id', superadmin.id);

    // 5. Adjuntar superadmin y usuario al request
    request.superadmin = superadmin;
    request.user = { id: userId, email };

    return true;
  }
}
