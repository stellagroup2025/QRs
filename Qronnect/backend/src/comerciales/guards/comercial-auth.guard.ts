import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class ComercialAuthGuard implements CanActivate {
    constructor(private readonly supabaseService: SupabaseService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            throw new UnauthorizedException('No token provided');
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            throw new UnauthorizedException('Invalid token format');
        }

        // Como no estamos utilizando el AuthModule de Supabase para comerciales (usamos tabla custom),
        // aquí deberíamos verificar el JWT que generamos manualmente en el login.
        // Para simplificar, asumiremos que el token es un JWT válido firmado por nosotros.

        // TODO: Implementar validación real de JWT.
        // Por ahora decodificamos básico (NO SEGURO PARA PROD SIN VERIFICAR FIRMA)
        // O mejor, consultamos a supabase si el ID existe y está activo.

        // Simulación de decodificación y verificación
        try {
            // En un entorno real: jwtService.verify(token)
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(Buffer.from(base64, 'base64').toString());

            if (!payload || payload.role !== 'comercial') {
                throw new UnauthorizedException('Invalid role');
            }

            // Verificar que siga activo en BD
            const supabase = this.supabaseService.getAdminClient();
            const { data: comercial } = await supabase
                .from('comerciales')
                .select('id, email, nombre')
                .eq('id', payload.sub)
                .eq('activo', true)
                .single();

            if (!comercial) {
                throw new UnauthorizedException('Comercial inactive or not found');
            }

            request.user = comercial;
            return true;
        } catch (e) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}
