import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { JwtTokenService } from '../jwt-token.service';
import { TenantContext } from '../../tenant/entities/tenant-context.entity';

/**
 * Guard de autenticación para clientes
 * Valida tokens JWT firmados generados por el sistema de login con OTP
 */
@Injectable()
export class ClientAuthGuard implements CanActivate {
  constructor(
    private supabaseService: SupabaseService,
    private jwtTokenService: JwtTokenService,
  ) { }

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
      // Verificar y decodificar el token JWT firmado
      decoded = this.jwtTokenService.verifyToken(token);
    } catch (error) {
      throw new UnauthorizedException('Token malformado o expirado');
    }

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

    const { data: cliente, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', decoded.sub)
      .eq('id_tienda', tenant.id)
      .eq('activo', true)
      .single();

    if (error || !cliente) {
      throw new UnauthorizedException('Cliente no encontrado o inactivo');
    }

    // Verificar que el email esté validado
    if (!cliente.email_validado) {
      throw new UnauthorizedException('Debes validar tu email antes de poder acceder. Revisa tu bandeja de entrada.');
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
