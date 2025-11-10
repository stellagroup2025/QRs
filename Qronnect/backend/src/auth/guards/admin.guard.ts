import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { TenantContext } from '../../tenant/entities/tenant-context.entity';

/**
 * Guard para proteger rutas de administración de tiendas
 * Verifica que el usuario autenticado tenga un rol de admin o staff en la tienda actual
 *
 * MULTITENANCY: El guard verifica permisos basándose en el tenant del dominio actual
 *
 * IMPORTANTE: Este guard debe usarse DESPUÉS de:
 * 1. TenantResolverMiddleware (inyecta request.tenant)
 * 2. SupabaseAuthGuard (inyecta request.user)
 *
 * Uso:
 * @UseGuards(SupabaseAuthGuard, AdminGuard)
 * @Post('admin/compras/registrar')
 * async registrarCompra(@CurrentUser() user: AuthUser, @Tenant() tenant: TenantContext) { ... }
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const tenant: TenantContext = request.tenant;

    if (!user || !user.id) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    if (!tenant) {
      throw new ForbiddenException('No se pudo determinar la tienda actual');
    }

    // Verificar si el usuario tiene un rol de administrador en LA TIENDA ACTUAL
    const supabase = this.supabaseService.getAdminClient();

    const { data: rol, error } = await supabase
      .from('roles_tienda')
      .select('id, rol, activo')
      .eq('supabase_user_id', user.id)
      .eq('id_tienda', tenant.id) // ← Filtrar por la tienda del dominio actual
      .eq('activo', true)
      .single();

    if (error) {
      console.error('Error al verificar rol de admin:', error);
      throw new ForbiddenException('Error al verificar permisos');
    }

    if (!rol) {
      throw new ForbiddenException(
        `No tienes permisos de administrador para la tienda: ${tenant.nombre}`,
      );
    }

    // Añadir el rol al request (útil para diferenciar permisos admin vs staff)
    request.adminRole = rol.rol;

    return true;
  }
}
