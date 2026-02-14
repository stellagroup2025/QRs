import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { JwtTokenService } from '../jwt-token.service';
import { TenantContext } from '../../tenant/entities/tenant-context.entity';

/**
 * Guard para proteger rutas de administración de tiendas
 * Verifica el token JWT personalizado (base64) generado durante el login de admin
 *
 * IMPORTANTE: Este guard debe usarse DESPUÉS de TenantResolverMiddleware
 *
 * Uso:
 * @UseGuards(AdminAuthGuard)
 * @Get('admin/dashboard/resumen')
 * async getDashboard(@Tenant() tenant: TenantContext) { ... }
 */
@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private supabaseService: SupabaseService,
    private jwtTokenService: JwtTokenService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tenant: TenantContext = request.tenant;

    // Extraer el token del header Authorization
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('No se proporcionó token de autenticación');
    }

    // El formato esperado es: "Bearer <token>"
    const [bearer, token] = authHeader.split(' ');
    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedException('Formato de token inválido. Use: Bearer <token>');
    }

    try {
      // Verificar y decodificar el token JWT firmado
      const decoded = this.jwtTokenService.verifyToken(token);

      // Verificar que el token es para un admin
      if (decoded.role !== 'admin') {
        throw new UnauthorizedException('Token no válido para administradores');
      }

      // Verificar que el token pertenece a la tienda correcta
      if (!tenant || decoded.tienda_id !== tenant.id) {
        throw new UnauthorizedException('Token no válido para esta tienda');
      }

      // Si es acceso de superadmin, permitir sin verificar admin_users
      if (decoded.superadmin_access === true) {
        // Verificar que el superadmin existe y está activo
        const supabase = this.supabaseService.getAdminClient();
        const { data: superadmin, error: superadminError } = await supabase
          .from('superadmin_users')
          .select('id, email, nombre, activo')
          .eq('id', decoded.sub)
          .eq('activo', true)
          .single();

        if (superadminError || !superadmin) {
          throw new UnauthorizedException('Superadmin no encontrado o inactivo');
        }

        // Añadir los datos del superadmin a la request
        request.user = {
          id: superadmin.id,
          email: superadmin.email,
          nombre: superadmin.nombre,
          role: 'admin',
          tienda_id: tenant.id,
          superadmin_access: true,
        };

        request.accessToken = token;
        return true;
      }

      // Verificar que el admin existe y está activo (acceso normal)
      // IMPORTANTE: Buscamos en usuarios_tienda (tabla unificada)
      const supabase = this.supabaseService.getAdminClient();
      const { data: admin, error } = await supabase
        .from('usuarios_tienda')
        .select('id, email, nombre, activo')
        .eq('id', decoded.sub)
        .eq('id_tienda', tenant.id)
        .eq('activo', true)
        .single();

      if (error || !admin) {
        throw new UnauthorizedException('Usuario administrador no encontrado o inactivo');
      }

      // Añadir los datos del admin a la request
      request.user = {
        id: admin.id,
        email: admin.email,
        nombre: admin.nombre,
        role: 'admin',
        tienda_id: tenant.id,
      };

      request.accessToken = token;

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token inválido');
    }
  }
}
