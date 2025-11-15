import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { TenantContext } from '../../tenant/entities/tenant-context.entity';

/**
 * Guard de autenticación para clientes
 * Valida tokens generados por el sistema de login con OTP
 */
@Injectable()
export class ClientAuthGuard implements CanActivate {
  constructor(private supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tenant: TenantContext = request.tenant;

    if (!tenant?.id) {
      throw new UnauthorizedException('No se pudo determinar la tienda actual');
    }

    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const [bearer, token] = authHeader.split(' ');
    if (!token) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    let decoded: any;
    try {
      // Decodificar token base64
      const decodedString = Buffer.from(token, 'base64').toString('utf-8');
      decoded = JSON.parse(decodedString);
    } catch (error) {
      throw new UnauthorizedException('Token malformado');
    }

    // Token sin expiración - las sesiones de clientes nunca expiran
    // La única forma de invalidar es desactivando el cliente en BD

    // Verificar rol
    if (decoded.role !== 'cliente') {
      throw new UnauthorizedException('Token no válido para clientes');
    }

    // Verificar que el token pertenece a la tienda correcta
    if (decoded.tienda_id !== tenant.id) {
      throw new UnauthorizedException('Token no válido para esta tienda');
    }

    // Verificar que el cliente existe y está activo
    const supabase = this.supabaseService.getAdminClient();

    console.log('🔐 Verificando cliente:', { clienteId: decoded.sub, tiendaId: tenant.id, tenantDominio: tenant.dominio });

    const { data: cliente, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', decoded.sub)
      .eq('id_tienda', tenant.id)
      .eq('activo', true)
      .single();

    console.log('📊 Resultado búsqueda cliente:', { cliente: cliente ? { id: cliente.id, nombre: cliente.nombre } : null, error });

    if (error || !cliente) {
      throw new UnauthorizedException('Cliente no encontrado o inactivo');
    }

    // Agregar información del cliente al request
    request.user = {
      id: cliente.id,
      email: cliente.email,
      nombre: cliente.nombre,
      role: 'cliente',
      tienda_id: tenant.id,
    };

    return true;
  }
}
