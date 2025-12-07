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
            if (!base64Url) {
                console.log('⛔ [ComercialAuthGuard] Token malformed (no payload part)', token);
                throw new UnauthorizedException('Invalid token format');
            }

            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            console.log('🔍 [ComercialAuthGuard] Decoding payload:', base64.substring(0, 10) + '...');

            const jsonStr = Buffer.from(base64, 'base64').toString();
            const payload = JSON.parse(jsonStr);

            console.log('✅ [ComercialAuthGuard] Payload decoded:', { sub: payload.sub, role: payload.role });

            if (!payload || payload.role !== 'comercial') {
                console.log('⛔ [ComercialAuthGuard] Invalid role or payload', payload);
                throw new UnauthorizedException('Invalid role');
            }

            // Verificar que siga activo en BD
            const supabase = this.supabaseService.getAdminClient();
            const { data: comercial, error } = await supabase
                .from('comerciales')
                .select('id, email, nombre')
                .eq('id', payload.sub)
                .eq('activo', true)
                .single();

            if (error || !comercial) {
                console.log('⛔ [ComercialAuthGuard] Comercial not found or inactive in DB', { id: payload.sub, error });
                throw new UnauthorizedException('Comercial inactive or not found');
            }

            request.user = comercial;
            return true;
        } catch (e) {
            console.error('⛔ [ComercialAuthGuard] Exception:', e.message);
            throw new UnauthorizedException('Invalid token');
        }
    }
}
