import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { JwtTokenService } from '../../auth/jwt-token.service';

@Injectable()
export class ComercialAuthGuard implements CanActivate {
    constructor(
        private readonly supabaseService: SupabaseService,
        private readonly jwtTokenService: JwtTokenService,
    ) { }

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

        try {
            // Verificar y decodificar el JWT firmado
            const payload = this.jwtTokenService.verifyToken(token);

            if (!payload || payload.role !== 'comercial') {
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
                throw new UnauthorizedException('Comercial inactive or not found');
            }

            request.user = comercial;
            return true;
        } catch (e) {
            if (e instanceof UnauthorizedException) {
                throw e;
            }
            throw new UnauthorizedException('Invalid token');
        }
    }
}
